/**
 * Admin blog list page — all posts with status, search, create/edit/delete actions.
 */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAdminPosts, useDeletePost } from '@/services/blog'
import { useAuthStore } from '@/stores/authStore'

export default function AdminBlogPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const user = useAuthStore((s) => s.user)

  const { data, isLoading } = useAdminPosts({ page, status: statusFilter as any || undefined })
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost()

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    deletePost(id)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-24)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-28, 28px)', fontWeight: 'var(--font-weight-bold)', color: 'var(--colors-natural-50)' }}>Blog Posts</h1>
          <p style={{ color: 'var(--colors-natural-400)', fontSize: 'var(--font-size-14)', marginTop: 'var(--space-8)' }}>
            {data?.total ?? 0} total posts
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-8)',
            backgroundColor: 'var(--colors-blue-600)',
            color: 'var(--colors-natural-50)',
            padding: 'var(--space-10) var(--space-20)',
            borderRadius: 'var(--border-radius-2xsm)',
            fontSize: 'var(--font-size-14)',
            fontWeight: 'var(--font-weight-semibold)',
            textDecoration: 'none',
          }}
        >
          + New Post
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-8)', marginBottom: 'var(--space-20)' }}>
        {['', 'DRAFT', 'PUBLISHED', 'ARCHIVED'].map((status) => (
          <button
            key={status}
            onClick={() => { setStatusFilter(status); setPage(1) }}
            style={{
              padding: 'var(--space-8) var(--space-16)',
              borderRadius: 'var(--border-radius-2xsm)',
              border: '1px solid',
              borderColor: statusFilter === status ? 'var(--colors-blue-600)' : 'var(--colors-vulcan-700)',
              backgroundColor: statusFilter === status ? 'var(--colors-blue-600)' : 'transparent',
              color: statusFilter === status ? 'var(--colors-natural-50)' : 'var(--colors-natural-400)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-14)',
            }}
          >
            {status || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: 'var(--colors-vulcan-900)',
          border: '1px solid var(--colors-vulcan-700)',
          borderRadius: 'var(--border-radius-md)',
          overflow: 'hidden',
        }}
      >
        {isLoading ? (
          <div style={{ padding: 'var(--space-34)', textAlign: 'center', color: 'var(--colors-natural-400)' }}>Loading...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--colors-vulcan-700)' }}>
                {['Title', 'Status', 'Author', 'Published', 'Views', 'Actions'].map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: 'var(--space-12) var(--space-16)',
                      textAlign: 'left',
                      color: 'var(--colors-natural-500)',
                      fontSize: '12px',
                      fontWeight: 'var(--font-weight-semibold)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.posts.map((post: any) => (
                <tr key={post.id} style={{ borderBottom: '1px solid var(--colors-vulcan-800)' }}>
                  <td style={{ padding: 'var(--space-16)', maxWidth: '300px' }}>
                    <p style={{ color: 'var(--colors-natural-100)', fontSize: 'var(--font-size-14)', fontWeight: 'var(--font-weight-medium)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {post.title}
                    </p>
                    <p style={{ color: 'var(--colors-natural-500)', fontSize: '12px', marginTop: '2px' }}>/{post.slug}</p>
                  </td>
                  <td style={{ padding: 'var(--space-16)' }}>
                    <StatusBadge status={post.status} />
                  </td>
                  <td style={{ padding: 'var(--space-16)', color: 'var(--colors-natural-400)', fontSize: 'var(--font-size-14)' }}>
                    {post.author?.name || '—'}
                  </td>
                  <td style={{ padding: 'var(--space-16)', color: 'var(--colors-natural-400)', fontSize: 'var(--font-size-14)' }}>
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: 'var(--space-16)', color: 'var(--colors-natural-400)', fontSize: 'var(--font-size-14)' }}>
                    {post.viewCount ?? 0}
                  </td>
                  <td style={{ padding: 'var(--space-16)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
                      <Link
                        href={`/admin/blog/${post.id}`}
                        style={{
                          padding: '4px var(--space-10)',
                          backgroundColor: 'var(--colors-vulcan-700)',
                          borderRadius: 'var(--border-radius-2xsm)',
                          color: 'var(--colors-natural-300)',
                          fontSize: '12px',
                          textDecoration: 'none',
                        }}
                      >
                        Edit
                      </Link>
                      {user?.role === 'ADMIN' && (
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          disabled={isDeleting}
                          style={{
                            padding: '4px var(--space-10)',
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 'var(--border-radius-2xsm)',
                            color: '#EF4444',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!data?.posts?.length && (
                <tr>
                  <td colSpan={6} style={{ padding: 'var(--space-34)', textAlign: 'center', color: 'var(--colors-natural-500)' }}>
                    No posts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    PUBLISHED: { bg: 'rgba(34, 197, 94, 0.15)', text: '#22C55E', border: 'rgba(34, 197, 94, 0.3)' },
    DRAFT: { bg: 'rgba(107, 114, 128, 0.15)', text: 'var(--colors-natural-400)', border: 'var(--colors-vulcan-600)' },
    ARCHIVED: { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.3)' },
  }
  const c = colors[status] || colors.DRAFT
  return (
    <span style={{ padding: '2px var(--space-8)', borderRadius: 'var(--border-radius-full)', fontSize: '11px', fontWeight: 'var(--font-weight-semibold)', backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      {status}
    </span>
  )
}
