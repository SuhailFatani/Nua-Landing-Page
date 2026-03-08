"""
User management API views — list, create, update, delete, audit log.
All endpoints require ADMIN role.
"""
import json
import logging

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import UserNode
from .utils import hash_password, get_client_ip
from middleware.auth import require_auth, require_role
from apps.analytics.models import AuditLogNode

logger = logging.getLogger(__name__)


def _log_audit(user_node, action, resource, resource_id=None, old_val=None, new_val=None, request=None):
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


@require_http_methods(['GET'])
@require_auth
@require_role('ADMIN')
def list_users(request):
    """GET /api/users/ — List all team members."""
    users = UserNode.nodes.all()
    return JsonResponse({'users': [u.to_dict() for u in users], 'total': len(users)})


@csrf_exempt
@require_http_methods(['POST'])
@require_auth
@require_role('ADMIN')
def create_user(request):
    """POST /api/users/ — Create a new team member."""
    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'statusCode': 400, 'error': 'Bad Request', 'message': 'Invalid JSON'}, status=400)

    email = (body.get('email') or '').strip().lower()
    name = (body.get('name') or '').strip()
    password = body.get('password') or ''
    role = body.get('role', 'EDITOR')

    if not email or not name or not password:
        return JsonResponse({'statusCode': 400, 'error': 'Bad Request', 'message': 'email, name, and password are required'}, status=400)

    if role not in ('ADMIN', 'EDITOR', 'VIEWER'):
        return JsonResponse({'statusCode': 400, 'error': 'Bad Request', 'message': 'Invalid role. Must be ADMIN, EDITOR, or VIEWER'}, status=400)

    if len(password) < 8:
        return JsonResponse({'statusCode': 400, 'error': 'Bad Request', 'message': 'Password must be at least 8 characters'}, status=400)

    # Check uniqueness
    if UserNode.nodes.filter(email=email):
        return JsonResponse({'statusCode': 409, 'error': 'Conflict', 'message': 'A user with this email already exists'}, status=409)

    user = UserNode(
        email=email,
        name=name,
        password_hash=hash_password(password),
        role=role,
    ).save()

    _log_audit(request.user_node, 'user.create', 'user', user.uid,
               new_val={'email': email, 'name': name, 'role': role}, request=request)

    return JsonResponse(user.to_dict(), status=201)


@csrf_exempt
@require_http_methods(['PATCH'])
@require_auth
@require_role('ADMIN')
def update_user(request, uid):
    """PATCH /api/users/<uid>/ — Update a team member's role or active status."""
    try:
        target = UserNode.nodes.get(uid=uid)
    except UserNode.DoesNotExist:
        return JsonResponse({'statusCode': 404, 'error': 'Not Found', 'message': 'User not found'}, status=404)

    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'statusCode': 400, 'error': 'Bad Request', 'message': 'Invalid JSON'}, status=400)

    old_data = target.to_dict()
    changed = False

    if 'role' in body:
        if body['role'] not in ('ADMIN', 'EDITOR', 'VIEWER'):
            return JsonResponse({'statusCode': 400, 'error': 'Bad Request', 'message': 'Invalid role'}, status=400)
        target.role = body['role']
        changed = True

    if 'isActive' in body:
        target.is_active = bool(body['isActive'])
        changed = True

    if 'name' in body:
        target.name = body['name'].strip()
        changed = True

    if 'avatarUrl' in body:
        target.avatar_url = body['avatarUrl']
        changed = True

    if changed:
        target.save()
        _log_audit(request.user_node, 'user.update', 'user', uid,
                   old_val=old_data, new_val=target.to_dict(), request=request)

    return JsonResponse(target.to_dict())


@csrf_exempt
@require_http_methods(['DELETE'])
@require_auth
@require_role('ADMIN')
def delete_user(request, uid):
    """DELETE /api/users/<uid>/ — Delete a team member (cannot delete self)."""
    if uid == request.user_node.uid:
        return JsonResponse({'statusCode': 400, 'error': 'Bad Request', 'message': 'Cannot delete your own account'}, status=400)

    try:
        target = UserNode.nodes.get(uid=uid)
    except UserNode.DoesNotExist:
        return JsonResponse({'statusCode': 404, 'error': 'Not Found', 'message': 'User not found'}, status=404)

    old_data = target.to_dict()
    target.delete()

    _log_audit(request.user_node, 'user.delete', 'user', uid, old_val=old_data, request=request)

    return JsonResponse({'message': 'User deleted'})


@require_http_methods(['GET'])
@require_auth
@require_role('ADMIN')
def audit_log(request):
    """GET /api/users/audit-log/ — Paginated audit log."""
    from apps.analytics.models import AuditLogNode

    page = int(request.GET.get('page', 1))
    limit = int(request.GET.get('limit', 20))
    offset = (page - 1) * limit

    all_logs = AuditLogNode.nodes.order_by('-created_at')
    paginated = list(all_logs)[offset:offset + limit]
    total = len(list(AuditLogNode.nodes.all()))

    return JsonResponse({
        'logs': [log.to_dict() for log in paginated],
        'total': total,
        'page': page,
        'totalPages': (total + limit - 1) // limit,
    })
