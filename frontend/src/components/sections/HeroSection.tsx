'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'

interface HeroSectionProps {
  headline: string
  subheadline: string
  ctaText: string
  ctaLink: string
}

export function HeroSection({ headline, subheadline, ctaText, ctaLink }: HeroSectionProps) {
  return (
    <section
      style={{
        backgroundColor: 'var(--colors-vulcan-1000)',
        padding: 'var(--space-52) var(--space-24)',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-52)',
          alignItems: 'center',
        }}
      >
        {/* Left: Content */}
        <div>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-8)',
              backgroundColor: 'var(--colors-blue-950)',
              border: '1px solid var(--colors-blue-800)',
              borderRadius: 'var(--border-radius-full)',
              padding: '6px var(--space-14)',
              marginBottom: 'var(--space-24)',
            }}
          >
            <Icon icon="solar:shield-check-linear" style={{ color: 'var(--colors-blue-400)', fontSize: '16px' }} />
            <span style={{ color: 'var(--colors-blue-400)', fontSize: 'var(--font-size-14)', fontWeight: 'var(--font-weight-medium)' }}>
              ISO 27001 Certified
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: 'var(--font-size-48)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--colors-natural-50)',
              lineHeight: '1.15',
              marginBottom: 'var(--space-20)',
              letterSpacing: '-0.02em',
            }}
          >
            {headline}
          </h1>

          {/* Subheadline */}
          <p
            style={{
              fontSize: 'var(--font-size-18)',
              color: 'var(--colors-natural-400)',
              lineHeight: '1.7',
              marginBottom: 'var(--space-34)',
              maxWidth: '480px',
            }}
          >
            {subheadline}
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 'var(--space-16)', flexWrap: 'wrap' }}>
            <Link
              href={ctaLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-8)',
                backgroundColor: 'var(--colors-blue-600)',
                color: 'var(--colors-natural-50)',
                padding: 'var(--space-14) var(--space-24)',
                borderRadius: 'var(--border-radius-2xsm)',
                fontSize: 'var(--font-size-16)',
                fontWeight: 'var(--font-weight-semibold)',
                textDecoration: 'none',
              }}
            >
              {ctaText}
              <Icon icon="solar:arrow-right-linear" style={{ fontSize: '18px' }} />
            </Link>
            <Link
              href="/services"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-8)',
                backgroundColor: 'transparent',
                color: 'var(--colors-natural-300)',
                padding: 'var(--space-14) var(--space-24)',
                borderRadius: 'var(--border-radius-2xsm)',
                fontSize: 'var(--font-size-16)',
                fontWeight: 'var(--font-weight-medium)',
                textDecoration: 'none',
                border: '1px solid var(--colors-vulcan-700)',
              }}
            >
              Our Services
            </Link>
          </div>

          {/* Trust signals */}
          <div style={{ display: 'flex', gap: 'var(--space-24)', marginTop: 'var(--space-34)', alignItems: 'center' }}>
            {['500+ Clients Protected', '99.9% Uptime SLA', 'Gartner Recognized'].map((signal) => (
              <div key={signal} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                <Icon icon="solar:check-circle-linear" style={{ color: 'var(--colors-blue-400)', fontSize: '16px' }} />
                <span style={{ color: 'var(--colors-natural-400)', fontSize: 'var(--font-size-14)' }}>{signal}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Visual placeholder (replace with Lottie animation) */}
        <div
          style={{
            backgroundColor: 'var(--colors-vulcan-900)',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--colors-vulcan-700)',
            aspectRatio: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon
            icon="solar:shield-network-linear"
            style={{
              fontSize: '120px',
              color: 'var(--colors-blue-600)',
              opacity: 0.6,
            }}
          />
        </div>
      </div>
    </section>
  )
}
