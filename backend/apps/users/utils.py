"""
Security utilities for the users app.
- Argon2id password hashing (OWASP 2025 parameters)
- JWT token generation
- Refresh token family management
- IP hashing (GDPR-safe)
"""
import hashlib
import hmac
import uuid
import json
from datetime import datetime, timezone, timedelta

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHashError
from django.conf import settings


# Argon2id with OWASP 2025 recommended parameters
_ph = PasswordHasher(
    memory_cost=19456,   # 19 MiB
    time_cost=2,
    parallelism=1,
    hash_len=32,
    salt_len=16,
)


def hash_password(password: str) -> str:
    """Hash a plaintext password with Argon2id."""
    return _ph.hash(password)


def verify_password(stored_hash: str, password: str) -> bool:
    """Verify a password against a stored Argon2id hash."""
    try:
        return _ph.verify(stored_hash, password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def needs_rehash(stored_hash: str) -> bool:
    """Check if a stored hash needs to be upgraded to new parameters."""
    return _ph.check_needs_rehash(stored_hash)


def generate_access_token(user_node) -> str:
    """Generate a short-lived JWT access token (15 minutes)."""
    now = datetime.now(timezone.utc)
    payload = {
        'uid': user_node.uid,
        'email': user_node.email,
        'role': user_node.role,
        'iat': now,
        'exp': now + settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
        'type': 'access',
    }
    return jwt.encode(
        payload,
        settings.SIMPLE_JWT['SIGNING_KEY'],
        algorithm=settings.SIMPLE_JWT['ALGORITHM'],
    )


def generate_refresh_token() -> str:
    """Generate a random UUID to use as a refresh token value."""
    return str(uuid.uuid4())


def hash_token(token: str) -> str:
    """SHA-256 hash a token for safe storage (never store raw tokens)."""
    return hashlib.sha256(token.encode()).hexdigest()


def hash_ip(ip_address: str) -> str:
    """HMAC-SHA256 hash an IP address using the configured salt (GDPR-safe)."""
    salt = settings.IP_HASH_SALT.encode()
    return hmac.new(salt, ip_address.encode(), hashlib.sha256).hexdigest()


def generate_token_family() -> str:
    """Generate a unique family ID for refresh token rotation tracking."""
    return str(uuid.uuid4())


def get_client_ip(request) -> str:
    """Extract the real client IP from the request, respecting proxies."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '0.0.0.0')


def set_refresh_cookie(response, token: str):
    """Attach the refresh token as an httpOnly cookie."""
    max_age = int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds())
    response.set_cookie(
        'refresh_token',
        token,
        max_age=max_age,
        httponly=True,
        secure=not settings.DEBUG,
        samesite='Strict',
        path='/api/auth/',
    )


def clear_refresh_cookie(response):
    """Remove the refresh token cookie."""
    response.delete_cookie('refresh_token', path='/api/auth/')
