"""
Management command: seed_db
Seeds the Neo4j database with:
- 1 admin user (credentials from env)
- 6 default pages (home, pricing, services, company, blog, book_a_demo)
- 3 sample blog posts with tags

Safe to run multiple times — skips existing records.
"""
import json
from datetime import datetime, timezone

from django.core.management.base import BaseCommand
from django.conf import settings

from apps.users.models import UserNode
from apps.users.utils import hash_password
from apps.pages.models import PageNode
from apps.blog.models import BlogPostNode, TagNode


class Command(BaseCommand):
    help = 'Seed Neo4j with initial admin user, pages, and sample blog posts'

    def handle(self, *args, **options):
        self.stdout.write('Starting database seed...')

        self._seed_admin()
        self._seed_pages()
        self._seed_blog()

        self.stdout.write(self.style.SUCCESS('✅ Database seeded successfully'))

    def _seed_admin(self):
        email = settings.SEED_ADMIN_EMAIL
        if UserNode.nodes.filter(email=email):
            self.stdout.write(f'  ⏩ Admin user already exists: {email}')
            return

        admin = UserNode(
            email=email,
            password_hash=hash_password(settings.SEED_ADMIN_PASSWORD),
            name='Nua Admin',
            role='ADMIN',
        ).save()
        self.stdout.write(f'  ✅ Created admin user: {email}')

    def _seed_pages(self):
        pages = [
            {
                'slug': 'home',
                'title': 'Home',
                'meta_desc': 'Nua Security — Enterprise Cybersecurity Solutions',
                'content': json.dumps({
                    'hero': {
                        'headline': 'Enterprise-Grade Cybersecurity',
                        'subheadline': 'Protecting your business with cutting-edge security solutions',
                        'ctaText': 'Book a Demo',
                        'ctaLink': '/book-a-demo',
                    },
                    'features': [],
                    'stats': [],
                }),
            },
            {
                'slug': 'pricing',
                'title': 'Pricing',
                'meta_desc': 'Transparent pricing for every business size',
                'content': json.dumps({
                    'tiers': [
                        {'name': 'Plus', 'price': '$299', 'billing': 'monthly', 'isPopular': False, 'features': []},
                        {'name': 'Premium', 'price': '$599', 'billing': 'monthly', 'isPopular': True, 'features': []},
                        {'name': 'Enterprise', 'price': 'Custom', 'billing': 'yearly', 'isPopular': False, 'features': []},
                    ],
                    'faq': [],
                }),
            },
            {'slug': 'services', 'title': 'Services', 'meta_desc': 'Our cybersecurity services', 'content': json.dumps({'services': []})},
            {'slug': 'company', 'title': 'Company', 'meta_desc': 'About Nua Security', 'content': json.dumps({'team': [], 'mission': ''})},
            {'slug': 'blog', 'title': 'Blog', 'meta_desc': 'Cybersecurity insights and news', 'content': json.dumps({})},
            {'slug': 'book_a_demo', 'title': 'Book a Demo', 'meta_desc': 'Schedule a demo with our team', 'content': json.dumps({})},
        ]

        now = datetime.now(timezone.utc)
        for page_data in pages:
            if PageNode.nodes.filter(slug=page_data['slug']):
                self.stdout.write(f'  ⏩ Page already exists: {page_data["slug"]}')
                continue

            PageNode(
                slug=page_data['slug'],
                title=page_data['title'],
                meta_desc=page_data.get('meta_desc', ''),
                content=page_data.get('content', ''),
                is_published=True,
                published_at=now,
            ).save()
            self.stdout.write(f'  ✅ Created page: {page_data["slug"]}')

    def _seed_blog(self):
        sample_posts = [
            {
                'title': 'Top 5 Cybersecurity Threats in 2026',
                'slug': 'top-5-cybersecurity-threats-2026',
                'excerpt': 'The threat landscape is evolving rapidly. Here are the five most critical threats every enterprise should be aware of.',
                'content': '<h2>Introduction</h2><p>Cybersecurity threats continue to evolve at an unprecedented pace...</p>',
                'status': 'PUBLISHED',
                'tags': ['Threat Intelligence', 'Enterprise Security'],
            },
            {
                'title': 'How to Build a Zero Trust Architecture',
                'slug': 'zero-trust-architecture-guide',
                'excerpt': 'Zero Trust is no longer optional. Learn how to implement it step by step.',
                'content': '<h2>What is Zero Trust?</h2><p>Zero Trust is a security framework that requires all users...</p>',
                'status': 'PUBLISHED',
                'tags': ['Zero Trust', 'Architecture', 'Enterprise Security'],
            },
            {
                'title': 'Getting Started with ISO 27001 Compliance',
                'slug': 'iso-27001-compliance-guide',
                'excerpt': 'A practical guide to achieving and maintaining ISO 27001 certification.',
                'content': '<h2>Why ISO 27001?</h2><p>ISO 27001 is the international standard for information security management...</p>',
                'status': 'DRAFT',
                'tags': ['Compliance', 'ISO 27001'],
            },
        ]

        now = datetime.now(timezone.utc)
        for post_data in sample_posts:
            if BlogPostNode.nodes.filter(slug=post_data['slug']):
                self.stdout.write(f'  ⏩ Blog post already exists: {post_data["slug"]}')
                continue

            post = BlogPostNode(
                title=post_data['title'],
                slug=post_data['slug'],
                excerpt=post_data['excerpt'],
                content=post_data['content'],
                status=post_data['status'],
                published_at=now if post_data['status'] == 'PUBLISHED' else None,
            ).save()

            # Upsert and connect tags
            for tag_name in post_data.get('tags', []):
                from slugify import slugify
                tag_slug = slugify(tag_name)
                existing = TagNode.nodes.filter(slug=tag_slug)
                if existing:
                    tag = existing[0]
                else:
                    tag = TagNode(name=tag_name, slug=tag_slug).save()
                post.tags.connect(tag)

            self.stdout.write(f'  ✅ Created blog post: {post_data["slug"]}')
