"""
JWT authentication middleware.
Reads Bearer token from Authorization header, verifies it,
and attaches the UserNode to request.user_node.
"""
import jwt
from django.conf import settings
from django.http import JsonResponse
from apps.users.models import UserNode


class JWTAuthMiddleware:
    """Attaches request.user_node if a valid Bearer token is present."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.user_node = None
        auth_header = request.headers.get('Authorization', '')

        if auth_header.startswith('Bearer '):
            token = auth_header[7:]
            try:
                payload = jwt.decode(
                    token,
                    settings.SIMPLE_JWT['SIGNING_KEY'],
                    algorithms=[settings.SIMPLE_JWT['ALGORITHM']],
                )
                uid = payload.get('uid')
                if uid:
                    try:
                        user = UserNode.nodes.get(uid=uid)
                        if user.is_active:
                            request.user_node = user
                    except UserNode.DoesNotExist:
                        pass
            except jwt.ExpiredSignatureError:
                pass
            except jwt.InvalidTokenError:
                pass

        return self.get_response(request)


def require_auth(view_func):
    """Decorator: returns 401 if no authenticated user_node on request."""
    def wrapper(request, *args, **kwargs):
        if not request.user_node:
            return JsonResponse(
                {'statusCode': 401, 'error': 'Unauthorized', 'message': 'Authentication required'},
                status=401
            )
        return view_func(request, *args, **kwargs)
    return wrapper


def require_role(*roles):
    """Decorator: returns 403 if user_node role is not in the allowed roles."""
    def decorator(view_func):
        def wrapper(request, *args, **kwargs):
            if not request.user_node:
                return JsonResponse(
                    {'statusCode': 401, 'error': 'Unauthorized', 'message': 'Authentication required'},
                    status=401
                )
            if request.user_node.role not in roles:
                return JsonResponse(
                    {'statusCode': 403, 'error': 'Forbidden', 'message': 'Insufficient permissions'},
                    status=403
                )
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator
