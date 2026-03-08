#!/usr/bin/env python3
"""
PostgreSQL → Neo4j Data Migration Script
=========================================
Reads all data from the existing Prisma/PostgreSQL database and creates
corresponding Neomodel nodes + relationships in Neo4j.

Migration order (respects foreign key dependencies):
  1. Users → RefreshTokens (HAS_REFRESH_TOKEN)
  2. Media
  3. Tags
  4. Pages
  5. BlogPosts → AUTHORED, HAS_COVER, TAGGED_WITH
  6. PageViews
  7. Events
  8. DemoBookings
  9. AuditLogs → PERFORMED

Usage:
  # Set environment variables first (or use .env):
  export DATABASE_URL="postgresql://user:pass@host:5432/nua_cms"
  export NEO4J_BOLT_URL="bolt://neo4j:password@localhost:7687"

  python migrate_from_postgres.py
"""

import os
import sys
import json
import logging
from datetime import datetime, timezone

import psycopg2
import psycopg2.extras

# Setup Django so neomodel config is loaded
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
import django
django.setup()

from neomodel import db as neo_db

from apps.users.models import UserNode, RefreshTokenNode
from apps.blog.models import BlogPostNode, TagNode
from apps.pages.models import PageNode
from apps.media.models import MediaNode
from apps.analytics.models import PageViewNode, EventNode, DemoBookingNode, AuditLogNode

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
log = logging.getLogger(__name__)


def get_pg_connection():
    """Connect to the source PostgreSQL database."""
    url = os.environ.get('DATABASE_URL')
    if not url:
        log.error('DATABASE_URL environment variable is required')
        sys.exit(1)
    return psycopg2.connect(url, cursor_factory=psycopg2.extras.RealDictCursor)


def fetch_all(conn, table: str) -> list[dict]:
    """Fetch all rows from a PostgreSQL table."""
    with conn.cursor() as cur:
        cur.execute(f'SELECT * FROM {table}')
        rows = cur.fetchall()
    log.info(f'  Fetched {len(rows)} rows from {table}')
    return [dict(r) for r in rows]


def to_iso(dt) -> str | None:
    """Convert a datetime to ISO string for Neo4j."""
    if dt is None:
        return None
    if isinstance(dt, str):
        return dt
    return dt.isoformat()


def migrate_users(conn) -> dict[str, UserNode]:
    """Migrate users table → UserNode."""
    log.info('Migrating users...')
    rows = fetch_all(conn, 'users')
    nodes = {}
    for r in rows:
        node = UserNode(
            uid=r['id'],
            email=r['email'],
            password_hash=r['passwordHash'],
            name=r['name'],
            role=r.get('role', 'EDITOR'),
            avatar_url=r.get('avatarUrl', ''),
            is_active=r.get('isActive', True),
            failed_login_attempts=r.get('failedLoginAttempts', 0),
            locked_until=to_iso(r.get('lockedUntil')),
            last_login_at=to_iso(r.get('lastLoginAt')),
            last_login_ip=r.get('lastLoginIp', ''),
            created_at=to_iso(r.get('createdAt')),
            updated_at=to_iso(r.get('updatedAt')),
        )
        node.save()
        nodes[r['id']] = node
    log.info(f'  Created {len(nodes)} UserNodes')
    return nodes


def migrate_refresh_tokens(conn, user_nodes: dict[str, UserNode]):
    """Migrate refresh_tokens → RefreshTokenNode + HAS_REFRESH_TOKEN."""
    log.info('Migrating refresh tokens...')
    rows = fetch_all(conn, 'refresh_tokens')
    count = 0
    for r in rows:
        user = user_nodes.get(r['userId'])
        if not user:
            log.warning(f'  Skipping token {r["id"]} — user {r["userId"]} not found')
            continue
        node = RefreshTokenNode(
            uid=r['id'],
            token_hash=r['tokenHash'],
            expires_at=to_iso(r['expiresAt']),
            revoked_at=to_iso(r.get('revokedAt')),
            family=r['family'],
            created_at=to_iso(r.get('createdAt')),
        )
        node.save()
        user.refresh_tokens.connect(node)
        count += 1
    log.info(f'  Created {count} RefreshTokenNodes')


def migrate_media(conn) -> dict[str, MediaNode]:
    """Migrate media table → MediaNode."""
    log.info('Migrating media...')
    rows = fetch_all(conn, 'media')
    nodes = {}
    for r in rows:
        node = MediaNode(
            uid=r['id'],
            url=r['url'],
            public_id=r.get('publicId', ''),
            mime_type=r.get('mimeType', ''),
            size=r.get('size', 0),
            alt=r.get('alt', ''),
            width=r.get('width'),
            height=r.get('height'),
            created_at=to_iso(r.get('createdAt')),
        )
        node.save()
        nodes[r['id']] = node
    log.info(f'  Created {len(nodes)} MediaNodes')
    return nodes


