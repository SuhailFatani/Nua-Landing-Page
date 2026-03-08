"""
Analytics API views.
- Public: track page views and custom events (fire-and-forget).
- Admin/Editor: dashboard aggregates, realtime activity.
- Public: demo booking form submission.
"""
import json
import logging
import hashlib
import hmac
from datetime import datetime, timezone, timedelta

from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from neomodel import db

from .models import PageViewNode, EventNode, DemoBookingNode
from apps.users.utils import get_client_ip, hash_ip
from middleware.auth import require_auth, require_role

logger = logging.getLogger(__name__)


# ── Public Endpoints ──────────────────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['POST'])
def track_pageview(request):
    """POST /api/analytics/pageview/ — Record a page view. Fire-and-forget."""
    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'ok': True})   # Never fail the client

    ip = get_client_ip(request)
    PageViewNode(
        page=body.get('page', '/'),
        ip_hash=hash_ip(ip),
        referrer=body.get('referrer', ''),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        session_id=body.get('sessionId', ''),
    ).save()

    return JsonResponse({'ok': True})


@csrf_exempt
@require_http_methods(['POST'])
def track_event(request):
    """POST /api/analytics/event/ — Record a custom analytics event. Fire-and-forget."""
    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'ok': True})

    ip = get_client_ip(request)
    metadata = body.get('metadata')

    EventNode(
        type=body.get('type', 'unknown'),
        page=body.get('page', '/'),
        label=body.get('label', ''),
        metadata=json.dumps(metadata) if metadata else None,
        session_id=body.get('sessionId', ''),
        ip_hash=hash_ip(ip),
    ).save()

    return JsonResponse({'ok': True})


@csrf_exempt
@require_http_methods(['POST'])
def submit_booking(request):
    """POST /api/analytics/booking/ — Submit the book-a-demo form."""
    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'statusCode': 400, 'error': 'Bad Request', 'message': 'Invalid JSON'}, status=400)

    name = (body.get('name') or '').strip()
    email = (body.get('email') or '').strip().lower()

    if not name or not email:
        return JsonResponse({'statusCode': 400, 'error': 'Bad Request', 'message': 'name and email are required'}, status=400)

    booking = DemoBookingNode(
        name=name,
        email=email,
        company=body.get('company', ''),
        phone=body.get('phone', ''),
        message=body.get('message', ''),
        source=body.get('source', ''),
        status='NEW',
    ).save()

    # Also track as an analytics event
    EventNode(
        type='demo_booking_submitted',
        page=body.get('source', '/book-a-demo'),
        label=email,
        metadata=json.dumps({'company': body.get('company', '')}),
        ip_hash=hash_ip(get_client_ip(request)),
    ).save()

    return JsonResponse({'ok': True, 'id': booking.uid}, status=201)


# ── Admin Endpoints ───────────────────────────────────────────────────────────

