# Nua Security — CMS & Full-Stack Platform Specification

## Project Overview

Build a complete, production-grade CMS-powered website for **Nua Security** (nuasecurity.com), a cybersecurity company. The system must include a headless CMS with an admin panel, a blog system for team publishing, full landing page management, analytics tracking, demo booking, and enterprise-level security — all following cybersecurity best practices.

---

## Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **Deployment:** Vercel (or AWS CloudFront + S3)

#### ⚠️ CRITICAL FRONTEND RULE: Reuse Existing Design System

The current Nua Security website already has established components, design tokens/variables, and a consistent visual style. **You MUST follow these rules strictly:**

1. **Use existing components first** — Before creating any new component, audit the existing codebase for reusable components (buttons, cards, sections, headers, footers, CTAs, modals, forms, badges, etc.). Only create a new component if nothing similar exists. If a similar component exists, extend or adapt it — do NOT duplicate.

2. **Use existing design tokens/variables** — The project has established CSS variables and/or Tailwind config tokens for colors, spacing, typography, border-radius, shadows, etc. **Never hardcode color hex values, font sizes, spacing pixels, or any design value.** Always reference the existing tokens:
   - Colors (primary orange, accent blue, dark backgrounds, text colors, border colors)
   - Typography (DM Sans font family, font sizes, font weights, line heights)
   - Spacing scale (padding, margin, gap values)
   - Border radius values
   - Shadow definitions
   - Breakpoints for responsive design

3. **Match the existing design style** — Study the current live pages and codebase (landing page, pricing page, blog, services, book-a-demo, company) and replicate the exact same visual language across all new pages:
   - Dark theme with orange/blue accent colors
   - Section layout patterns (spacing between sections, container widths, alignment)
   - Card styles and hover effects
   - Button variants and states (primary, secondary, ghost, sizes)
   - Animation patterns (Lottie animations in CTA, transitions, hover effects)
   - Responsive behavior and breakpoints
   - RTL support patterns for Arabic content
   - Badge/trust signal styling (ISO 27001, Gartner)

4. **No new design patterns without justification** — Every new page or section must feel like it naturally belongs to the existing website. If a new pattern is truly needed, derive it from the closest existing pattern and use the same tokens. Document why a new pattern was needed.

5. **Component audit before building any page** — Before starting work on any page:
   - List all existing components that can be reused directly
   - List components that need minor modifications
   - List only truly new components that must be created
   - Get alignment on this list before writing code

6. **Single source of truth** — The existing Tailwind config (`tailwind.config.ts`) and any CSS variable files are the single source of truth for all design values. If a value doesn't exist in the config, add it to the config first — never inline it.

**Reference: The current site at nuasecurity.com and the existing codebase are the source of truth for all design decisions. When in doubt, match what already exists.**

### Backend / CMS
- **CMS:** Strapi v5 (Self-hosted, Open Source)
- **Database:** PostgreSQL
- **Deployment:** AWS EC2/ECS or DigitalOcean Droplet (Docker)

### Authentication
- **NextAuth.js (Auth.js)** for admin panel authentication
- OAuth 2.0 + PKCE flow
- SSO support for team members

### Media & Assets
- **Cloudinary** or **AWS S3** for image/file storage
- Automatic image optimization via Next.js Image component

### Analytics
- **PostHog** (self-hosted preferred) or **Google Analytics 4** — quantitative analytics
- **Microsoft Clarity** — qualitative analytics (heatmaps, session recordings)
- Custom event tracking for: page views, button clicks, demo bookings, pricing page visits

### Security Layer
- **Cloudflare** — WAF, DDoS protection, DNS, CDN
- **TLS 1.3** for data in transit
- **AES-256** encryption for data at rest
- Content Security Policy (CSP) headers in Next.js
- Rate limiting on all API endpoints
- Input validation and sanitization on all forms
- CORS properly configured (whitelist frontend domain only)

