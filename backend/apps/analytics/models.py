"""
Neomodel node definitions for analytics tracking.
PageView, Event, DemoBooking, and AuditLog nodes.
"""
from neomodel import (
    StructuredNode,
    StringProperty,
    DateTimeProperty,
    UniqueIdProperty,
    RelationshipFrom,
)


class PageViewNode(StructuredNode):
    """Records a single page view — IP is hashed for GDPR compliance."""

    __label__ = 'PageView'

    uid = UniqueIdProperty()
    page = StringProperty(required=True, index=True)
    ip_hash = StringProperty(required=True)
    referrer = StringProperty()
    user_agent = StringProperty()
    country = StringProperty()
    session_id = StringProperty()
    created_at = DateTimeProperty(default_now=True)


class EventNode(StructuredNode):
    """Records a custom analytics event (CTA click, form submit, etc.)."""

    __label__ = 'Event'

    uid = UniqueIdProperty()
    type = StringProperty(required=True, index=True)  # e.g. cta_click, demo_booking_submitted
    page = StringProperty(required=True, index=True)
    label = StringProperty()
    metadata = StringProperty()   # JSON string
    session_id = StringProperty()
    ip_hash = StringProperty()
    created_at = DateTimeProperty(default_now=True)


class DemoBookingNode(StructuredNode):
    """A lead captured from the book-a-demo form."""

    __label__ = 'DemoBooking'

    uid = UniqueIdProperty()
    name = StringProperty(required=True)
    email = StringProperty(required=True)
    company = StringProperty()
    phone = StringProperty()
    message = StringProperty()
    status = StringProperty(default='NEW')  # NEW | CONTACTED | COMPLETED | CANCELLED
    source = StringProperty()               # which page the form was on
    notes = StringProperty()
    created_at = DateTimeProperty(default_now=True)
    updated_at = DateTimeProperty(default_now=True)

    def to_dict(self):
        return {
            'id': self.uid,
            'name': self.name,
            'email': self.email,
            'company': self.company,
            'phone': self.phone,
            'message': self.message,
            'status': self.status,
            'source': self.source,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }


class AuditLogNode(StructuredNode):
    """Tracks all create/update/delete actions performed in the CMS."""

    __label__ = 'AuditLog'

    uid = UniqueIdProperty()
    action = StringProperty(required=True)     # e.g. post.create, media.delete
    resource = StringProperty(required=True)
    resource_id = StringProperty()
    old_value = StringProperty()               # JSON string
    new_value = StringProperty()               # JSON string
    ip_address = StringProperty()
    user_agent = StringProperty()
    created_at = DateTimeProperty(default_now=True)

    # Who performed the action
    performed_by = RelationshipFrom('apps.users.models.UserNode', 'PERFORMED')

    def to_dict(self):
        import json
        user_nodes = self.performed_by.all()

        def parse_json(val):
            if not val:
                return None
            try:
                return json.loads(val)
            except (ValueError, TypeError):
                return val

        return {
            'id': self.uid,
            'action': self.action,
            'resource': self.resource,
            'resourceId': self.resource_id,
            'oldValue': parse_json(self.old_value),
            'newValue': parse_json(self.new_value),
            'ipAddress': self.ip_address,
            'performedBy': user_nodes[0].to_dict() if user_nodes else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }
