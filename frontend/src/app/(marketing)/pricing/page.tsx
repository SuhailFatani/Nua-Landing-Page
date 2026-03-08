import type { Metadata } from 'next'
import { CTASection } from '@/components/sections/CTASection'
import { PageViewTracker } from '@/components/PageViewTracker'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Transparent pricing for every business size. Plus, Premium, and Enterprise plans.',
}

async function getPricingContent() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000'}/api/pages/pricing/`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

const DEFAULT_TIERS = [
  {
    name: 'Plus',
    price: '$299',
    billing: 'monthly',
    isPopular: false,
    description: 'Essential security for growing businesses.',
    features: ['Threat Monitoring', 'Vulnerability Scanning', 'Email Support', '5 Users'],
  },
  {
    name: 'Premium',
    price: '$599',
    billing: 'monthly',
    isPopular: true,
    description: 'Advanced protection for scaling enterprises.',
    features: ['Everything in Plus', 'SOC as a Service', 'Penetration Testing', 'Priority Support', '25 Users'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    billing: 'yearly',
    isPopular: false,
    description: 'Full-scale security for large organizations.',
    features: ['Everything in Premium', 'Dedicated Security Team', 'Custom Integrations', 'Compliance Reports', 'Unlimited Users'],
  },
]

export default async function PricingPage() {
  const pageData = await getPricingContent()
  const tiers = pageData?.content?.tiers || DEFAULT_TIERS

  return (
    <div style={{ backgroundColor: 'var(--colors-vulcan-1000)', minHeight: '100vh' }}>
      <PageViewTracker page="/pricing" />

      {/* Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-52) var(--space-24) var(--space-34)', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'var(--font-size-48)', fontWeight: 'var(--font-weight-bold)', color: 'var(--colors-natural-50)', marginBottom: 'var(--space-16)' }}>
          Simple, Transparent Pricing
        </h1>
        <p style={{ color: 'var(--colors-natural-400)', fontSize: 'var(--font-size-18)', maxWidth: '560px', margin: '0 auto' }}>
          Choose the plan that fits your organization. All plans include our core security platform.
        </p>
      </div>

      {/* Pricing grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--space-24) var(--space-52)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-24)' }}>
          {tiers.map((tier: any) => (
            <div
              key={tier.name}
              style={{
                backgroundColor: tier.isPopular ? 'var(--colors-blue-950)' : 'var(--colors-vulcan-900)',
                border: `1px solid ${tier.isPopular ? 'var(--colors-blue-700)' : 'var(--colors-vulcan-700)'}`,
                borderRadius: 'var(--border-radius-md)',
                padding: 'var(--space-34)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-20)',
                position: 'relative',
              }}
            >
              {tier.isPopular && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'var(--colors-blue-600)',
                    color: 'var(--colors-natural-50)',
                    padding: '4px var(--space-14)',
                    borderRadius: 'var(--border-radius-full)',
                    fontSize: '12px',
                    fontWeight: 'var(--font-weight-semibold)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Most Popular
                </span>
              )}

              <div>
                <h3 style={{ fontSize: 'var(--font-size-20)', fontWeight: 'var(--font-weight-bold)', color: 'var(--colors-natural-50)', marginBottom: 'var(--space-8)' }}>
                  {tier.name}
                </h3>
                <p style={{ color: 'var(--colors-natural-400)', fontSize: 'var(--font-size-14)' }}>{tier.description}</p>
              </div>

              <div>
                <span style={{ fontSize: 'var(--font-size-48)', fontWeight: 'var(--font-weight-bold)', color: 'var(--colors-natural-50)' }}>
                  {tier.price}
                </span>
                {tier.price !== 'Custom' && (
                  <span style={{ color: 'var(--colors-natural-400)', fontSize: 'var(--font-size-14)', marginLeft: 'var(--space-8)' }}>
                    /{tier.billing}
                  </span>
                )}
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-10)', flex: 1 }}>
                {(tier.features || []).map((feature: string) => (
                  <li key={feature} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', color: 'var(--colors-natural-300)', fontSize: 'var(--font-size-14)' }}>
                    <span style={{ color: 'var(--colors-blue-400)', fontWeight: 'bold' }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="/book-a-demo"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: 'var(--space-12) var(--space-24)',
                  borderRadius: 'var(--border-radius-2xsm)',
                  backgroundColor: tier.isPopular ? 'var(--colors-blue-600)' : 'transparent',
                  border: `1px solid ${tier.isPopular ? 'var(--colors-blue-600)' : 'var(--colors-vulcan-600)'}`,
                  color: 'var(--colors-natural-50)',
                  fontSize: 'var(--font-size-14)',
                  fontWeight: 'var(--font-weight-semibold)',
                  textDecoration: 'none',
                }}
              >
                {tier.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
              </a>
            </div>
          ))}
        </div>
      </div>

      <CTASection />
    </div>
  )
}
