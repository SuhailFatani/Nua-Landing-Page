"""
CMS Page API views — get and update landing page content.
Pages are identified by slug: home | pricing | services | company | blog | book_a_demo
"""
import json
import logging
from datetime import datetime, timezone

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import PageNode
from apps.users.utils import get_client_ip
from apps.analytics.models import AuditLogNode
from middleware.auth import require_auth, require_role

logger = logging.getLogger(__name__)

VALID_SLUGS = {'home', 'pricing', 'services', 'company', 'blog', 'book_a_demo'}


def _log_audit(user_node, action, resource_id, old_val=None, new_val=None, request=None):
    log = AuditLogNode(
        action=action,
        resource='page',
        resource_id=resource_id or '',
        old_value=json.dumps(old_val) if old_val else None,
        new_value=json.dumps(new_val) if new_val else None,
        ip_address=get_client_ip(request) if request else None,
        user_agent=request.META.get('HTTP_USER_AGENT', '') if request else None,
    ).save()
    if user_node:
        user_node.audit_logs.connect(log)


@require_http_methods(['GET'])
def list_pages(request):
    """GET /api/pages/ — All published pages."""
    pages = PageNode.nodes.filter(is_published=True)
    return JsonResponse({'pages': [p.to_dict() for p in pages]})


@require_http_methods(['GET'])
@require_auth
@require_role('ADMIN', 'EDITOR')
def admin_list_pages(request):
    """GET /api/pages/admin/all/ — All pages regardless of published status."""
    pages = PageNode.nodes.all()
    return JsonResponse({'pages': [p.to_dict() for p in pages]})


@require_http_methods(['GET'])
def get_page(request, slug):
    """GET /api/pages/<slug>/ — Get a single published page by slug."""
    try:
        page = PageNode.nodes.get(slug=slug)
    except PageNode.DoesNotExist:
        return JsonResponse({'statusCode': 404, 'error': 'Not Found', 'message': 'Page not found'}, status=404)

    if not page.is_published:
        return JsonResponse({'statusCode': 404, 'error': 'Not Found', 'message': 'Page not found'}, status=404)

    return JsonResponse(page.to_dict())


@csrf_exempt
@require_http_methods(['PUT'])
@require_auth
@require_role('ADMIN', 'EDITOR')
def upsert_page(request, slug):
    """PUT /api/pages/<slug>/ — Create or update a page's content."""
    if slug not in VALID_SLUGS:
        return JsonResponse({'statusCode': 400, 'error': 'Bad Request', 'message': f'Invalid slug. Must be one of: {", ".join(VALID_SLUGS)}'}, status=400)

    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'statusCode': 400, 'error': 'Bad Request', 'message': 'Invalid JSON'}, status=400)

    now = datetime.now(timezone.utc)

    existing = PageNode.nodes.filter(slug=slug)
    if existing:
        page = existing[0]
        old_data = page.to_dict()
        if 'title' in body:
            page.title = body['title']
        if 'metaDesc' in body:
            page.meta_desc = body['metaDesc']
        if 'content' in body:
            page.content = json.dumps(body['content']) if isinstance(body['content'], dict) else body['content']
        if 'isPublished' in body:
            page.is_published = bool(body['isPublished'])
            if body['isPublished'] and not page.published_at:
                page.published_at = now
        page.updated_at = now
        page.save()
        action = 'page.update'
    else:
        page = PageNode(
            slug=slug,
            title=body.get('title', slug.replace('_', ' ').title()),
            meta_desc=body.get('metaDesc', ''),
            content=json.dumps(body['content']) if isinstance(body.get('content'), dict) else (body.get('content') or ''),
            is_published=body.get('isPublished', True),
            published_at=now if body.get('isPublished', True) else None,
        ).save()
        old_data = None
        action = 'page.create'

    _log_audit(request.user_node, action, slug, old_val=old_data, new_val=page.to_dict(), request=request)

    return JsonResponse(page.to_dict())
