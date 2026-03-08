/**
 * Blog post detail page — SSG with ISR revalidation.
 */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageViewTracker } from '@/components/PageViewTracker'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000'

async function getPost(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/blog/${slug}/`, {
      next: { revalidate: 60 },
    })
    if (res.status === 404) return null
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) return { title: 'Post Not Found' }
  return {
    title: post.metaTitle || post.title,
    description: post.metaDesc || post.excerpt,
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  if (!post) notFound()

  return (
    <div style={{ backgroundColor: 'var(--colors-vulcan-1000)', minHeight: '100vh' }}>
      <PageViewTracker page={`/blog/${params.slug}`} />

      <article style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--space-52) var(--space-24)' }}>
        {/* Back link */}
        <Link
          href="/blog"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-8)',
            color: 'var(--colors-natural-400)',
            textDecoration: 'none',
            fontSize: 'var(--font-size-14)',
            marginBottom: 'var(--space-34)',
          }}
        >
          ← Back to Blog
        </Link>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 'var(--space-8)', marginBottom: 'var(--space-16)', flexWrap: 'wrap' }}>
            {post.tags.map((tag: any) => (
              <span
                key={tag.id}
                style={{
                  padding: '4px var(--space-12)',
                  backgroundColor: 'var(--colors-blue-950)',
                  border: '1px solid var(--colors-blue-800)',
                  borderRadius: 'var(--border-radius-full)',
                  color: 'var(--colors-blue-400)',
                  fontSize: 'var(--font-size-14)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1
          style={{
            fontSize: 'var(--font-size-48)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--colors-natural-50)',
            lineHeight: '1.2',
            marginBottom: 'var(--space-24)',
          }}
        >
          {post.title}
        </h1>

        {/* Meta */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-16)',
            marginBottom: 'var(--space-34)',
            paddingBottom: 'var(--space-24)',
            borderBottom: '1px solid var(--colors-vulcan-800)',
          }}
        >
          {post.author && (
            <span style={{ color: 'var(--colors-natural-300)', fontSize: 'var(--font-size-14)', fontWeight: 'var(--font-weight-medium)' }}>
              {post.author.name}
            </span>
          )}
          {post.publishedAt && (
            <span style={{ color: 'var(--colors-natural-500)', fontSize: 'var(--font-size-14)' }}>
              {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>

        {/* Cover image */}
        {post.coverImage && (
          <img
            src={post.coverImage.url}
            alt={post.coverImage.alt || post.title}
            style={{
              width: '100%',
              borderRadius: 'var(--border-radius-md)',
              marginBottom: 'var(--space-34)',
            }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        )}

        {/* Content */}
        <div
          style={{
            color: 'var(--colors-natural-300)',
            fontSize: 'var(--font-size-18)',
            lineHeight: '1.8',
          }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  )
}
