"""
Neomodel node definitions for BlogPost and Tag.
Replaces Prisma BlogPost, Tag, and PostTag (join table → graph relationship).
"""
from neomodel import (
    StructuredNode,
    StringProperty,
    IntegerProperty,
    DateTimeProperty,
    UniqueIdProperty,
    RelationshipTo,
    RelationshipFrom,
    ZeroOrMore,
    ZeroOrOne,
)


class TagNode(StructuredNode):
    """Blog post tag."""

    __label__ = 'Tag'

    uid = UniqueIdProperty()
    name = StringProperty(unique_index=True, required=True)
    slug = StringProperty(unique_index=True, required=True)

    # Posts using this tag
    posts = RelationshipFrom('BlogPostNode', 'TAGGED_WITH')

    def to_dict(self):
        return {'id': self.uid, 'name': self.name, 'slug': self.slug}


class BlogPostNode(StructuredNode):
    """A blog article with content, status workflow, and tag relationships."""

    __label__ = 'BlogPost'

    uid = UniqueIdProperty()
    title = StringProperty(required=True)
    slug = StringProperty(unique_index=True, required=True)
    excerpt = StringProperty()
    content = StringProperty(required=True)   # Sanitized HTML
    status = StringProperty(default='DRAFT')  # DRAFT | PUBLISHED | ARCHIVED
    published_at = DateTimeProperty()
    scheduled_at = DateTimeProperty()
    meta_title = StringProperty()
    meta_desc = StringProperty()
    view_count = IntegerProperty(default=0)
    created_at = DateTimeProperty(default_now=True)
    updated_at = DateTimeProperty(default_now=True)

    # Relationships
    tags = RelationshipTo('TagNode', 'TAGGED_WITH')
    cover_image = RelationshipTo('apps.media.models.MediaNode', 'HAS_COVER', cardinality=ZeroOrOne)
    author = RelationshipFrom('apps.users.models.UserNode', 'AUTHORED', cardinality=ZeroOrOne)

    def to_dict(self, include_content=False):
        author_nodes = self.author.all()
        cover_nodes = self.cover_image.all()
        tag_nodes = self.tags.all()

        result = {
            'id': self.uid,
            'title': self.title,
            'slug': self.slug,
            'excerpt': self.excerpt,
            'status': self.status,
            'publishedAt': self.published_at.isoformat() if self.published_at else None,
            'metaTitle': self.meta_title,
            'metaDesc': self.meta_desc,
            'viewCount': self.view_count,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
            'author': author_nodes[0].to_dict() if author_nodes else None,
            'coverImage': cover_nodes[0].to_dict() if cover_nodes else None,
            'tags': [t.to_dict() for t in tag_nodes],
        }

        if include_content:
            result['content'] = self.content

        return result
