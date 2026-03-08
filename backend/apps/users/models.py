"""
Neomodel node definitions for User and RefreshToken.
These map to Neo4j graph nodes replacing the Prisma User + RefreshToken models.
"""
from neomodel import (
    StructuredNode,
    StringProperty,
    BooleanProperty,
    IntegerProperty,
    DateTimeProperty,
    UniqueIdProperty,
    RelationshipTo,
    RelationshipFrom,
    ZeroOrMore,
)


class UserNode(StructuredNode):
    """Represents a CMS team member (admin, editor, or viewer)."""

    __label__ = 'User'

    uid = UniqueIdProperty()
    email = StringProperty(unique_index=True, required=True)
    password_hash = StringProperty(required=True)
    name = StringProperty(required=True)
    role = StringProperty(default='EDITOR')          # ADMIN | EDITOR | VIEWER
    avatar_url = StringProperty()
    is_active = BooleanProperty(default=True)

    # Brute-force lockout tracking
    failed_login_attempts = IntegerProperty(default=0)
    locked_until = DateTimeProperty()
    last_login_at = DateTimeProperty()
    last_login_ip = StringProperty()

    created_at = DateTimeProperty(default_now=True)
    updated_at = DateTimeProperty(default_now=True)

    # Relationships
    refresh_tokens = RelationshipTo('RefreshTokenNode', 'HAS_REFRESH_TOKEN')
    authored_posts = RelationshipTo('apps.blog.models.BlogPostNode', 'AUTHORED')
    audit_logs = RelationshipTo('apps.analytics.models.AuditLogNode', 'PERFORMED')

    def to_dict(self):
        return {
            'id': self.uid,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'avatarUrl': self.avatar_url,
            'isActive': self.is_active,
            'lastLoginAt': self.last_login_at.isoformat() if self.last_login_at else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }


class RefreshTokenNode(StructuredNode):
    """Stores hashed refresh tokens with family tracking for theft detection."""

    __label__ = 'RefreshToken'

    uid = UniqueIdProperty()
    token_hash = StringProperty(unique_index=True, required=True)
    expires_at = DateTimeProperty(required=True)
    revoked_at = DateTimeProperty()
    family = StringProperty(index=True, required=True)   # Token family for theft detection
    created_at = DateTimeProperty(default_now=True)

    owner = RelationshipFrom('UserNode', 'HAS_REFRESH_TOKEN')
