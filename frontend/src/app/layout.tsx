import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Nua Security — Enterprise Cybersecurity Solutions',
    template: '%s | Nua Security',
  },
  description: 'Protect your business with enterprise-grade cybersecurity. ISO 27001 certified, Gartner recognized.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://nuasecurity.com'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
