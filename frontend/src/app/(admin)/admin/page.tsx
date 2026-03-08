/**
 * Admin dashboard — stats, recent posts, recent bookings.
 */
'use client'

import { useDashboard } from '@/services/analytics'
import { useAdminPosts } from '@/services/blog'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const { data: dashboard, isLoading: dashLoading } = useDashboard(30)
  const { data: postsData } = useAdminPosts({ limit: 5 })

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-34)' }}>
        <h1 style={{ fontSize: 'var(--font-size-28, 28px)', fontWeight: 'var(--font-weight-bold)', color: 'var(--colors-natural-50)', marginBottom: 'var(--space-8)' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--colors-natural-400)', fontSize: 'var(--font-size-14)' }}>
          Overview of your site's performance (last 30 days)
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-16)', marginBottom: 'var(--space-34)' }}>
        {[
          { label: 'Total Views', value: dashLoading ? '...' : (dashboard?.totalViews ?? 0), icon: 'solar:eye-linear' },
          { label: 'Unique Visitors', value: dashLoading ? '...' : (dashboard?.uniqueVisitors ?? 0), icon: 'solar:users-group-rounded-linear' },
          { label: 'Demo Requests', value: dashLoading ? '...' : (dashboard?.bookingsByStatus?.NEW ?? 0), icon: 'solar:calendar-linear' },
          { label: 'Published Posts', value: postsData ? postsData.posts.filter((p: any) => p.status === 'PUBLISHED').length : '...', icon: 'solar:document-text-linear' },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: 'var(--colors-vulcan-900)',
              border: '1px solid var(--colors-vulcan-700)',
              borderRadius: 'var(--border-radius-md)',
              padding: 'var(--space-20)',
            }}
          >
            <p style={{ color: 'var(--colors-natural-400)', fontSize: 'var(--font-size-14)', marginBottom: 'var(--space-8)' }}>
              {stat.label}
            </p>
            <p style={{ fontSize: 'var(--font-size-28, 28px)', fontWeight: 'var(--font-weight-bold)', color: 'var(--colors-natural-50)' }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-24)' }}>
        {/* Recent posts */}
        <div
          style={{
            backgroundColor: 'var(--colors-vulcan-900)',
            border: '1px solid var(--colors-vulcan-700)',
            borderRadius: 'var(--border-radius-md)',
            padding: 'var(--space-24)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-20)' }}>
            <h2 style={{ fontSize: 'var(--font-size-16)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--colors-natural-50)' }}>
              Recent Posts
            </h2>
            <Link href="/admin/blog" style={{ color: 'var(--colors-blue-400)', fontSize: 'var(--font-size-14)', textDecoration: 'none' }}>
              View all →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
            {postsData?.posts.map((post: any) => (
              <div
                key={post.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-12)',
                  backgroundColor: 'var(--colors-vulcan-800)',
                  borderRadius: 'var(--border-radius-xsm)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: 'var(--colors-natural-200)', fontSize: 'var(--font-size-14)', fontWeight: 'var(--font-weight-medium)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {post.title}
                  </p>
                </div>
                <span
                  style={{
                    marginLeft: 'var(--space-12)',
                    padding: '2px var(--space-8)',
                    borderRadius: 'var(--border-radius-full)',
                    fontSize: '11px',
                    fontWeight: 'var(--font-weight-medium)',
                    backgroundColor: post.status === 'PUBLISHED' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                    color: post.status === 'PUBLISHED' ? '#22C55E' : 'var(--colors-natural-400)',
                    border: `1px solid ${post.status === 'PUBLISHED' ? 'rgba(34, 197, 94, 0.3)' : 'var(--colors-vulcan-600)'}`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {post.status}
                </span>
              </div>
            ))}
            {!postsData?.posts?.length && (
              <p style={{ color: 'var(--colors-natural-500)', fontSize: 'var(--font-size-14)' }}>No posts yet.</p>
            )}
          </div>
        </div>

        {/* Recent bookings */}
        <div
          style={{
            backgroundColor: 'var(--colors-vulcan-900)',
            border: '1px solid var(--colors-vulcan-700)',
            borderRadius: 'var(--border-radius-md)',
            padding: 'var(--space-24)',
          }}
        >
          <h2 style={{ fontSize: 'var(--font-size-16)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--colors-natural-50)', marginBottom: 'var(--space-20)' }}>
            Recent Demo Requests
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
            {dashboard?.recentBookings?.map((booking: any) => (
              <div
                key={booking.id}
                style={{
                  padding: 'var(--space-12)',
                  backgroundColor: 'var(--colors-vulcan-800)',
                  borderRadius: 'var(--border-radius-xsm)',
                }}
              >
                <p style={{ color: 'var(--colors-natural-200)', fontSize: 'var(--font-size-14)', fontWeight: 'var(--font-weight-medium)' }}>
                  {booking.name}
                </p>
                <p style={{ color: 'var(--colors-natural-400)', fontSize: '12px' }}>
                  {booking.company || booking.email}
                </p>
              </div>
            ))}
            {!dashboard?.recentBookings?.length && (
              <p style={{ color: 'var(--colors-natural-500)', fontSize: 'var(--font-size-14)' }}>No bookings yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
