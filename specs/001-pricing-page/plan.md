# Implementation Plan: Pricing Page

**Branch**: `001-pricing-page` | **Date**: 2026-02-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-pricing-page/spec.md`

## Summary

Build a standalone `pricing.html` page for the Nua website that displays 3 pricing tiers (Starter, Pro, Enterprise) with a monthly/annual billing toggle, a feature comparison table, social proof, an FAQ accordion, and a pre-footer CTA — all consistent with the existing Nua design system. All plan CTAs route to `book-a-demo.html`. Update navigation on all 6 existing pages to include a "Pricing" link.

## Technical Context

**Language/Version**: HTML5, CSS3, Vanilla JavaScript (ES6+) — no build tools or frameworks
**Primary Dependencies**: Google Fonts CDN (DM Sans) — already used by all existing pages. No npm packages.
**Storage**: N/A — static HTML file, no database or backend
**Testing**: Manual cross-browser and responsive testing (375px, 768px, 1440px breakpoints). No automated test framework in this project.
**Target Platform**: Web browser (Chrome, Safari, Firefox, Edge) — desktop, tablet, mobile
**Project Type**: Static website — single standalone HTML file matching existing page pattern
**Performance Goals**: Full page visible within 3 seconds on standard connection (SC-001)
**Constraints**: All visual values MUST use existing CSS custom properties from `--color-*`, `--font-*`, `--space-*`, `--border-radius-*`, `--shadow-*` token sets. No new external dependencies. No hardcoded hex/px values outside the token set.
**Scale/Scope**: 1 new HTML file (`pricing.html`) + nav/footer edits to 6 existing pages

## Constitution Check

The project constitution is a placeholder template (not configured). No formal gates to evaluate.

**Applied defaults**:
- Simplicity: minimal new code, reuse existing patterns and copy from `services.html`
- Consistency: match existing page structure exactly (`:root` tokens, navbar, footer, reveal animation)
- No new dependencies: vanilla JS only, no libraries

## Project Structure

### Documentation (this feature)

```text
specs/001-pricing-page/
├── plan.md              # This file
├── research.md          # Phase 0 — patterns research
├── data-model.md        # Phase 1 — content data model
├── quickstart.md        # Phase 1 — build guide
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
/ (repo root)
├── pricing.html          ← NEW: the pricing page
├── index.html            ← UPDATE: add Pricing nav link + footer entry
├── services.html         ← UPDATE: add Pricing nav link + footer entry
├── company.html          ← UPDATE: add Pricing nav link + footer entry
├── blog.html             ← UPDATE: add Pricing nav link + footer entry
├── blog-post.html        ← UPDATE: add Pricing nav link + footer entry
└── book-a-demo.html      ← UPDATE: add Pricing nav link + footer entry
```

**Structure Decision**: Single-file static approach — one `pricing.html` at the repo root, matching the pattern of `index.html`, `services.html`, `company.html`, etc. All shared "components" (navbar, footer, CTA section) are duplicated inline per the existing project convention.

## Implementation Phases

### Phase 0: Research (Complete → see research.md)

Resolved patterns for:
- Billing toggle (monthly/annual) with vanilla JS
- FAQ accordion (accessible, keyboard-navigable)
- Responsive feature comparison table
- Scroll reveal animation (`.reveal` class — already implemented in existing pages)

### Phase 1: Design

#### Page Sections (top to bottom)

| Order | Section | Source | Notes |
|-------|---------|--------|-------|
| 1 | Fixed Navbar | Copy from `services.html` | Add `active` class to Pricing link; retain Book a demo CTA |
| 2 | Hero | New | Headline + subheadline. Light background. `.reveal` class. |
| 3 | Billing Toggle | New | Monthly (default) / Annual. Vanilla JS swap. |
| 4 | Pricing Cards | New | 3 equal-weight cards. Starter, Pro, Enterprise. All CTAs → `book-a-demo.html` |
| 5 | Feature Comparison Table | New | Responsive (horizontal scroll on mobile). Checkmarks / dashes per cell. |
| 6 | Social Proof Logos | Copy from `services.html` | Reuse `.svc-logos-section` pattern |
| 7 | Enterprise Callout | New | Standalone section. CTA → `book-a-demo.html` |
| 8 | FAQ Accordion | New | Min 5 Q&A items. Expand/collapse per item. Accessible. |
| 9 | Pre-footer CTA | Copy from `services.html` | `.cta-footer-section` / `.cta-card` |
| 10 | Footer | Copy from `services.html` | `.footer-card` — add Pricing to Links column |
| 11 | Mobile Nav Overlay | Copy from `services.html` | Hamburger menu — add Pricing link |

#### Billing Toggle Behaviour

- Default state: **Monthly** selected
- On toggle to Annual: Starter and Pro price elements swap to annual equivalents
- Enterprise card: "Contact Sales" label NEVER changes regardless of toggle state
- Savings display: When Annual selected, show "Save X%" or "X months free" badge near toggle

#### Pricing Cards Layout

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Starter    │  │     Pro      │  │  Enterprise  │
│   $29/mo     │  │   $79/mo     │  │ Contact Sales│
│              │  │              │  │              │
│ • Feature 1  │  │ • Feature 1  │  │ • Feature 1  │
│ • Feature 2  │  │ • Feature 2  │  │ • Feature 2  │
│ • Feature 3  │  │ • Feature 3  │  │ • Feature 3  │
│ • Feature 4  │  │ • Feature 4  │  │ • Feature 4  │
│              │  │              │  │ • Feature 5  │
│ [Book Demo]  │  │ [Book Demo]  │  │ [Contact]    │
└──────────────┘  └──────────────┘  └──────────────┘
       Equal visual weight — no badge or elevation difference
```

On mobile: cards stack vertically (single column).

#### Feature Comparison Table Layout

```
| Feature               | Starter | Pro | Enterprise |
|-----------------------|---------|-----|------------|
| Core feature 1        |   ✓     |  ✓  |     ✓      |
| Core feature 2        |   ✓     |  ✓  |     ✓      |
| Advanced feature 1    |   —     |  ✓  |     ✓      |
| Advanced feature 2    |   —     |  ✓  |     ✓      |
| Enterprise feature 1  |   —     |  —  |     ✓      |
| Enterprise feature 2  |   —     |  —  |     ✓      |
```

On mobile: table gets `overflow-x: auto` wrapper; plan columns remain visible.

#### FAQ Accordion

Minimum 5 items. Expand/collapse on click. One item can be open at a time (or multiple — single-open is simpler). Keyboard accessible (Enter/Space to toggle).

Placeholder questions:
1. What's included in each plan?
2. Can I change my plan later?
3. What payment methods do you accept?
4. Is there a free trial?
5. How do I cancel my subscription?

#### Empty State (FR-014)

When pricing data is unavailable (placeholder cards hidden via CSS class toggle):
- Display: "Pricing coming soon. In the meantime, get in touch."
- CTA: "Contact us" → `book-a-demo.html`

#### Navigation Updates (all 6 existing pages)

In each page's `<nav class="svc-navbar">`, add between Services and Resources:
```html
<a href="pricing.html" class="svc-nav-link">Pricing</a>
```

In each page's mobile nav overlay:
```html
<a href="pricing.html" class="mobile-nav-link">Pricing</a>
```

In each page's footer Links column:
```html
<a href="pricing.html" class="footer-link">Pricing</a>
```

### Phase 2: Tasks

See `/speckit.tasks` command output → `tasks.md`

## Complexity Tracking

No constitution violations. This is a straightforward static HTML page using existing patterns.
