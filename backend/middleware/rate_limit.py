"""
Simple in-memory rate limiting middleware.
Uses a sliding window counter per IP address.
In production, replace with Redis-backed rate limiting (django-ratelimit).
"""
import time
from collections import defaultdict
from threading import Lock
from django.http import JsonResponse


class RateLimitMiddleware:
    # Global rate: 120 requests per minute
    GLOBAL_LIMIT = 120
    GLOBAL_WINDOW = 60  # seconds

    # Auth-specific rate: 5 requests per 15 minutes per IP
    AUTH_LIMIT = 5
    AUTH_WINDOW = 900  # 15 minutes

    def __init__(self, get_response):
        self.get_response = get_response
        self._global_store = defaultdict(list)
        self._auth_store = defaultdict(list)
        self._lock = Lock()

    def __call__(self, request):
        ip = self._get_ip(request)
        now = time.time()

        # Check auth-specific limit on login endpoint
        if request.path == '/api/auth/login/' and request.method == 'POST':
            if not self._check_rate(self._auth_store, ip, now, self.AUTH_LIMIT, self.AUTH_WINDOW):
                return JsonResponse(
                    {'statusCode': 429, 'error': 'Too Many Requests', 'message': 'Too many login attempts. Try again in 15 minutes.'},
                    status=429
                )

        # Check global rate limit
        if not self._check_rate(self._global_store, ip, now, self.GLOBAL_LIMIT, self.GLOBAL_WINDOW):
            return JsonResponse(
                {'statusCode': 429, 'error': 'Too Many Requests', 'message': 'Rate limit exceeded. Please slow down.'},
                status=429
            )

        return self.get_response(request)

    def _check_rate(self, store, key, now, limit, window):
        with self._lock:
            # Remove timestamps outside the window
            store[key] = [t for t in store[key] if now - t < window]
            if len(store[key]) >= limit:
                return False
            store[key].append(now)
            return True

    def _get_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '0.0.0.0')