### CI/CD
- **GitHub Actions** for automated testing, linting, security scanning, and deployment
- SAST (Static Application Security Testing) in pipeline
- SCA (Software Composition Analysis) for dependency vulnerabilities
- DAST (Dynamic Application Security Testing) in staging

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   CLOUDFLARE                     │
│         (WAF / CDN / DDoS Protection)            │
└──────────────┬──────────────────┬────────────────┘
               │                  │
    ┌──────────▼──────────┐  ┌───▼────────────────┐
    │   Next.js Frontend  │  │   Strapi v5 CMS    │
    │   (Vercel / AWS)    │  │   (Self-hosted)    │
    │                     │  │                    │
    │  - Landing Pages    │  │  - Admin Panel     │
    │  - Blog             │  │  - Content API     │
    │  - Pricing Page     │  │  - Media Library   │
    │  - Book Demo Form   │  │  - RBAC            │
    │  - SEO Optimized    │  │  - Audit Logs      │
    └──────────┬──────────┘  └───┬────────────────┘
               │                  │
               │    REST / GraphQL API
               │                  │
    ┌──────────▼──────────────────▼────────────────┐
    │              PostgreSQL Database              │
    │         (Encrypted at rest, Backups)          │
    └──────────────────────────────────────────────┘
               │
    ┌──────────▼──────────────────────────────────┐
    │           Analytics Layer                    │
    │  - PostHog / GA4 (quantitative)             │
    │  - Microsoft Clarity (qualitative)          │
    │  - Custom event tracking                    │
    └─────────────────────────────────────────────┘
```

---

## Strapi Content Types (Data Models)

### 1. Page
- `title` (string, required)
- `slug` (string, unique, required)
- `sections` (dynamic zone — allows flexible page building)
- `seo` (component: meta_title, meta_description, og_image, canonical_url)
- `status` (enum: draft, published)
- `locale` (en, ar)

### 2. Blog Post
- `title` (string, required)
- `slug` (string, unique, required)
- `excerpt` (text)
- `content` (rich text / blocks)
- `cover_image` (media)
- `author` (relation → Author)
- `categories` (relation → Category, many-to-many)
- `tags` (relation → Tag, many-to-many)
- `published_at` (datetime)
- `seo` (component)
- `reading_time` (integer, auto-calculated)
- `status` (enum: draft, review, published)

### 3. Author
- `name` (string)
- `bio` (text)
- `avatar` (media)
- `role` (string)
- `social_links` (component: linkedin, twitter, github)

### 4. Category
- `name` (string)
- `slug` (string, unique)
- `description` (text)

### 5. Tag
- `name` (string)
- `slug` (string, unique)

### 6. Pricing Tier
- `name` (string — e.g., Plus, Premium, Enterprise)
- `price` (string — allows "Custom" for enterprise)
- `billing_period` (enum: monthly, yearly)
- `description` (text)
- `features` (component, repeatable: feature_name, included boolean)
- `cta_text` (string)
- `cta_link` (string)
- `is_popular` (boolean)
- `order` (integer)

### 7. FAQ
- `question` (string)
- `answer` (rich text)
- `category` (string)
- `order` (integer)

### 8. Demo Booking
- `name` (string, required)
- `email` (email, required)
- `company` (string)
- `phone` (string)
- `message` (text)
- `source_page` (string — which page they came from)
- `status` (enum: new, contacted, scheduled, completed, cancelled)
- `submitted_at` (datetime)

### 9. Service
- `title` (string)
- `slug` (string, unique)
- `description` (rich text)
- `icon` (media)
- `features` (component, repeatable)
- `order` (integer)

### 10. Testimonial
- `name` (string)
- `company` (string)
- `role` (string)
- `quote` (text)
- `avatar` (media)
- `rating` (integer, 1-5)

### 11. Partner / Badge
- `name` (string — e.g., ISO 27001, Gartner)
- `logo` (media)
- `link` (string)
- `type` (enum: certification, partner, award)

### 12. Site Settings (Single Type)
- `site_name` (string)
- `logo` (media)
- `favicon` (media)
- `footer_text` (string)
- `social_links` (component: linkedin, twitter, github, youtube)
- `contact_email` (email)
- `contact_phone` (string)
- `address` (text)
- `announcement_bar` (component: text, link, is_active)

---

## Frontend Pages & Routes

```
/                       → Home (Landing Page)
/services               → Services overview
/services/[slug]        → Individual service page
/pricing                → Pricing page with tiers + FAQ + comparison table
/blog                   → Blog listing (paginated, filterable by category/tag)
/blog/[slug]            → Individual blog post
/company                → About / Company page
/book-a-demo            → Demo booking form
/contact                → Contact page
```

---

## Admin Panel Roles & Permissions (Strapi RBAC)

### Super Admin
- Full access to everything
- Manage users and roles
- Access audit logs
- Manage site settings

### Editor
- Create, edit, publish blog posts
- Manage media library
- Edit page content
- Cannot manage users or settings

### Author
- Create and edit own blog posts only
- Submit for review (cannot publish directly)
- Upload media

### Viewer (Read-only)
- View content and analytics
- Cannot edit or publish

---

## Analytics & Tracking Implementation

### Events to Track
```typescript
// Page views (automatic with PostHog/GA4)
track('page_view', { page: '/pricing', referrer: document.referrer })

// Demo booking
track('demo_booking_submitted', {
  source_page: '/pricing',
  company: 'Acme Corp'
})

// CTA clicks
track('cta_click', {
  button_text: 'Book a Demo',
  page: '/home',
  section: 'hero'
})

// Pricing interaction
track('pricing_tier_viewed', { tier: 'Premium' })
track('pricing_toggle', { period: 'yearly' })
track('pricing_faq_opened', { question: 'What is included?' })

// Blog engagement
track('blog_post_read', {
  slug: 'cyber-threats-2025',
  reading_time: 5,
  scroll_depth: 80
})

// Navigation
track('nav_click', { item: 'Services', from: '/home' })
```

### Dashboards to Build
- **Visitor Overview:** Total visitors, unique visitors, page views, bounce rate
- **Conversion Funnel:** Home → Pricing → Book Demo → Submitted
- **Blog Performance:** Most read posts, avg reading time, engagement
- **Lead Tracking:** Demo bookings by source page, status, company
- **SEO Metrics:** Organic traffic, top keywords, Core Web Vitals

---

## SEO Implementation

### Technical SEO
- Server-side rendering (SSR) for dynamic pages
- Static site generation (SSG) for blog posts and service pages
- Automatic sitemap.xml generation
- robots.txt configuration
- Canonical URLs on all pages
- Open Graph + Twitter Card meta tags
- JSON-LD structured data (Organization, BlogPosting, FAQPage, Service)
- Hreflang tags for Arabic/English
- Image alt texts managed from Strapi

### Performance SEO
- Core Web Vitals optimization (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- Next.js Image optimization (WebP, lazy loading, responsive sizes)
- Font optimization (next/font for DM Sans)
- Code splitting and tree shaking
- CDN caching via Cloudflare

---

## Security Checklist

### Application Security
- [ ] All API endpoints authenticated (JWT/Session tokens)
- [ ] CORS whitelist frontend domain only
- [ ] Rate limiting on all endpoints (express-rate-limit)
- [ ] Input validation on all forms (zod / yup)
- [ ] SQL injection prevention (parameterized queries via ORM)
- [ ] XSS prevention (Content Security Policy headers)
- [ ] CSRF protection on forms
- [ ] File upload validation (type, size, malware scan)
- [ ] HTTP security headers (Strict-Transport-Security, X-Frame-Options, etc.)

### Infrastructure Security
- [ ] TLS 1.3 everywhere
- [ ] Database encrypted at rest (AES-256)
- [ ] Environment variables for all secrets (never in code)
- [ ] Secrets management (AWS Secrets Manager or .env with restricted access)
- [ ] Regular automated backups (database + media)
- [ ] Cloudflare WAF rules configured
- [ ] DDoS protection active

### Access Control
- [ ] RBAC in Strapi with least privilege principle
- [ ] SSO for admin panel access
- [ ] MFA enabled for all admin users
- [ ] Audit logs for all content changes
- [ ] Session timeout configured
- [ ] IP whitelisting for admin panel (optional)

### DevSecOps Pipeline
- [ ] SAST scanning on every commit (e.g., Semgrep, CodeQL)
- [ ] SCA dependency analysis (e.g., Snyk, npm audit)
- [ ] DAST testing in staging (e.g., OWASP ZAP)
- [ ] Security gates blocking deployment on critical vulnerabilities
- [ ] Container image scanning (if using Docker)
- [ ] Secrets scanning in CI (e.g., git-secrets, truffleHog)

---

## Project Structure

```
nua-security/
├── frontend/                    # Next.js App
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   ├── (marketing)/     # Landing, pricing, services
│   │   │   ├── blog/            # Blog pages
│   │   │   ├── book-a-demo/     # Demo booking
│   │   │   └── api/             # API routes (webhooks, etc.)
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── layout/          # Header, Footer, Nav
│   │   │   ├── sections/        # Hero, CTA, Features, etc.
│   │   │   └── blog/            # Blog-specific components
│   │   ├── lib/                 # Utilities
│   │   │   ├── strapi.ts        # Strapi API client
│   │   │   ├── analytics.ts     # Analytics helpers
│   │   │   └── utils.ts         # General utilities
│   │   ├── types/               # TypeScript types
│   │   └── styles/              # Global styles
│   ├── public/                  # Static assets
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── package.json
│
├── cms/                         # Strapi v5
│   ├── src/
│   │   ├── api/                 # Content types
│   │   ├── components/          # Shared components
│   │   ├── middlewares/         # Custom middleware (rate limiting, etc.)
│   │   └── plugins/             # Custom plugins
│   ├── config/
│   │   ├── database.ts          # PostgreSQL config
│   │   ├── middlewares.ts       # Security middlewares
│   │   ├── plugins.ts           # Plugin configs
│   │   └── server.ts            # Server config
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml           # Local dev (Strapi + PostgreSQL)
├── .github/
│   └── workflows/
│       ├── ci.yml               # Lint, test, security scan
│       ├── deploy-frontend.yml  # Deploy Next.js
│       └── deploy-cms.yml       # Deploy Strapi
└── README.md
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Set up Next.js project with TypeScript + Tailwind + shadcn/ui
- Set up Strapi v5 with PostgreSQL (Docker)
- Define all content types in Strapi
- Configure RBAC roles and permissions
- Set up Strapi API client in Next.js
- Basic authentication with NextAuth.js

