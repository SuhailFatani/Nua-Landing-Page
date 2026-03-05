import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import argon2 from 'argon2'

const prisma = new PrismaClient()

const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
}

// ─── Default page content skeletons ───────────────────────────
const defaultPages = [
  {
    slug: 'home',
    title: 'Nua Security — Home',
    metaDesc: 'Nua Security — enterprise cybersecurity for modern teams.',
    content: JSON.stringify({
      nav: { logo: 'Nua Security', links: [], cta: 'Book a Demo' },
      hero: {
        headline: 'Enterprise Security, Built for Modern Teams',
        subheadline: 'Nua Security protects your organization with ISO 27001 certified practices.',
        cta: 'Book a Demo',
      },
      features: [],
      testimonials: [],
    }),
  },
  {
    slug: 'pricing',
    title: 'Nua Security — Pricing',
    metaDesc: 'Simple, transparent pricing for every team.',
    content: JSON.stringify({
      hero: { headline: 'Transparent Pricing', subheadline: 'No hidden fees.' },
      plans: [],
    }),
  },
  {
    slug: 'services',
    title: 'Nua Security — Services',
    metaDesc: 'Cybersecurity services tailored to your needs.',
    content: JSON.stringify({
      hero: { headline: 'Our Services' },
      services: [],
    }),
  },
  {
    slug: 'company',
    title: 'Nua Security — Company',
    metaDesc: 'About Nua Security.',
    content: JSON.stringify({
      hero: { headline: 'About Nua Security' },
      team: [],
      values: [],
    }),
  },
  {
    slug: 'blog',
    title: 'Nua Security — Blog',
    metaDesc: 'Cybersecurity insights from the Nua Security team.',
    content: JSON.stringify({
      hero: { headline: 'Security Insights' },
    }),
  },
  {
    slug: 'book_a_demo',
    title: 'Nua Security — Book a Demo',
    metaDesc: 'Schedule a demo with the Nua Security team.',
    content: JSON.stringify({
      hero: { headline: 'Book a Demo' },
      form: {},
    }),
  },
]

// ─── Sample blog posts ─────────────────────────────────────────
const samplePosts = [
  {
    title: 'Top 5 Cybersecurity Threats in 2026',
    slug: 'top-5-cybersecurity-threats-2026',
    excerpt: 'The threat landscape is evolving rapidly. Here are the top 5 threats organizations face in 2026.',
    content: `
      <h2>1. AI-Powered Phishing Attacks</h2>
      <p>Attackers are now using large language models to craft highly convincing phishing emails that bypass traditional filters...</p>
      <h2>2. Supply Chain Vulnerabilities</h2>
      <p>Third-party software dependencies remain a significant attack vector, as demonstrated by recent high-profile breaches...</p>
      <h2>3. Ransomware as a Service (RaaS)</h2>
      <p>The commoditization of ransomware toolkits has lowered the barrier for attackers, leading to a surge in incidents...</p>
      <h2>4. Cloud Misconfiguration</h2>
      <p>As organizations migrate to cloud-first architectures, misconfigured storage buckets and IAM policies continue to expose sensitive data...</p>
      <h2>5. Insider Threats</h2>
      <p>Whether malicious or accidental, insider threats account for over 30% of security incidents in 2026...</p>
    `,
    status: 'PUBLISHED',
    metaTitle: 'Top 5 Cybersecurity Threats in 2026 | Nua Security',
    metaDesc: 'Discover the top cybersecurity threats organizations face in 2026 and how to protect against them.',
  },
  {
    title: 'What is ISO 27001 and Why Does it Matter?',
    slug: 'what-is-iso-27001',
    excerpt: 'ISO 27001 is the gold standard for information security management. Learn what it means for your business.',
    content: `
      <h2>What is ISO 27001?</h2>
      <p>ISO 27001 is an internationally recognized standard for information security management systems (ISMS)...</p>
      <h2>Why Should Your Organization Care?</h2>
      <p>Achieving ISO 27001 certification demonstrates to customers, partners, and regulators that your organization takes security seriously...</p>
      <h2>How Nua Security Can Help</h2>
      <p>Our team of certified professionals guides organizations through the entire ISO 27001 journey, from gap analysis to certification...</p>
    `,
    status: 'PUBLISHED',
    metaTitle: 'What is ISO 27001? | Nua Security Blog',
    metaDesc: 'Learn about ISO 27001 certification and why it matters for enterprise security.',
  },
  {
    title: 'Zero Trust Architecture: A Practical Guide',
    slug: 'zero-trust-architecture-guide',
    excerpt: 'Zero Trust is more than a buzzword. Here is how to implement it in your organization.',
    content: `
      <h2>The Zero Trust Principle</h2>
      <p>Never trust, always verify. Zero Trust assumes breach and verifies every request as if it originates from an open network...</p>
      <h2>Core Components</h2>
      <p>Implementing Zero Trust requires identity verification, device health checks, least-privilege access, and micro-segmentation...</p>
    `,
    status: 'DRAFT',
    metaTitle: 'Zero Trust Architecture Guide | Nua Security',
    metaDesc: 'A practical guide to implementing Zero Trust architecture in enterprise environments.',
  },
]

async function main() {
  console.log('🌱 Seeding Nua Security database...\n')

  // ── Create admin user ────────────────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@nuasecurity.com'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'NuaAdmin2026!'

  const exists = await prisma.user.findUnique({ where: { email: adminEmail } })

  let adminUser: { id: string; email: string }

  if (!exists) {
    const passwordHash = await argon2.hash(adminPassword, ARGON2_OPTIONS)
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Nua Admin',
        passwordHash,
        role: 'ADMIN',
      },
    })
    console.log(`✅ Admin user created: ${adminUser.email}`)
    console.log(`   Password: ${adminPassword}`)
    console.log(`   ⚠️  Change this password immediately after first login!\n`)
  } else {
    adminUser = exists
    console.log(`ℹ️  Admin user already exists: ${adminEmail}\n`)
  }

  // ── Seed pages ───────────────────────────────────────────────
  for (const page of defaultPages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: {
        slug: page.slug,
        title: page.title,
        metaDesc: page.metaDesc,
        content: page.content,
        isPublished: true,
        publishedAt: new Date(),
      },
    })
    console.log(`✅ Page seeded: /${page.slug}`)
  }

  // ── Seed blog posts ──────────────────────────────────────────
  console.log('\n📝 Seeding blog posts...')
  for (const post of samplePosts) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } })
    if (!existing) {
      await prisma.blogPost.create({
        data: {
          ...post,
          authorId: adminUser.id,
          publishedAt: post.status === 'PUBLISHED' ? new Date() : null,
        },
      })
      console.log(`✅ Blog post seeded: "${post.title}" [${post.status}]`)
    } else {
      console.log(`ℹ️  Blog post already exists: "${post.title}"`)
    }
  }

  console.log('\n🎉 Seed complete!\n')
  console.log('─────────────────────────────────────────')
  console.log(`🔑 Admin Login:`)
  console.log(`   Email:    ${adminEmail}`)
  console.log(`   Password: ${adminPassword}`)
  console.log(`   URL:      http://https://nua-landing-page-production.up.railway.app`)
  console.log('─────────────────────────────────────────\n')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
