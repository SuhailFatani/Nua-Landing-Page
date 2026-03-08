"""
Neomodel node definition for CMS landing page content.
Each Page node holds the editable content for one landing page
(home, pricing, services, company, blog, book_a_demo).
"""
from neomodel import (
    StructuredNode,
    StringProperty,
    BooleanProperty,
    DateTimeProperty,
    UniqueIdProperty,
)


class PageNode(StructuredNode):
    """CMS-managed content for a landing page."""

    __label__ = 'Page'

    uid = UniqueIdProperty()
    slug = StringProperty(unique_index=True, required=True)   # home | pricing | services | company | blog | book_a_demo
    title = StringProperty(required=True)
    meta_desc = StringProperty()
    content = StringProperty()     # JSON string (flexible section data)
    is_published = BooleanProperty(default=True)
    published_at = DateTimeProperty()
    created_at = DateTimeProperty(default_now=True)
    updated_at = DateTimeProperty(default_now=True)

    def to_dict(self):
        import json
        content_parsed = None
        if self.content:
            try:
                content_parsed = json.loads(self.content)
            except (ValueError, TypeError):
                content_parsed = self.content

        return {
            'id': self.uid,
            'slug': self.slug,
            'title': self.title,
            'metaDesc': self.meta_desc,
            'content': content_parsed,
            'isPublished': self.is_published,
            'publishedAt': self.published_at.isoformat() if self.published_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }
