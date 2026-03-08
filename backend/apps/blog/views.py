"""
Blog API views — public and admin endpoints.
Public: list published posts, get single post.
Admin (Editor+): create, update, delete posts. Manage tags.
"""
import json
import logging
from datetime import datetime, timezone

import bleach
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from slugify import slugify

from .models import BlogPostNode, TagNode
from apps.users.utils import get_client_ip
from apps.analytics.models import AuditLogNode
from middleware.auth import require_auth, require_role

logger = logging.getLogger(__name__)

ALLOWED_HTML_TAGS = [
    'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img', 'hr',
    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div',
]
ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'title', 'width', 'height'],
    '*': ['class', 'id'],
}


def sanitize_html(content: str) -> str:
    """Sanitize HTML content to prevent XSS."""
    return bleach.clean(content, tags=ALLOWED_HTML_TAGS, attributes=ALLOWED_ATTRIBUTES, strip=True)


def _log_audit(user_node, action, resource_id, old_val=None, new_val=None, request=None):
    log = AuditLogNode(
        action=action,
        resource='post',
        resource_id=resource_id or '',
        old_value=json.dumps(old_val) if old_val else None,
        new_value=json.dumps(new_val) if new_val else None,
        ip_address=get_client_ip(request) if request else None,
        user_agent=request.META.get('HTTP_USER_AGENT', '') if request else None,
    ).save()
    if user_node:
        user_node.audit_logs.connect(log)


def _upsert_tags(tag_names: list) -> list:
    """Find existing or create new TagNodes for a list of tag names."""
    tags = []
    for name in tag_names:
        name = name.strip()
        if not name:
            continue
        slug = slugify(name)
        existing = TagNode.nodes.filter(slug=slug)
        if existing:
            tags.append(existing[0])
        else:
            tag = TagNode(name=name, slug=slug).save()
            tags.append(tag)
    return tags


# ── Public Endpoints ──────────────────────────────────────────────────────────

@require_http_methods(['GET'])
def list_posts(request):
    """GET /api/blog/ — List published posts (paginated, optional tag filter)."""
    page = int(request.GET.get('page', 1))
    limit = int(request.GET.get('limit', 10))
    tag_slug = request.GET.get('tag')
    offset = (page - 1) * limit

    posts = BlogPostNode.nodes.filter(status='PUBLISHED').order_by('-published_at')

    if tag_slug:
        # Filter by tag — collect posts that have this tag
        try:
            tag = TagNode.nodes.get(slug=tag_slug)
            posts = tag.posts.all()
            posts = [p for p in posts if p.status == 'PUBLISHED']
        except TagNode.DoesNotExist:
            posts = []

    all_posts = list(posts)
    total = len(all_posts)
    paginated = all_posts[offset:offset + limit]

    return JsonResponse({
        'posts': [p.to_dict() for p in paginated],
        'total': total,
        'page': page,
        'totalPages': (total + limit - 1) // limit if limit else 1,
    })


@require_http_methods(['GET'])
def get_post(request, slug):
    """GET /api/blog/<slug>/ — Get a single published post and increment view count."""
    try:
        post = BlogPostNode.nodes.get(slug=slug)
    except BlogPostNode.DoesNotExist:
        return JsonResponse({'statusCode': 404, 'error': 'Not Found', 'message': 'Post not found'}, status=404)

    if post.status != 'PUBLISHED':
        return JsonResponse({'statusCode': 404, 'error': 'Not Found', 'message': 'Post not found'}, status=404)

    # Increment view count (fire-and-forget style — no strict consistency needed)
    post.view_count = (post.view_count or 0) + 1
    post.save()

    return JsonResponse(post.to_dict(include_content=True))


# ── Admin Endpoints ───────────────────────────────────────────────────────────

@require_http_methods(['GET'])
@require_auth
@require_role('ADMIN', 'EDITOR')
def admin_list_posts(request):
    """GET /api/blog/admin/all/ — All posts regardless of status (admin/editor only)."""
    page = int(request.GET.get('page', 1))
    limit = int(request.GET.get('limit', 20))
    status_filter = request.GET.get('status')
    offset = (page - 1) * limit

    if status_filter:
        posts = BlogPostNode.nodes.filter(status=status_filter).order_by('-created_at')
    else:
        posts = BlogPostNode.nodes.order_by('-created_at')

    # Editors can only see their own posts
    if request.user_node.role == 'EDITOR':
        posts = [p for p in posts if any(a.uid == request.user_node.uid for a in p.author.all())]

    all_posts = list(posts)
    total = len(all_posts)
    paginated = all_posts[offset:offset + limit]

    return JsonResponse({
        'posts': [p.to_dict() for p in paginated],
        'total': total,
        'page': page,
        'totalPages': (total + limit - 1) // limit if limit else 1,
    })


