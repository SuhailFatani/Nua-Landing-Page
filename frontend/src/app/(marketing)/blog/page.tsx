/**
 * Blog listing page — fetches from Django API.
 * Paginated, filterable by tag.
 */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePublicPosts } from '@/services/blog'
import { PageViewTracker } from '@/components/PageViewTracker'

export default function BlogPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = usePublicPosts({ page, limit: 9 })

  return (
    <div style={{ backgroundColor: 'var(--colors-vulcan-1000)', minHeight: '100vh' }}>
      <PageViewTracker page="/blog" />

      {/* Header */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: 'var(--space-52) var(--space-24) var(--space-34)',
        }}
      >
        <h1
          style={{
            fontSize: 'var(--font-size-48)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--colors-natural-50)',
            marginBottom: 'var(--space-16)',
          }}
        >
          Security Insights
        </h1>
        <p style={{ color: 'var(--colors-natural-400)', fontSize: 'var(--font-size-18)' }}>
          Expert analysis, threat intelligence, and practical security guides.
        </p>
      </div>

      {/* Posts grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--space-24) var(--space-52)' }}>
        {isLoading && (
          <div style={{ textAlign: 'center', color: 'var(--colors-natural-400)', padding: 'var(--space-52)' }}>
            Loading posts...
          </div>
        )}

        {isError && (
          <div style={{ textAlign: 'center', color: 'var(--colors-natural-400)', padding: 'var(--space-52)' }}>
            Failed to load posts. Please try again.
          </div>
        )}

        {data && (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--space-24)',
                marginBottom: 'var(--space-40)',
              }}
            >
              {data.posts.map((post: any) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <article
                    style={{
                      backgroundColor: 'var(--colors-vulcan-900)',
                      border: '1px solid var(--colors-vulcan-700)',
                      borderRadius: 'var(--border-radius-md)',
                      padding: 'var(--space-24)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-16)',
                    }}
                  >
                    {/* Cover image placeholder */}
                    <div
                      style={{
                        aspectRatio: '16/9',
                        backgroundColor: 'var(--colors-vulcan-800)',
                        borderRadius: 'var(--border-radius-xsm)',
                        overflow: 'hidden',
                      }}
                    >
                      {post.coverImage ? (
                        <img
                          src={post.coverImage.url}
                          alt={post.coverImage.alt || post.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      ) : null}
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
                        {post.tags.slice(0, 2).map((tag: any) => (
                          <span
                            key={tag.id}
                            style={{
                              padding: '2px var(--space-8)',
                              backgroundColor: 'var(--colors-blue-950)',
                              border: '1px solid var(--colors-blue-800)',
                              borderRadius: 'var(--border-radius-full)',
                              color: 'var(--colors-blue-400)',
                              fontSize: '12px',
                              fontWeight: 'var(--font-weight-medium)',
                            }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Title */}
                    <h2
                      style={{
                        fontSize: 'var(--font-size-18)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--colors-natural-50)',
                        lineHeight: '1.4',
                        flex: 1,
                      }}
                    >
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p style={{ color: 'var(--colors-natural-400)', fontSize: 'var(--font-size-14)', lineHeight: '1.6' }}>
                        {post.excerpt}
                      </p>
                    )}

                    {/* Meta */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', marginTop: 'auto' }}>
                      {post.author && (
                        <span style={{ color: 'var(--colors-natural-500)', fontSize: '12px' }}>
                          {post.author.name}
                        </span>
                      )}
                      {post.publishedAt && (
                        <span style={{ color: 'var(--colors-natural-600)', fontSize: '12px' }}>
                          {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-8)' }}>
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      padding: 'var(--space-8) var(--space-16)',
                      borderRadius: 'var(--border-radius-2xsm)',
                      border: '1px solid',
                      borderColor: p === page ? 'var(--colors-blue-600)' : 'var(--colors-vulcan-700)',
                      backgroundColor: p === page ? 'var(--colors-blue-600)' : 'transparent',
                      color: p === page ? 'var(--colors-natural-50)' : 'var(--colors-natural-400)',
                      cursor: 'pointer',
                      fontSize: 'var(--font-size-14)',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
