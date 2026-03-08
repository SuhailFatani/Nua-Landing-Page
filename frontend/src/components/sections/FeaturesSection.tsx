import { Icon } from '@iconify/react'

interface Feature {
  icon?: string
  title: string
  description: string
}

const DEFAULT_FEATURES: Feature[] = [
  { icon: 'solar:shield-check-linear', title: 'Threat Detection', description: 'Real-time detection and response to advanced persistent threats.' },
  { icon: 'solar:lock-linear', title: 'Zero Trust Architecture', description: 'Never trust, always verify. Secure every user, device, and application.' },
  { icon: 'solar:chart-2-linear', title: 'Security Analytics', description: 'Deep visibility into your security posture with actionable insights.' },
  { icon: 'solar:bug-linear', title: 'Penetration Testing', description: 'Expert-led offensive security to find vulnerabilities before attackers do.' },
  { icon: 'solar:document-add-linear', title: 'Compliance Management', description: 'ISO 27001, SOC 2, GDPR compliance with automated evidence collection.' },
  { icon: 'solar:call-chat-linear', title: '24/7 SOC Support', description: 'Round-the-clock security operations center monitoring your environment.' },
]

interface FeaturesSectionProps {
  features: Feature[]
}

export function FeaturesSection({ features }: FeaturesSectionProps) {
  const displayFeatures = features.length > 0 ? features : DEFAULT_FEATURES

  return (
    <section
      style={{
        padding: 'var(--space-52) var(--space-24)',
        backgroundColor: 'var(--colors-vulcan-950)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-40)' }}>
          <h2
            style={{
              fontSize: 'var(--font-size-36, 36px)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--colors-natural-50)',
              marginBottom: 'var(--space-16)',
            }}
          >
            Complete Security Coverage
          </h2>
          <p style={{ color: 'var(--colors-natural-400)', fontSize: 'var(--font-size-18)', maxWidth: '560px', margin: '0 auto' }}>
            Everything you need to protect your enterprise from modern cyber threats.
          </p>
        </div>

        {/* Features grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--space-24)',
          }}
        >
          {displayFeatures.map((feature, i) => (
            <div
              key={i}
              style={{
                backgroundColor: 'var(--colors-vulcan-900)',
                border: '1px solid var(--colors-vulcan-700)',
                borderRadius: 'var(--border-radius-md)',
                padding: 'var(--space-24)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'var(--colors-blue-950)',
                  borderRadius: 'var(--border-radius-xsm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--space-16)',
                }}
              >
                <Icon
                  icon={feature.icon || 'solar:shield-linear'}
                  style={{ fontSize: '24px', color: 'var(--colors-blue-400)' }}
                />
              </div>
              <h3
                style={{
                  fontSize: 'var(--font-size-18)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--colors-natural-50)',
                  marginBottom: 'var(--space-8)',
                }}
              >
                {feature.title}
              </h3>
              <p style={{ color: 'var(--colors-natural-400)', fontSize: 'var(--font-size-14)', lineHeight: '1.6' }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
