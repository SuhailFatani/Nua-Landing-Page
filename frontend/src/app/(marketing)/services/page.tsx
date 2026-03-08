import type { Metadata } from 'next'
import { FeaturesSection } from '@/components/sections/FeaturesSection'
import { CTASection } from '@/components/sections/CTASection'
import { PageViewTracker } from '@/components/PageViewTracker'

export const metadata: Metadata = {
  title: 'Services',
  description: 'Enterprise cybersecurity services — threat detection, penetration testing, SOC, compliance.',
}

export default async function ServicesPage() {
  return (
    <div style={{ backgroundColor: 'var(--colors-vulcan-1000)', minHeight: '100vh' }}>
      <PageViewTracker page="/services" />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-52) var(--space-24) var(--space-34)' }}>
        <h1 style={{ fontSize: 'var(--font-size-48)', fontWeight: 'var(--font-weight-bold)', color: 'var(--colors-natural-50)', marginBottom: 'var(--space-16)' }}>
          Our Services
        </h1>
        <p style={{ color: 'var(--colors-natural-400)', fontSize: 'var(--font-size-18)', maxWidth: '560px' }}>
          End-to-end cybersecurity solutions tailored to your organization's needs.
        </p>
      </div>

      <FeaturesSection features={[]} />
      <CTASection />
    </div>
  )
}