@csrf_exempt
@require_http_methods(['POST'])
@require_auth
@require_role('ADMIN', 'EDITOR')
def create_post(request):
    """POST /api/blog/ — Create a new blog post."""
    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'statusCode': 400, 'error': 'Bad Request', 'message': 'Invalid JSON'}, status=400)

    title = (body.get('title') or '').strip()
    if not title:
        return JsonResponse({'statusCode': 400, 'error': 'Bad Request', 'message': 'title is required'}, status=400)

    content = sanitize_html(body.get('content') or '')
    slug = body.get('slug') or slugify(title)
    status = body.get('status', 'DRAFT')
    if status not in ('DRAFT', 'PUBLISHED', 'ARCHIVED'):
        status = 'DRAFT'

    # Ensure slug uniqueness
    if BlogPostNode.nodes.filter(slug=slug):
        slug = f"{slug}-{int(datetime.now(timezone.utc).timestamp())}"

    now = datetime.now(timezone.utc)
    post = BlogPostNode(
        title=title,
        slug=slug,
        excerpt=body.get('excerpt') or '',
        content=content,
        status=status,
        published_at=now if status == 'PUBLISHED' else None,
        meta_title=body.get('metaTitle') or '',
        meta_desc=body.get('metaDesc') or '',
    ).save()

    # Link author
    request.user_node.authored_posts.connect(post)

    # Upsert and link tags
    tag_names = body.get('tags') or []
    for tag in _upsert_tags(tag_names):
        post.tags.connect(tag)

    # Link cover image
    cover_id = body.get('coverImageId')
    if cover_id:
        from apps.media.models import MediaNode
        try:
            media = MediaNode.nodes.get(uid=cover_id)
            post.cover_image.connect(media)
        except MediaNode.DoesNotExist:
            pass

    _log_audit(request.user_node, 'post.create', post.uid, new_val={'title': title, 'slug': slug}, request=request)

    return JsonResponse(post.to_dict(include_content=True), status=201)


@csrf_exempt
@require_http_methods(['PATCH'])
@require_auth
@require_role('ADMIN', 'EDITOR')
def update_post(request, uid):
    """PATCH /api/blog/<uid>/ — Update a blog post. Editors can only update their own posts."""
    try:
        post = BlogPostNode.nodes.get(uid=uid)
    except BlogPostNode.DoesNotExist:
        return JsonResponse({'statusCode': 404, 'error': 'Not Found', 'message': 'Post not found'}, status=404)

    # Editors can only edit their own posts
    if request.user_node.role == 'EDITOR':
        author_ids = [a.uid for a in post.author.all()]
        if request.user_node.uid not in author_ids:
            return JsonResponse({'statusCode': 403, 'error': 'Forbidden', 'message': 'You can only edit your own posts'}, status=403)

    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'statusCode': 400, 'error': 'Bad Request', 'message': 'Invalid JSON'}, status=400)

    old_data = post.to_dict(include_content=True)
    now = datetime.now(timezone.utc)

    if 'title' in body:
        post.title = body['title'].strip()
    if 'content' in body:
        post.content = sanitize_html(body['content'])
    if 'excerpt' in body:
        post.excerpt = body['excerpt']
    if 'metaTitle' in body:
        post.meta_title = body['metaTitle']
    if 'metaDesc' in body:
        post.meta_desc = body['metaDesc']
    if 'status' in body and body['status'] in ('DRAFT', 'PUBLISHED', 'ARCHIVED'):
        if body['status'] == 'PUBLISHED' and post.status != 'PUBLISHED':
            post.published_at = now
        post.status = body['status']
    if 'slug' in body:
        new_slug = body['slug']
        if new_slug != post.slug and BlogPostNode.nodes.filter(slug=new_slug):
            return JsonResponse({'statusCode': 409, 'error': 'Conflict', 'message': 'Slug already in use'}, status=409)
        post.slug = new_slug

    post.updated_at = now
    post.save()

    # Update tags
    if 'tags' in body:
        for old_tag in post.tags.all():
            post.tags.disconnect(old_tag)
        for tag in _upsert_tags(body['tags']):
            post.tags.connect(tag)

    # Update cover image
    if 'coverImageId' in body:
        for old_cover in post.cover_image.all():
            post.cover_image.disconnect(old_cover)
        if body['coverImageId']:
            from apps.media.models import MediaNode
            try:
                media = MediaNode.nodes.get(uid=body['coverImageId'])
                post.cover_image.connect(media)
            except MediaNode.DoesNotExist:
                pass

    _log_audit(request.user_node, 'post.update', uid, old_val=old_data, new_val=post.to_dict(), request=request)

    return JsonResponse(post.to_dict(include_content=True))


@csrf_exempt
@require_http_methods(['DELETE'])
@require_auth
@require_role('ADMIN')
def delete_post(request, uid):
    """DELETE /api/blog/<uid>/ — Delete a blog post (admin only)."""
    try:
        post = BlogPostNode.nodes.get(uid=uid)
    except BlogPostNode.DoesNotExist:
        return JsonResponse({'statusCode': 404, 'error': 'Not Found', 'message': 'Post not found'}, status=404)

    old_data = post.to_dict()
    post.delete()

    _log_audit(request.user_node, 'post.delete', uid, old_val=old_data, request=request)

    return JsonResponse({'message': 'Post deleted'})
