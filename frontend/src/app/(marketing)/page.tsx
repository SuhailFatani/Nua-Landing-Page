/**
 * Home page — fetches content from Django CMS (pages/home endpoint).
 * Falls back to static content if API is unavailable.
 */
import type { Metadata } from 'next'
import { HeroSection } from '@/components/sections/HeroSection'
import { FeaturesSection } from '@/components/sections/FeaturesSection'
import { CTASection } from '@/components/sections/CTASection'
import { PageViewTracker } from '@/components/PageViewTracker'

export const metadata: Metadata = {
  title: 'Enterprise Cybersecurity Solutions',
  description: 'Protect your business with enterprise-grade cybersecurity. ISO 27001 certified, Gartner recognized.',
}

async function getHomePageContent() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000'}/api/pages/home/`,
      { next: { revalidate: 300 } }  // revalidate every 5 minutes
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function HomePage() {
  const pageData = await getHomePageContent()
  const content = pageData?.content || {}

  return (
    <>
      <PageViewTracker page="/" />
      <HeroSection
        headline={content?.hero?.headline || 'Enterprise-Grade Cybersecurity'}
        subheadline={content?.hero?.subheadline || 'Protecting your business with cutting-edge security solutions trusted by enterprises globally.'}
        ctaText={content?.hero?.ctaText || 'Book a Demo'}
        ctaLink={content?.hero?.ctaLink || '/book-a-demo'}
      />
      <FeaturesSection features={content?.features || []} />
      <CTASection />
    </>
  )
}
