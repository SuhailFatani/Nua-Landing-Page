"""
Authentication API views — login, refresh, logout, me, change-password.
Matches the Fastify auth.ts behavior exactly (same error messages, lockout logic,
token family rotation for theft detection).
"""
import json
import logging
from datetime import datetime, timezone, timedelta

from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import UserNode, RefreshTokenNode
from .utils import (
    verify_password, hash_password, generate_access_token,
    generate_refresh_token, hash_token, generate_token_family,
    get_client_ip, set_refresh_cookie, clear_refresh_cookie
)
from middleware.auth import require_auth
from apps.analytics.models import AuditLogNode

logger = logging.getLogger(__name__)


def _log_audit(user_node, action, resource, resource_id=None, old_val=None, new_val=None, request=None):
    """Create an AuditLogNode and link it to the user."""
    log = AuditLogNode(
        action=action,
        resource=resource,
        resource_id=resource_id or '',
        old_value=json.dumps(old_val) if old_val else None,
        new_value=json.dumps(new_val) if new_val else None,
        ip_address=get_client_ip(request) if request else None,
        user_agent=request.META.get('HTTP_USER_AGENT', '') if request else None,
    ).save()
    if user_node:
        user_node.audit_logs.connect(log)


@csrf_exempt
@require_http_methods(['POST'])
def login(request):
    """
    POST /api/auth/login/
    Body: { email, password }
    Returns: { accessToken, user } + sets refresh_token cookie
    Implements: Argon2id verify, lockout after 5 failures, token family creation.
    """
    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'statusCode': 400, 'error': 'Bad Request', 'message': 'Invalid JSON'}, status=400)

    email = (body.get('email') or '').strip().lower()
    password = body.get('password') or ''

    if not email or not password:
        return JsonResponse({'statusCode': 400, 'error': 'Bad Request', 'message': 'Email and password are required'}, status=400)

    # Find user — do dummy hash if not found (timing attack prevention)
    try:
        user = UserNode.nodes.get(email=email)
    except UserNode.DoesNotExist:
        verify_password('$argon2id$v=19$m=19456,t=2,p=1$dummy', 'dummy')
        return JsonResponse({'statusCode': 401, 'error': 'Unauthorized', 'message': 'Invalid email or password'}, status=401)

    # Check account lockout
    now = datetime.now(timezone.utc)
    if user.locked_until and user.locked_until > now:
        wait_minutes = int((user.locked_until - now).total_seconds() / 60) + 1
        return JsonResponse(
            {'statusCode': 401, 'error': 'Unauthorized', 'message': f'Account locked. Try again in {wait_minutes} minutes.'},
            status=401
        )

    if not user.is_active:
        return JsonResponse({'statusCode': 401, 'error': 'Unauthorized', 'message': 'Account is inactive'}, status=401)

    # Verify password
    if not verify_password(user.password_hash, password):
        user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
        if user.failed_login_attempts >= 5:
            user.locked_until = now + timedelta(minutes=15)
        user.save()
        return JsonResponse({'statusCode': 401, 'error': 'Unauthorized', 'message': 'Invalid email or password'}, status=401)

    # Successful login — reset lockout counters
    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login_at = now
    user.last_login_ip = get_client_ip(request)
    user.save()

    # Generate tokens
    access_token = generate_access_token(user)
    refresh_value = generate_refresh_token()
    family = generate_token_family()

    # Store hashed refresh token
    expires_at = now + settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME']
    rt = RefreshTokenNode(
        token_hash=hash_token(refresh_value),
        expires_at=expires_at,
        family=family,
    ).save()
    user.refresh_tokens.connect(rt)

    _log_audit(user, 'auth.login', 'user', user.uid, request=request)

    response = JsonResponse({'accessToken': access_token, 'user': user.to_dict()})
    set_refresh_cookie(response, refresh_value)
    return response


