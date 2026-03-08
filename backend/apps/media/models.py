"""
Neomodel node definition for uploaded media files.
Supports Cloudinary (production) and local disk storage (development).
"""
from neomodel import (
    StructuredNode,
    StringProperty,
    IntegerProperty,
    DateTimeProperty,
    UniqueIdProperty,
    RelationshipFrom,
)


class MediaNode(StructuredNode):
    """An uploaded image or file, stored in Cloudinary or local disk."""

    __label__ = 'Media'

    uid = UniqueIdProperty()
    filename = StringProperty(required=True)
    original_name = StringProperty(required=True)
    mime_type = StringProperty(required=True)
    size = IntegerProperty(required=True)       # bytes
    url = StringProperty(required=True)
    public_id = StringProperty(required=True)   # Cloudinary public_id or local path
    alt = StringProperty()
    width = IntegerProperty()
    height = IntegerProperty()
    storage = StringProperty(default='local')   # cloudinary | local
    created_at = DateTimeProperty(default_now=True)

    # Reverse relationship from blog posts
    used_as_cover = RelationshipFrom('apps.blog.models.BlogPostNode', 'HAS_COVER')

    def to_dict(self):
        return {
            'id': self.uid,
            'filename': self.filename,
            'originalName': self.original_name,
            'mimeType': self.mime_type,
            'size': self.size,
            'url': self.url,
            'publicId': self.public_id,
            'alt': self.alt,
            'width': self.width,
            'height': self.height,
            'storage': self.storage,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }
