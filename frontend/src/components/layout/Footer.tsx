import Link from 'next/link'

const FOOTER_LINKS = {
  Services: [
    { href: '/services', label: 'Overview' },
    { href: '/services/penetration-testing', label: 'Penetration Testing' },
    { href: '/services/soc', label: 'SOC as a Service' },
    { href: '/services/compliance', label: 'Compliance' },
  ],
  Company: [
    { href: '/company', label: 'About Us' },
    { href: '/blog', label: 'Blog' },
    { href: '/book-a-demo', label: 'Book a Demo' },
  ],
}

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      style={{
        backgroundColor: 'var(--colors-vulcan-1000)',
        borderTop: '1px solid var(--colors-vulcan-800)',
        paddingTop: 'var(--space-52)',
        paddingBottom: 'var(--space-24)',
        marginTop: 'var(--space-52)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 var(--space-24)',
        }}
      >
        {/* Top section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 'var(--space-40)',
            marginBottom: 'var(--space-40)',
          }}
        >
          {/* Brand */}
          <div>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-8)',
                textDecoration: 'none',
                marginBottom: 'var(--space-16)',
              }}
            >
              <span style={{ fontSize: 'var(--font-size-20)', fontWeight: 'var(--font-weight-bold)', color: 'var(--colors-natural-50)' }}>
                Nua
              </span>
              <span style={{ fontSize: 'var(--font-size-20)', fontWeight: 'var(--font-weight-bold)', color: 'var(--colors-blue-600)' }}>
                Security
              </span>
            </Link>
            <p style={{ color: 'var(--colors-natural-500)', fontSize: 'var(--font-size-14)', lineHeight: '1.6', maxWidth: '280px' }}>
              Enterprise-grade cybersecurity protecting your business from evolving threats.
            </p>
            <p style={{ color: 'var(--colors-natural-500)', fontSize: 'var(--font-size-14)', marginTop: 'var(--space-12)' }}>
              <a href="mailto:info@nuasecurity.com" style={{ color: 'var(--colors-blue-400)', textDecoration: 'none' }}>
                info@nuasecurity.com
              </a>
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4
                style={{
                  color: 'var(--colors-natural-50)',
                  fontSize: 'var(--font-size-14)',
                  fontWeight: 'var(--font-weight-semibold)',
                  marginBottom: 'var(--space-16)',
                }}
              >
                {section}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      style={{
                        color: 'var(--colors-natural-500)',
                        fontSize: 'var(--font-size-14)',
                        textDecoration: 'none',
                      }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid var(--colors-vulcan-800)',
            paddingTop: 'var(--space-24)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <p style={{ color: 'var(--colors-natural-500)', fontSize: 'var(--font-size-14)' }}>
            © {year} NUA USA. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-16)' }}>
            {/* ISO 27001 badge */}
            <span
              style={{
                padding: '4px var(--space-10)',
                borderRadius: 'var(--border-radius-2xsm)',
                border: '1px solid var(--colors-vulcan-700)',
                color: 'var(--colors-natural-400)',
                fontSize: '12px',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              ISO 27001
            </span>
            <span
              style={{
                padding: '4px var(--space-10)',
                borderRadius: 'var(--border-radius-2xsm)',
                border: '1px solid var(--colors-vulcan-700)',
                color: 'var(--colors-natural-400)',
                fontSize: '12px',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              Gartner Recognized
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