### Phase 2: Core Pages (Week 3-4)
- Build Home / Landing page (dynamic sections from Strapi)
- Build Pricing page (tiers, FAQ, comparison table from Strapi)
- Build Services pages
- Build Company page
- Build Book a Demo page with form submission to Strapi
- Implement Header, Footer, Navigation (all CMS-managed)

### Phase 3: Blog System (Week 5-6)
- Blog listing page with pagination and filtering
- Individual blog post page with rich content rendering
- Author pages
- Category and tag filtering
- Related posts
- Social sharing
- Reading time calculation

### Phase 4: SEO & Analytics (Week 7)
- Implement all SEO (sitemap, meta tags, structured data, OG tags)
- Integrate PostHog/GA4 for analytics
- Integrate Microsoft Clarity for heatmaps
- Set up custom event tracking
- Build analytics dashboards

### Phase 5: Security Hardening & DevOps (Week 8)
- Configure Cloudflare WAF
- Set up all security headers
- Implement rate limiting
- Set up CI/CD pipeline with security scanning
- Configure automated backups
- Performance optimization (Core Web Vitals)
- Load testing

### Phase 6: QA & Launch (Week 9-10)
- End-to-end testing
- Security audit / penetration testing
- Content migration from current site
- Team training on Strapi admin panel
- Staging environment review
- Production deployment
- Post-launch monitoring

---

## Key Commands

```bash
# Frontend (Next.js)
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir
cd frontend && npx shadcn@latest init

# CMS (Strapi v5)
npx create-strapi@latest cms --typescript
cd cms && npm run develop

# Database (Docker)
docker run --name nua-postgres -e POSTGRES_DB=nua_cms -e POSTGRES_USER=nua -e POSTGRES_PASSWORD=<secure_password> -p 5432:5432 -d postgres:16

# Full stack (Docker Compose)
docker-compose up -d
```

---

## Notes

- All content on the landing page should be editable from Strapi (no hardcoded text)
- The current site uses HTML pages with injected JS components — this migration moves everything to Next.js + Strapi
- Design system uses DM Sans font and dark theme with orange/blue accents
- ISO 27001 and Gartner badges should be manageable from Strapi
- Lottie animations currently used in CTA sections should be preserved
- Arabic language support is required (RTL layout)
- The system must be production-ready, not a prototype