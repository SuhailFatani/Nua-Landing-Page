"""
Media upload and management API views.
Supports Cloudinary (production) and local disk (development fallback).
"""
import os
import uuid
import logging
import json
from pathlib import Path

from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.files.storage import FileSystemStorage

from .models import MediaNode
from apps.users.utils import get_client_ip
from apps.analytics.models import AuditLogNode
from middleware.auth import require_auth, require_role

logger = logging.getLogger(__name__)

ALLOWED_MIME_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf',
]
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def _log_audit(user_node, action, resource_id, old_val=None, new_val=None, request=None):
    log = AuditLogNode(
        action=action,
        resource='media',
        resource_id=resource_id or '',
        old_value=json.dumps(old_val) if old_val else None,
        new_value=json.dumps(new_val) if new_val else None,
        ip_address=get_client_ip(request) if request else None,
        user_agent=request.META.get('HTTP_USER_AGENT', '') if request else None,
    ).save()
    if user_node:
        user_node.audit_logs.connect(log)


def _upload_to_cloudinary(file_bytes, original_name, mime_type):
    """Upload a file to Cloudinary and return (url, public_id)."""
    import cloudinary.uploader
    import cloudinary

    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
    )

    result = cloudinary.uploader.upload(
        file_bytes,
        public_id=f"nua/{uuid.uuid4()}",
        resource_type='auto',
    )
    return result['secure_url'], result['public_id']


def _upload_to_local(file, original_name):
    """Save file to local disk and return (url, public_id)."""
    uploads_dir = settings.MEDIA_ROOT
    uploads_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(original_name).suffix
    filename = f"{uuid.uuid4()}{ext}"
    file_path = uploads_dir / filename

    with open(file_path, 'wb') as f:
        for chunk in file.chunks():
            f.write(chunk)

    url = f"{settings.MEDIA_URL}{filename}"
    return url, filename


@require_http_methods(['GET'])
@require_auth
@require_role('ADMIN', 'EDITOR')
def list_media(request):
    """GET /api/media/ — List all uploaded media files."""
    page = int(request.GET.get('page', 1))
    limit = int(request.GET.get('limit', 20))
    offset = (page - 1) * limit

    all_media = list(MediaNode.nodes.order_by('-created_at'))
    total = len(all_media)
    paginated = all_media[offset:offset + limit]

    return JsonResponse({
        'media': [m.to_dict() for m in paginated],
        'total': total,
        'page': page,
        'totalPages': (total + limit - 1) // limit if limit else 1,
    })


@csrf_exempt
@require_http_methods(['POST'])
@require_auth
@require_role('ADMIN', 'EDITOR')
def upload_media(request):
    """POST /api/media/upload/ — Upload a file to Cloudinary or local disk."""
    if 'file' not in request.FILES:
        return JsonResponse({'statusCode': 400, 'error': 'Bad Request', 'message': 'No file provided'}, status=400)

    file = request.FILES['file']
    original_name = file.name
    mime_type = file.content_type
    file_size = file.size

    # Validate
    if mime_type not in ALLOWED_MIME_TYPES:
        return JsonResponse(
            {'statusCode': 400, 'error': 'Bad Request', 'message': f'File type not allowed: {mime_type}'},
            status=400
        )

    if file_size > MAX_FILE_SIZE:
        return JsonResponse(
            {'statusCode': 400, 'error': 'Bad Request', 'message': 'File size exceeds 10 MB limit'},
            status=400
        )

    # Upload
    cloudinary_configured = bool(settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY)

    if cloudinary_configured:
        try:
            file_bytes = file.read()
            url, public_id = _upload_to_cloudinary(file_bytes, original_name, mime_type)
            storage = 'cloudinary'
        except Exception as e:
            logger.warning(f"Cloudinary upload failed, falling back to local: {e}")
            file.seek(0)
            url, public_id = _upload_to_local(file, original_name)
            storage = 'local'
    else:
        url, public_id = _upload_to_local(file, original_name)
        storage = 'local'

    # Extract image dimensions if applicable
    width = height = None
    if mime_type.startswith('image/') and mime_type != 'image/svg+xml':
        try:
            from PIL import Image
            import io
            file.seek(0)
            img = Image.open(io.BytesIO(file.read()))
            width, height = img.size
        except Exception:
            pass

    media = MediaNode(
        filename=public_id,
        original_name=original_name,
        mime_type=mime_type,
        size=file_size,
        url=url,
        public_id=public_id,
        alt=request.POST.get('alt', ''),
        width=width,
        height=height,
        storage=storage,
    ).save()

    _log_audit(request.user_node, 'media.upload', media.uid, new_val={'originalName': original_name, 'url': url}, request=request)

    return JsonResponse(media.to_dict(), status=201)


@csrf_exempt
@require_http_methods(['PATCH'])
@require_auth
@require_role('ADMIN', 'EDITOR')
def update_media(request, uid):
    """PATCH /api/media/<uid>/ — Update alt text or other metadata."""
    try:
        media = MediaNode.nodes.get(uid=uid)
    except MediaNode.DoesNotExist:
        return JsonResponse({'statusCode': 404, 'error': 'Not Found', 'message': 'Media not found'}, status=404)

    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'statusCode': 400, 'error': 'Bad Request', 'message': 'Invalid JSON'}, status=400)

    old_data = media.to_dict()
    if 'alt' in body:
        media.alt = body['alt']
    media.save()

    _log_audit(request.user_node, 'media.update', uid, old_val=old_data, new_val=media.to_dict(), request=request)

    return JsonResponse(media.to_dict())


@csrf_exempt
@require_http_methods(['DELETE'])
@require_auth
@require_role('ADMIN')
def delete_media(request, uid):
    """DELETE /api/media/<uid>/ — Delete file from Cloudinary/disk and remove node."""
    try:
        media = MediaNode.nodes.get(uid=uid)
    except MediaNode.DoesNotExist:
        return JsonResponse({'statusCode': 404, 'error': 'Not Found', 'message': 'Media not found'}, status=404)

    old_data = media.to_dict()

    # Delete from Cloudinary
    if media.storage == 'cloudinary' and settings.CLOUDINARY_API_KEY:
        try:
            import cloudinary.uploader
            cloudinary.uploader.destroy(media.public_id)
        except Exception as e:
            logger.warning(f"Failed to delete from Cloudinary: {e}")

    # Delete local file
    elif media.storage == 'local':
        local_path = settings.MEDIA_ROOT / media.public_id
        if local_path.exists():
            local_path.unlink()

    media.delete()

    _log_audit(request.user_node, 'media.delete', uid, old_val=old_data, request=request)

    return JsonResponse({'message': 'Media deleted'})