@require_http_methods(['GET'])
@require_auth
@require_role('ADMIN', 'EDITOR')
def dashboard(request):
    """
    GET /api/analytics/dashboard/ — Aggregated analytics dashboard.
    Uses raw Cypher queries because Neomodel ORM doesn't support aggregations.
    """
    days = int(request.GET.get('days', 30))
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

    # Total page views
    results, _ = db.cypher_query(
        "MATCH (n:PageView) WHERE n.created_at >= $since RETURN count(n) AS total",
        {'since': since}
    )
    total_views = results[0][0] if results else 0

    # Unique visitors (distinct ip_hash)
    results, _ = db.cypher_query(
        "MATCH (n:PageView) WHERE n.created_at >= $since RETURN count(DISTINCT n.ip_hash) AS unique",
        {'since': since}
    )
    unique_visitors = results[0][0] if results else 0

    # Top pages
    results, _ = db.cypher_query(
        """
        MATCH (n:PageView) WHERE n.created_at >= $since
        RETURN n.page AS page, count(n) AS views
        ORDER BY views DESC LIMIT 10
        """,
        {'since': since}
    )
    top_pages = [{'page': r[0], 'views': r[1]} for r in results]

    # Events by type
    results, _ = db.cypher_query(
        """
        MATCH (n:Event) WHERE n.created_at >= $since
        RETURN n.type AS type, count(n) AS count
        ORDER BY count DESC LIMIT 20
        """,
        {'since': since}
    )
    events_by_type = [{'type': r[0], 'count': r[1]} for r in results]

    # Demo bookings by status
    results, _ = db.cypher_query(
        "MATCH (n:DemoBooking) RETURN n.status AS status, count(n) AS count"
    )
    bookings_by_status = {r[0]: r[1] for r in results}

    # Recent demo bookings
    results, _ = db.cypher_query(
        """
        MATCH (n:DemoBooking)
        RETURN n.uid, n.name, n.email, n.company, n.status, n.created_at
        ORDER BY n.created_at DESC LIMIT 10
        """
    )
    recent_bookings = [
        {'id': r[0], 'name': r[1], 'email': r[2], 'company': r[3], 'status': r[4], 'createdAt': str(r[5])}
        for r in results
    ]

    # Daily views (last N days)
    results, _ = db.cypher_query(
        """
        MATCH (n:PageView) WHERE n.created_at >= $since
        RETURN date(n.created_at) AS day, count(n) AS views
        ORDER BY day ASC
        """,
        {'since': since}
    )
    daily_views = [{'date': str(r[0]), 'views': r[1]} for r in results]

    return JsonResponse({
        'period': f'{days}d',
        'totalViews': total_views,
        'uniqueVisitors': unique_visitors,
        'topPages': top_pages,
        'eventsByType': events_by_type,
        'bookingsByStatus': bookings_by_status,
        'recentBookings': recent_bookings,
        'dailyViews': daily_views,
    })


@require_http_methods(['GET'])
@require_auth
@require_role('ADMIN', 'EDITOR')
def realtime(request):
    """GET /api/analytics/realtime/ — Last 30 minutes of activity."""
    since = (datetime.now(timezone.utc) - timedelta(minutes=30)).isoformat()

    results, _ = db.cypher_query(
        "MATCH (n:PageView) WHERE n.created_at >= $since RETURN count(n) AS views",
        {'since': since}
    )
    views_30m = results[0][0] if results else 0

    results, _ = db.cypher_query(
        "MATCH (n:PageView) WHERE n.created_at >= $since RETURN count(DISTINCT n.ip_hash) AS unique",
        {'since': since}
    )
    unique_30m = results[0][0] if results else 0

    results, _ = db.cypher_query(
        """
        MATCH (n:PageView) WHERE n.created_at >= $since
        RETURN n.page AS page, count(n) AS views
        ORDER BY views DESC LIMIT 5
        """,
        {'since': since}
    )
    active_pages = [{'page': r[0], 'views': r[1]} for r in results]

    return JsonResponse({
        'window': '30m',
        'views': views_30m,
        'uniqueVisitors': unique_30m,
        'activePages': active_pages,
    })


@require_http_methods(['GET'])
@require_auth
@require_role('ADMIN', 'EDITOR')
def list_bookings(request):
    """GET /api/analytics/bookings/ — List demo bookings."""
    page = int(request.GET.get('page', 1))
    limit = int(request.GET.get('limit', 20))
    status_filter = request.GET.get('status')
    offset = (page - 1) * limit

    if status_filter:
        all_bookings = list(DemoBookingNode.nodes.filter(status=status_filter).order_by('-created_at'))
    else:
        all_bookings = list(DemoBookingNode.nodes.order_by('-created_at'))

    total = len(all_bookings)
    paginated = all_bookings[offset:offset + limit]

    return JsonResponse({
        'bookings': [b.to_dict() for b in paginated],
        'total': total,
        'page': page,
        'totalPages': (total + limit - 1) // limit if limit else 1,
    })
