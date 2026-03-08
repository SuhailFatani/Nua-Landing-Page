import Link from 'next/link'

export function CTASection() {
  return (
    <section
      style={{
        padding: 'var(--space-52) var(--space-24)',
        backgroundColor: 'var(--colors-vulcan-1000)',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
          backgroundColor: 'var(--colors-vulcan-900)',
          border: '1px solid var(--colors-vulcan-700)',
          borderRadius: 'var(--border-radius-lg)',
          padding: 'var(--space-52)',
        }}
      >
        <h2
          style={{
            fontSize: 'var(--font-size-36, 36px)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--colors-natural-50)',
            marginBottom: 'var(--space-16)',
          }}
        >
          Get Ahead of Threats
        </h2>
        <p
          style={{
            color: 'var(--colors-natural-400)',
            fontSize: 'var(--font-size-18)',
            marginBottom: 'var(--space-34)',
            lineHeight: '1.6',
          }}
        >
          See how Nua Security can protect your organization. Book a personalized demo with our security experts.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-16)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/book-a-demo"
            style={{
              backgroundColor: 'var(--colors-blue-600)',
              color: 'var(--colors-natural-50)',
              padding: 'var(--space-14) var(--space-34)',
              borderRadius: 'var(--border-radius-2xsm)',
              fontSize: 'var(--font-size-16)',
              fontWeight: 'var(--font-weight-semibold)',
              textDecoration: 'none',
            }}
          >
            Book a Demo
          </Link>
          <Link
            href="/pricing"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--colors-natural-300)',
              padding: 'var(--space-14) var(--space-34)',
              borderRadius: 'var(--border-radius-2xsm)',
              fontSize: 'var(--font-size-16)',
              fontWeight: 'var(--font-weight-medium)',
              textDecoration: 'none',
              border: '1px solid var(--colors-vulcan-700)',
            }}
          >
            View Pricing
          </Link>
        </div>
      </div>
    </section>
  )
}