def migrate_tags(conn) -> dict[str, TagNode]:
    """Migrate tags table → TagNode."""
    log.info('Migrating tags...')
    rows = fetch_all(conn, 'tags')
    nodes = {}
    for r in rows:
        node = TagNode(
            uid=r['id'],
            name=r['name'],
            slug=r['slug'],
        )
        node.save()
        nodes[r['id']] = node
    log.info(f'  Created {len(nodes)} TagNodes')
    return nodes


def migrate_pages(conn):
    """Migrate pages table → PageNode."""
    log.info('Migrating pages...')
    rows = fetch_all(conn, 'pages')
    count = 0
    for r in rows:
        # Parse content JSON stored as text
        content = r.get('content', '{}')
        if isinstance(content, str):
            try:
                content = json.loads(content)
            except json.JSONDecodeError:
                content = {}

        node = PageNode(
            uid=r['id'],
            slug=r['slug'],
            title=r['title'],
            meta_desc=r.get('metaDesc', ''),
            content=content,
            is_published=r.get('isPublished', True),
            published_at=to_iso(r.get('publishedAt')),
            created_at=to_iso(r.get('createdAt')),
            updated_at=to_iso(r.get('updatedAt')),
        )
        node.save()
        count += 1
    log.info(f'  Created {count} PageNodes')


def migrate_blog_posts(conn, user_nodes, media_nodes, tag_nodes):
    """Migrate blog_posts + post_tags → BlogPostNode + relationships."""
    log.info('Migrating blog posts...')
    posts = fetch_all(conn, 'blog_posts')
    post_tags = fetch_all(conn, 'post_tags')

    # Build tag lookup: postId → [tagId, ...]
    tag_map: dict[str, list[str]] = {}
    for pt in post_tags:
        tag_map.setdefault(pt['postId'], []).append(pt['tagId'])

    count = 0
    for r in posts:
        node = BlogPostNode(
            uid=r['id'],
            slug=r['slug'],
            title=r['title'],
            excerpt=r.get('excerpt', ''),
            content=r.get('content', ''),
            status=r.get('status', 'DRAFT'),
            published_at=to_iso(r.get('publishedAt')),
            scheduled_at=to_iso(r.get('scheduledAt')),
            meta_title=r.get('metaTitle', ''),
            meta_desc=r.get('metaDesc', ''),
            view_count=r.get('viewCount', 0),
            created_at=to_iso(r.get('createdAt')),
            updated_at=to_iso(r.get('updatedAt')),
        )
        node.save()

        # AUTHORED relationship
        author = user_nodes.get(r['authorId'])
        if author:
            node.author.connect(author)

        # HAS_COVER relationship
        if r.get('coverImageId'):
            cover = media_nodes.get(r['coverImageId'])
            if cover:
                node.cover_image.connect(cover)

        # TAGGED_WITH relationships
        for tag_id in tag_map.get(r['id'], []):
            tag = tag_nodes.get(tag_id)
            if tag:
                node.tags.connect(tag)

        count += 1
    log.info(f'  Created {count} BlogPostNodes with relationships')


def migrate_page_views(conn):
    """Migrate page_views → PageViewNode."""
    log.info('Migrating page views...')
    rows = fetch_all(conn, 'page_views')
    count = 0
    batch_size = 500
    for i in range(0, len(rows), batch_size):
        batch = rows[i:i + batch_size]
        for r in batch:
            node = PageViewNode(
                uid=r['id'],
                page=r['page'],
                ip_hash=r.get('ipHash', ''),
                referrer=r.get('referrer', ''),
                user_agent=r.get('userAgent', ''),
                country=r.get('country', ''),
                session_id=r.get('sessionId', ''),
                created_at=to_iso(r.get('createdAt')),
            )
            node.save()
            count += 1
        log.info(f'  Progress: {count}/{len(rows)} page views')
    log.info(f'  Created {count} PageViewNodes')