@csrf_exempt
@require_http_methods(['POST'])
def refresh(request):
    """
    POST /api/auth/refresh/
    Reads refresh_token from cookie, rotates it, returns new accessToken.
    Implements token family theft detection: if an already-used token is
    presented, revoke the entire family (all sessions for that user).
    """
    refresh_value = request.COOKIES.get('refresh_token')
    if not refresh_value:
        return JsonResponse({'statusCode': 401, 'error': 'Unauthorized', 'message': 'No refresh token'}, status=401)

    token_hash = hash_token(refresh_value)
    now = datetime.now(timezone.utc)

    try:
        rt = RefreshTokenNode.nodes.get(token_hash=token_hash)
    except RefreshTokenNode.DoesNotExist:
        # Token not found — possible theft. We cannot identify the family,
        # so just reject the request.
        response = JsonResponse({'statusCode': 401, 'error': 'Unauthorized', 'message': 'Invalid refresh token'}, status=401)
        clear_refresh_cookie(response)
        return response

    # Check if token has been revoked (theft detection)
    if rt.revoked_at is not None:
        # Revoke all tokens in the same family
        family = rt.family
        for old_rt in RefreshTokenNode.nodes.filter(family=family):
            if old_rt.revoked_at is None:
                old_rt.revoked_at = now
                old_rt.save()
        response = JsonResponse(
            {'statusCode': 401, 'error': 'Unauthorized', 'message': 'Token reuse detected. All sessions invalidated.'},
            status=401
        )
        clear_refresh_cookie(response)
        return response

    # Check expiry
    if rt.expires_at < now:
        response = JsonResponse({'statusCode': 401, 'error': 'Unauthorized', 'message': 'Refresh token expired'}, status=401)
        clear_refresh_cookie(response)
        return response

    # Get user
    owner_nodes = rt.owner.all()
    if not owner_nodes:
        response = JsonResponse({'statusCode': 401, 'error': 'Unauthorized', 'message': 'Invalid refresh token'}, status=401)
        clear_refresh_cookie(response)
        return response

    user = owner_nodes[0]
    if not user.is_active:
        response = JsonResponse({'statusCode': 401, 'error': 'Unauthorized', 'message': 'Account inactive'}, status=401)
        clear_refresh_cookie(response)
        return response

    # Revoke old token, issue new one (same family)
    rt.revoked_at = now
    rt.save()

    new_refresh_value = generate_refresh_token()
    new_expires_at = now + settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME']
    new_rt = RefreshTokenNode(
        token_hash=hash_token(new_refresh_value),
        expires_at=new_expires_at,
        family=rt.family,   # same family — enables theft detection chain
    ).save()
    user.refresh_tokens.connect(new_rt)

    new_access_token = generate_access_token(user)

    response = JsonResponse({'accessToken': new_access_token, 'user': user.to_dict()})
    set_refresh_cookie(response, new_refresh_value)
    return response


@csrf_exempt
@require_http_methods(['POST'])
@require_auth
def logout(request):
    """
    POST /api/auth/logout/
    Revokes the current refresh token cookie.
    """
    refresh_value = request.COOKIES.get('refresh_token')
    if refresh_value:
        token_hash = hash_token(refresh_value)
        try:
            rt = RefreshTokenNode.nodes.get(token_hash=token_hash)
            now = datetime.now(timezone.utc)
            rt.revoked_at = now
            rt.save()
        except RefreshTokenNode.DoesNotExist:
            pass

    _log_audit(request.user_node, 'auth.logout', 'user', request.user_node.uid, request=request)

    response = JsonResponse({'message': 'Logged out successfully'})
    clear_refresh_cookie(response)
    return response


@csrf_exempt
@require_http_methods(['POST'])
@require_auth
def logout_all(request):
    """
    POST /api/auth/logout-all/
    Revokes ALL refresh tokens for the authenticated user.
    """
    now = datetime.now(timezone.utc)
    for rt in request.user_node.refresh_tokens.all():
        if rt.revoked_at is None:
            rt.revoked_at = now
            rt.save()

    _log_audit(request.user_node, 'auth.logout_all', 'user', request.user_node.uid, request=request)

    response = JsonResponse({'message': 'All sessions invalidated'})
    clear_refresh_cookie(response)
    return response


@require_http_methods(['GET'])
@require_auth
def me(request):
    """GET /api/auth/me/ — Returns the current authenticated user's profile."""
    return JsonResponse(request.user_node.to_dict())


@csrf_exempt
@require_http_methods(['POST'])
@require_auth
def change_password(request):
    """
    POST /api/auth/change-password/
    Body: { currentPassword, newPassword }
    Verifies current password, updates hash, revokes all sessions.
    """
    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'statusCode': 400, 'error': 'Bad Request', 'message': 'Invalid JSON'}, status=400)

    current_password = body.get('currentPassword') or ''
    new_password = body.get('newPassword') or ''

    if not current_password or not new_password:
        return JsonResponse({'statusCode': 400, 'error': 'Bad Request', 'message': 'Both currentPassword and newPassword are required'}, status=400)

    if len(new_password) < 8:
        return JsonResponse({'statusCode': 400, 'error': 'Bad Request', 'message': 'New password must be at least 8 characters'}, status=400)

    user = request.user_node
    if not verify_password(user.password_hash, current_password):
        return JsonResponse({'statusCode': 401, 'error': 'Unauthorized', 'message': 'Current password is incorrect'}, status=401)

    # Update password
    user.password_hash = hash_password(new_password)
    user.save()

    # Revoke all refresh tokens (force re-login on all devices)
    now = datetime.now(timezone.utc)
    for rt in user.refresh_tokens.all():
        if rt.revoked_at is None:
            rt.revoked_at = now
            rt.save()

    _log_audit(user, 'auth.change_password', 'user', user.uid, request=request)

    response = JsonResponse({'message': 'Password updated. Please log in again.'})
    clear_refresh_cookie(response)
    return response
