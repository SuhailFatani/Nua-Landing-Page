import type { Metadata } from 'next'
import { CTASection } from '@/components/sections/CTASection'
import { PageViewTracker } from '@/components/PageViewTracker'

export const metadata: Metadata = {
  title: 'Company',
  description: 'About Nua Security — our mission, team, and values.',
}

export default async function CompanyPage() {
  return (
    <div style={{ backgroundColor: 'var(--colors-vulcan-1000)', minHeight: '100vh' }}>
      <PageViewTracker page="/company" />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-52) var(--space-24)' }}>
        <h1 style={{ fontSize: 'var(--font-size-48)', fontWeight: 'var(--font-weight-bold)', color: 'var(--colors-natural-50)', marginBottom: 'var(--space-16)' }}>
          About Nua Security
        </h1>
        <p style={{ color: 'var(--colors-natural-400)', fontSize: 'var(--font-size-18)', maxWidth: '640px', lineHeight: '1.7', marginBottom: 'var(--space-52)' }}>
          Nua Security is an enterprise cybersecurity company dedicated to protecting businesses from evolving digital threats. Our team of security experts combines deep technical knowledge with practical business experience to deliver solutions that work.
        </p>

        {/* Mission */}
        <div
          style={{
            backgroundColor: 'var(--colors-vulcan-900)',
            border: '1px solid var(--colors-vulcan-700)',
            borderRadius: 'var(--border-radius-md)',
            padding: 'var(--space-34)',
            marginBottom: 'var(--space-40)',
          }}
        >
          <h2 style={{ fontSize: 'var(--font-size-24)', fontWeight: 'var(--font-weight-bold)', color: 'var(--colors-natural-50)', marginBottom: 'var(--space-16)' }}>
            Our Mission
          </h2>
          <p style={{ color: 'var(--colors-natural-400)', fontSize: 'var(--font-size-18)', lineHeight: '1.7' }}>
            To make enterprise-grade cybersecurity accessible to every organization, regardless of size — so that security is no longer a competitive advantage only for large corporations, but a baseline protection for everyone.
          </p>
        </div>

        {/* Values */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-24)' }}>
          {[
            { title: 'Transparency', description: 'We believe in clear communication about threats, vulnerabilities, and our approach.' },
            { title: 'Excellence', description: 'We hold our work to the highest standards, because our clients\' security depends on it.' },
            { title: 'Partnership', description: 'We work as an extension of your team, not just a vendor.' },
          ].map((value) => (
            <div
              key={value.title}
              style={{
                backgroundColor: 'var(--colors-vulcan-900)',
                border: '1px solid var(--colors-vulcan-700)',
                borderRadius: 'var(--border-radius-md)',
                padding: 'var(--space-24)',
              }}
            >
              <h3 style={{ fontSize: 'var(--font-size-18)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--colors-natural-50)', marginBottom: 'var(--space-12)' }}>
                {value.title}
              </h3>
              <p style={{ color: 'var(--colors-natural-400)', fontSize: 'var(--font-size-14)', lineHeight: '1.6' }}>
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <CTASection />
    </div>
  )
}