def migrate_events(conn):
    """Migrate events → EventNode."""
    log.info('Migrating events...')
    rows = fetch_all(conn, 'events')
    count = 0
    batch_size = 500
    for i in range(0, len(rows), batch_size):
        batch = rows[i:i + batch_size]
        for r in batch:
            metadata = r.get('metadata')
            if isinstance(metadata, str):
                try:
                    metadata = json.loads(metadata)
                except json.JSONDecodeError:
                    metadata = {}

            node = EventNode(
                uid=r['id'],
                type=r['type'],
                page=r['page'],
                label=r.get('label', ''),
                metadata=metadata or {},
                session_id=r.get('sessionId', ''),
                ip_hash=r.get('ipHash', ''),
                created_at=to_iso(r.get('createdAt')),
            )
            node.save()
            count += 1
        log.info(f'  Progress: {count}/{len(rows)} events')
    log.info(f'  Created {count} EventNodes')


def migrate_demo_bookings(conn):
    """Migrate demo_bookings → DemoBookingNode."""
    log.info('Migrating demo bookings...')
    rows = fetch_all(conn, 'demo_bookings')
    count = 0
    for r in rows:
        node = DemoBookingNode(
            uid=r['id'],
            name=r['name'],
            email=r['email'],
            company=r.get('company', ''),
            phone=r.get('phone', ''),
            message=r.get('message', ''),
            status=r.get('status', 'NEW'),
            source=r.get('source', ''),
            created_at=to_iso(r.get('createdAt')),
        )
        node.save()
        count += 1
    log.info(f'  Created {count} DemoBookingNodes')


def migrate_audit_logs(conn, user_nodes):
    """Migrate audit_logs → AuditLogNode + PERFORMED relationship."""
    log.info('Migrating audit logs...')
    rows = fetch_all(conn, 'audit_logs')
    count = 0
    batch_size = 500
    for i in range(0, len(rows), batch_size):
        batch = rows[i:i + batch_size]
        for r in batch:
            node = AuditLogNode(
                uid=r['id'],
                action=r['action'],
                resource=r['resource'],
                resource_id=r.get('resourceId', ''),
                old_value=r.get('oldValue', ''),
                new_value=r.get('newValue', ''),
                ip_address=r.get('ipAddress', ''),
                user_agent=r.get('userAgent', ''),
                created_at=to_iso(r.get('createdAt')),
            )
            node.save()

            # PERFORMED relationship
            if r.get('userId'):
                user = user_nodes.get(r['userId'])
                if user:
                    node.performed_by.connect(user)

            count += 1
        log.info(f'  Progress: {count}/{len(rows)} audit logs')
    log.info(f'  Created {count} AuditLogNodes')


def verify_counts(conn):
    """Compare row counts between PostgreSQL and Neo4j."""
    log.info('\n=== Verification ===')

    tables = {
        'users': 'UserNode',
        'refresh_tokens': 'RefreshTokenNode',
        'media': 'MediaNode',
        'tags': 'TagNode',
        'pages': 'PageNode',
        'blog_posts': 'BlogPostNode',
        'page_views': 'PageViewNode',
        'events': 'EventNode',
        'demo_bookings': 'DemoBookingNode',
        'audit_logs': 'AuditLogNode',
    }

    all_match = True
    for table, label in tables.items():
        with conn.cursor() as cur:
            cur.execute(f'SELECT COUNT(*) as count FROM {table}')
            pg_count = cur.fetchone()['count']

        result, _ = neo_db.cypher_query(f'MATCH (n:{label}) RETURN count(n) AS c')
        neo_count = result[0][0] if result else 0

        status = 'OK' if pg_count == neo_count else 'MISMATCH'
        if status == 'MISMATCH':
            all_match = False
        log.info(f'  {table}: PG={pg_count} Neo4j={neo_count} [{status}]')

    if all_match:
        log.info('\nAll counts match. Migration successful!')
    else:
        log.warning('\nSome counts do not match. Please investigate.')


def main():
    log.info('Starting PostgreSQL → Neo4j migration...\n')

    conn = get_pg_connection()

    try:
        # 1. Users
        user_nodes = migrate_users(conn)

        # 2. Refresh tokens
        migrate_refresh_tokens(conn, user_nodes)

        # 3. Media
        media_nodes = migrate_media(conn)

        # 4. Tags
        tag_nodes = migrate_tags(conn)

        # 5. Pages
        migrate_pages(conn)

        # 6. Blog posts (with AUTHORED, HAS_COVER, TAGGED_WITH)
        migrate_blog_posts(conn, user_nodes, media_nodes, tag_nodes)

        # 7. Page views
        migrate_page_views(conn)

        # 8. Events
        migrate_events(conn)

        # 9. Demo bookings
        migrate_demo_bookings(conn)

        # 10. Audit logs (with PERFORMED)
        migrate_audit_logs(conn, user_nodes)

        # Verify
        verify_counts(conn)

    finally:
        conn.close()

    log.info('\nMigration complete.')


if __name__ == '__main__':
    main()
