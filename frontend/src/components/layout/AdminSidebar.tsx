'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@iconify/react'
import { useLogout } from '@/services/auth'
import { useAuthStore } from '@/stores/authStore'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: 'solar:home-2-linear', exact: true },
  { href: '/admin/blog', label: 'Blog', icon: 'solar:document-text-linear' },
  { href: '/admin/pages', label: 'Pages', icon: 'solar:layers-linear' },
  { href: '/admin/media', label: 'Media', icon: 'solar:gallery-linear' },
  { href: '/admin/team', label: 'Team', icon: 'solar:users-group-rounded-linear', adminOnly: true },
  { href: '/admin/audit', label: 'Audit Log', icon: 'solar:history-linear', adminOnly: true },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { mutate: logout } = useLogout()
  const user = useAuthStore((s) => s.user)

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: 'var(--colors-vulcan-950)',
        borderRight: '1px solid var(--colors-vulcan-800)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: 'var(--space-24)',
          borderBottom: '1px solid var(--colors-vulcan-800)',
        }}
      >
        <Link href="/admin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
          <Icon icon="solar:shield-check-bold" style={{ fontSize: '24px', color: 'var(--colors-blue-600)' }} />
          <span style={{ fontSize: 'var(--font-size-16)', fontWeight: 'var(--font-weight-bold)', color: 'var(--colors-natural-50)' }}>
            Nua Admin
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: 'var(--space-16)' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {NAV_ITEMS.filter(item => !item.adminOnly || user?.role === 'ADMIN').map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-12)',
                    padding: 'var(--space-10) var(--space-12)',
                    borderRadius: 'var(--border-radius-xsm)',
                    backgroundColor: isActive ? 'var(--colors-vulcan-800)' : 'transparent',
                    color: isActive ? 'var(--colors-natural-50)' : 'var(--colors-natural-400)',
                    fontSize: 'var(--font-size-14)',
                    fontWeight: isActive ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)',
                    textDecoration: 'none',
                  }}
                >
                  <Icon icon={item.icon} style={{ fontSize: '18px' }} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User + Logout */}
      <div
        style={{
          padding: 'var(--space-16)',
          borderTop: '1px solid var(--colors-vulcan-800)',
        }}
      >
        {user && (
          <div style={{ marginBottom: 'var(--space-12)' }}>
            <p style={{ color: 'var(--colors-natural-300)', fontSize: 'var(--font-size-14)', fontWeight: 'var(--font-weight-medium)' }}>
              {user.name}
            </p>
            <p style={{ color: 'var(--colors-natural-500)', fontSize: '12px' }}>
              {user.role}
            </p>
          </div>
        )}
        <button
          onClick={() => logout()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-8)',
            width: '100%',
            padding: 'var(--space-10) var(--space-12)',
            borderRadius: 'var(--border-radius-xsm)',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--colors-natural-400)',
            fontSize: 'var(--font-size-14)',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <Icon icon="solar:logout-2-linear" style={{ fontSize: '18px' }} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
