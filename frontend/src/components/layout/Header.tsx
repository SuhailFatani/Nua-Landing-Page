'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@iconify/react'
import { useState } from 'react'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/blog', label: 'Blog' },
  { href: '/company', label: 'Company' },
]

export function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header
      style={{
        backgroundColor: 'var(--colors-vulcan-1000)',
        borderBottom: '1px solid var(--colors-vulcan-800)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(12px)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 var(--space-24)',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
          <span
            style={{
              fontSize: 'var(--font-size-20)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--colors-natural-50)',
            }}
          >
            Nua
          </span>
          <span
            style={{
              fontSize: 'var(--font-size-20)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--colors-blue-600)',
            }}
          >
            Security
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                style={{
                  padding: 'var(--space-8) var(--space-12)',
                  borderRadius: 'var(--border-radius-xsm)',
                  color: isActive ? 'var(--colors-natural-50)' : 'var(--colors-natural-400)',
                  fontSize: 'var(--font-size-14)',
                  fontWeight: 'var(--font-weight-medium)',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  backgroundColor: isActive ? 'var(--colors-vulcan-800)' : 'transparent',
                }}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* CTA */}
        <Link
          href="/book-a-demo"
          style={{
            backgroundColor: 'var(--colors-blue-600)',
            color: 'var(--colors-natural-50)',
            padding: 'var(--space-10) var(--space-20)',
            borderRadius: 'var(--border-radius-2xsm)',
            fontSize: 'var(--font-size-14)',
            fontWeight: 'var(--font-weight-semibold)',
            textDecoration: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Book a Demo
        </Link>
      </div>
    </header>
  )
}
