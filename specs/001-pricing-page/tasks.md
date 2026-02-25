# Tasks: Pricing Page

**Input**: Design documents from `/specs/001-pricing-page/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- No automated test framework — manual browser verification only (SC-004)

---

## Phase 1: Setup

**Purpose**: Create the pricing.html file skeleton that all subsequent tasks will populate.

- [X] T001 Create `pricing.html` at repo root with full HTML5 skeleton: `<!DOCTYPE html>`, `<html lang="en">`, `<head>` with `<meta charset="UTF-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1.0">`, `<title>Pricing | Nua</title>`, Google Fonts CDN link for DM Sans (300, 400, 500, 600, 700), empty `<style>` block, empty `<body>`, empty `<script>` block

**Checkpoint**: `pricing.html` exists and can be opened in a browser (blank page with correct title)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared infrastructure — CSS tokens, shared JS, navbar, footer — that MUST be in place before any user story section can be built.

**⚠️ CRITICAL**: All phases 3–9 depend on this phase being complete.

- [X] T002 Copy the complete `:root` CSS custom property block (all `--color-*`, `--font-*`, `--space-*`, `--border-radius-*`, `--shadow-*` token declarations) from `services.html` into the `<style>` block in `pricing.html`
- [X] T003 [P] Copy the fixed navbar HTML (`svc-navbar-section`, `svc-navbar`, `svc-nav-links` with Company/Services/Resources links, `btn-primary` "Book a demo" CTA, hamburger button `.nav-mobile-btn`) from `services.html` into `pricing.html`; use `navbar-light` theme variant; add `<a href="pricing.html" class="svc-nav-link active">Pricing</a>` between Services and Resources
- [X] T004 [P] Copy the mobile nav overlay HTML (`.mobile-nav-overlay`, `.mobile-nav-links` with Company/Services/Resources links, close button) from `services.html` into `pricing.html`; add `<a href="pricing.html" class="mobile-nav-link">Pricing</a>` between Services and Resources
- [X] T005 [P] Copy the pre-footer CTA section HTML (`cta-footer-section`, `cta-card` with headline and "Book a demo" CTA button) from `services.html` into `pricing.html`
- [X] T006 [P] Copy the footer HTML (`footer-card` with Nua logo, nav columns, social icons for X/Twitter and LinkedIn, ISO 27001 badge, Gartner badge, copyright) from `services.html` into `pricing.html`; add `<a href="pricing.html" class="footer-link">Pricing</a>` to the "Links" column after "Services"
- [X] T007 [P] Copy the mobile hamburger menu open/close JS (click handlers for `.nav-mobile-btn` to toggle `.mobile-nav-overlay` visibility) from `services.html` into the `<script>` block in `pricing.html`
- [X] T008 [P] Copy the IntersectionObserver scroll-reveal JS block (targets `.reveal` elements, adds `.visible` class on viewport entry) from `services.html` into the `<script>` block in `pricing.html`

**Checkpoint**: Open `pricing.html` in browser — fixed navbar and footer render correctly; mobile hamburger opens/closes overlay; page title shows "Pricing | Nua"

---

## Phase 3: User Story 1 — Prospect Evaluates Plans (Priority: P1) 🎯 MVP

**Goal**: Display all 3 pricing tiers (Starter, Pro, Enterprise) with placeholder names, prices, feature lists, and CTAs so a visitor can understand the available plans.

**Independent Test**: Open `pricing.html` — all 3 plan cards are visible with plan names, price values, 4–6 feature bullet points each, and "Book a Demo" CTA buttons that resolve to `book-a-demo.html`. No toggle interaction required.

### Implementation for User Story 1

- [X] T009 [US1] Write hero section HTML (`<section class="pricing-hero reveal">`) in `pricing.html` with `<h1>` headline ("Simple, transparent pricing"), `<p>` subheadline ("Choose the plan that fits your team. All plans include a personalised demo.")
- [X] T010 [US1] Add CSS for `.pricing-hero` in `pricing.html` `<style>`: background `var(--color-natural-50)`, dark heading color, centered text layout, padding using `--space-*` tokens
- [X] T011 [P] [US1] Write Starter plan card HTML inside `.pricing-cards-grid` in `pricing.html`: `<div class="pricing-card">` with `<h3>` "Starter", `.price-amount` "$29", `.price-period` "/mo", 5-item `<ul>` feature list (Up to 5 users, Core security features, Standard dashboard, Email support, Monthly reports), `<a href="book-a-demo.html" class="btn-primary">Book a Demo</a>`
- [X] T012 [P] [US1] Write Pro plan card HTML inside `.pricing-cards-grid` in `pricing.html`: `<div class="pricing-card">` with `<h3>` "Pro", `.price-amount` "$79", `.price-period` "/mo", 6-item `<ul>` feature list (Up to 25 users, Advanced threat detection, Custom dashboard, Priority support, Weekly reports, API access), `<a href="book-a-demo.html" class="btn-primary">Book a Demo</a>`
- [X] T013 [P] [US1] Write Enterprise plan card HTML inside `.pricing-cards-grid` in `pricing.html`: `<div class="pricing-card">` with `<h3>` "Enterprise", `.enterprise-price` static text "Contact Sales" (no `data-monthly`/`data-annual` attributes), 6-item `<ul>` feature list (Unlimited users, Full threat intelligence suite, Dedicated dashboard, 24/7 dedicated support, Real-time reporting, Custom integrations), `<a href="book-a-demo.html" class="btn-primary">Book a Demo</a>`
- [X] T014 [US1] Wrap the three plan cards in `<section class="pricing-cards-section reveal"><div class="pricing-cards-grid">…</div></section>` in `pricing.html`
- [X] T015 [US1] Add CSS for `.pricing-cards-section` and `.pricing-cards-grid` in `pricing.html` `<style>`: grid with 3 equal columns on desktop (`grid-template-columns: repeat(3, 1fr)`), 1 column on mobile (`@media (max-width: 768px)`); `.pricing-card`: padding `var(--space-32)`, border `1px solid var(--color-natural-200)`, border-radius `var(--border-radius-md)`, box-shadow `var(--shadow-xs)`; feature list uses `--color-primary-600` checkmark bullets or plain list
- [X] T016 [US1] Add empty-state fallback `<div class="pricing-empty-state" hidden>` below `.pricing-cards-section` in `pricing.html` with `<p>Pricing coming soon.</p>` and `<a href="book-a-demo.html" class="btn-primary">Contact us</a>`

**Checkpoint**: US1 complete — open `pricing.html`, all 3 cards display with placeholder data, all CTAs resolve to `book-a-demo.html`

---

## Phase 4: User Story 2 — Billing Toggle (Priority: P2)

**Goal**: Add a monthly/annual billing toggle above the pricing cards so visitors can compare prices for each billing period. Starter and Pro prices update; Enterprise always shows "Contact Sales".

**Independent Test**: Toggle between Monthly and Annual — Starter price changes $29 ↔ $24, Pro changes $79 ↔ $65, Enterprise stays "Contact Sales". Savings badge appears/disappears.

### Implementation for User Story 2

- [X] T017 [US2] Write billing toggle HTML above `.pricing-cards-section` in `pricing.html`: `<div class="billing-toggle-wrapper">` containing `<span>Monthly</span>`, `<label class="toggle-switch"><input type="checkbox" id="billing-toggle"><span class="toggle-slider"></span></label>`, `<span>Annual</span>`, and `<span class="savings-badge" style="display:none">Save up to 18%</span>`
- [X] T018 [US2] Add `data-monthly="$29" data-annual="$24"` attributes to `.price-amount` span in the Starter card and `data-monthly="$79" data-annual="$65"` to `.price-amount` in the Pro card in `pricing.html`; wrap price suffix with `<span class="billing-period">/mo</span>` in both cards
- [X] T019 [US2] Write vanilla JS billing toggle logic in `pricing.html` `<script>`: `document.getElementById('billing-toggle').addEventListener('change', () => { const isAnnual = toggle.checked; document.querySelectorAll('.price-amount').forEach(el => { el.textContent = isAnnual ? el.dataset.annual : el.dataset.monthly; }); document.querySelectorAll('.billing-period').forEach(el => { el.textContent = isAnnual ? '/mo billed annually' : '/mo'; }); document.querySelector('.savings-badge').style.display = isAnnual ? 'inline-block' : 'none'; })`
- [X] T020 [US2] Add CSS for `.billing-toggle-wrapper` in `pricing.html` `<style>`: `display: flex; align-items: center; gap: var(--space-12); justify-content: center; margin-bottom: var(--space-32)`. `.toggle-switch`: pill-shaped toggle (40×22px) using `--color-primary-600` when checked. `.savings-badge`: background `var(--color-primary-50)`, text `var(--color-primary-700)`, border-radius `var(--border-radius-full)`, padding `var(--space-4) var(--space-12)`, font-size 14px

**Checkpoint**: US2 complete — toggle switches prices; Enterprise unaffected; savings badge visible only on Annual

---

## Phase 5: User Story 3 — Feature Comparison Table (Priority: P3)

**Goal**: Show a full side-by-side comparison table of all features across Starter, Pro, and Enterprise plans so visitors can identify exactly which plan meets their needs.

**Independent Test**: Scroll to comparison table — all 10 feature rows visible with correct ✓ / — indicators per plan; on 375px viewport the table scrolls horizontally without data being clipped.

### Implementation for User Story 3

- [X] T021 [US3] Write feature comparison table section HTML in `pricing.html`: `<section class="comparison-section reveal"><h2>Compare plans</h2><div class="comparison-table-wrapper"><table class="comparison-table">` with `<thead>` row (`<th scope="col">Feature</th>`, `<th scope="col">Starter</th>`, `<th scope="col">Pro</th>`, `<th scope="col">Enterprise</th>`) and `<tbody>` with 10 rows from data-model.md: Users (Up to 5 / Up to 25 / Unlimited), Core security (✓/✓/✓), Standard dashboard (✓/✓/✓), Advanced threat detection (—/✓/✓), Custom dashboard (—/✓/✓), API access (—/✓/✓), Custom integrations (—/—/✓), Dedicated support (—/—/✓), Real-time reporting (—/✓/✓), SLA guarantee (—/—/✓); use `<th scope="row">` for feature names
- [X] T022 [US3] Add CSS for comparison table in `pricing.html` `<style>`: `.comparison-table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }` `.comparison-table { min-width: 600px; width: 100%; border-collapse: collapse; }` `th, td { padding: var(--space-12) var(--space-16); text-align: center; border-bottom: 1px solid var(--color-natural-200); }` `th[scope="row"] { text-align: left; }` `thead th { font-weight: var(--font-weight-semibold); background: var(--color-natural-50); }`

**Checkpoint**: US3 complete — comparison table renders with all 10 rows; horizontally scrollable on mobile viewport

---

## Phase 6: User Story 4 — Enterprise Callout (Priority: P4)

**Goal**: Provide a dedicated standalone section for enterprise prospects who need custom pricing or want to speak with sales, with a clear path to `book-a-demo.html`.

**Independent Test**: Scroll to enterprise callout section — headline, descriptive text, and "Book a Demo" CTA button are visible; CTA navigates to `book-a-demo.html`.

### Implementation for User Story 4

- [X] T023 [US4] Write enterprise callout section HTML in `pricing.html` after the comparison table: `<section class="enterprise-callout-section reveal"><div class="enterprise-callout-card"><h2>Need a custom solution?</h2><p>Our enterprise plan includes unlimited users, custom integrations, and a dedicated support team. Let's talk about what Nua can do for your organisation.</p><a href="book-a-demo.html" class="btn-primary">Book a Demo</a></div></section>`
- [X] T024 [US4] Add CSS for `.enterprise-callout-section` and `.enterprise-callout-card` in `pricing.html` `<style>`: full-width section with background `var(--color-primary-50)` or `var(--color-natural-100)`, centered card layout, padding `var(--space-64)`, `h2` using heading token size, `.btn-primary` reuses existing token-based button styles

**Checkpoint**: US4 complete — enterprise callout renders as a distinct full-width section between comparison table and FAQ

---

## Phase 7: User Story 5 — FAQ Accordion (Priority: P5)

**Goal**: Display at least 5 pricing-related Q&A pairs in an accessible expand/collapse accordion so visitors can get answers without leaving the page or contacting support.

**Independent Test**: Scroll to FAQ — 5 questions visible in collapsed state; clicking a question expands its answer; clicking another question closes the previous and opens the new one; first item opens on page load.

### Implementation for User Story 5

- [X] T025 [US5] Write FAQ section HTML in `pricing.html` (after enterprise callout, before pre-footer CTA): `<section class="faq-section reveal"><h2>Frequently asked questions</h2><div class="faq-list">` with 5 `.faq-item` divs using the pattern: `<button class="faq-question" aria-expanded="false">What's included in each plan?<span class="faq-icon" aria-hidden="true">+</span></button><div class="faq-answer" hidden><p>…</p></div>`. Questions and answers from data-model.md: (1) What's included in each plan? (2) Can I change my plan later? (3) Is there a free trial? (4) How do I cancel? (5) What payment methods do you accept?
- [X] T026 [US5] Write vanilla JS FAQ accordion logic in `pricing.html` `<script>`: `document.querySelectorAll('.faq-question').forEach(btn => { btn.addEventListener('click', () => { const isOpen = btn.getAttribute('aria-expanded') === 'true'; document.querySelectorAll('.faq-question').forEach(b => { b.setAttribute('aria-expanded', 'false'); b.nextElementSibling.hidden = true; b.querySelector('.faq-icon').textContent = '+'; }); if (!isOpen) { btn.setAttribute('aria-expanded', 'true'); btn.nextElementSibling.hidden = false; btn.querySelector('.faq-icon').textContent = '×'; } }); });` then open first item by default: `document.querySelector('.faq-question').click();`
- [X] T027 [US5] Add CSS for FAQ in `pricing.html` `<style>`: `.faq-item { border-bottom: 1px solid var(--color-natural-200); }` `.faq-question { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: var(--space-20) 0; background: none; border: none; cursor: pointer; font-size: var(--font-size-18); font-weight: var(--font-weight-medium); text-align: left; }` `.faq-icon { font-size: var(--font-size-24); color: var(--color-primary-600); transition: transform 0.2s; }` `.faq-answer { padding: 0 0 var(--space-20); color: var(--color-natural-600); line-height: 1.6; }`

**Checkpoint**: US5 complete — FAQ renders with 5 items; first item pre-opened; click behavior toggles single-open; keyboard (Enter/Space) works on buttons

---

## Phase 8: Social Proof

**Purpose**: Add the trust-building logo strip from `services.html` to reinforce purchase confidence (FR-011).

- [X] T028 Copy the social proof logos section HTML (`.svc-logos-section` or equivalent block) from `services.html` into `pricing.html` (position: between pricing cards section and enterprise callout); add `.reveal` class to the section wrapper
- [X] T029 Verify `.svc-logos-section` CSS styles are included in the `:root` copy (T002); if logo-section-specific classes are defined outside `:root` in `services.html`, copy those rules into `pricing.html` `<style>`

**Checkpoint**: Social proof logo strip renders correctly in `pricing.html` matching the appearance in `services.html`

---

## Phase 9: Navigation Updates (6 Existing Pages)

**Purpose**: Add "Pricing" link to desktop nav, mobile nav overlay, and footer Links column on all 6 existing pages (FR-013). Position: between Services and Resources in nav; after Services in footer.

- [X] T030 [P] Update `index.html`: (1) add `<a href="pricing.html" class="svc-nav-link">Pricing</a>` between Services and Resources in `.svc-nav-links`; (2) add `<a href="pricing.html" class="mobile-nav-link">Pricing</a>` between Services and Resources in `.mobile-nav-links`; (3) add `<a href="pricing.html" class="footer-link">Pricing</a>` after Services in footer Links column
- [X] T031 [P] Update `services.html`: same 3 locations — desktop nav, mobile nav overlay, footer Links column — with `<a href="pricing.html" class="svc-nav-link">Pricing</a>` / `<a href="pricing.html" class="mobile-nav-link">Pricing</a>` / `<a href="pricing.html" class="footer-link">Pricing</a>`
- [X] T032 [P] Update `company.html`: same 3 locations
- [X] T033 [P] Update `blog.html`: same 3 locations
- [X] T034 [P] Update `blog-post.html`: same 3 locations
- [X] T035 [P] Update `book-a-demo.html`: same 3 locations

**Checkpoint**: Open any existing page — "Pricing" link appears in desktop nav between Services and Resources, in mobile nav overlay, and in footer Links column

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Ensure `.reveal` class is applied to all sections, accessibility attributes are correct, and no token violations exist.

- [X] T036 Audit all section elements in `pricing.html` and ensure each has `.reveal` class: hero, pricing cards section, billing toggle wrapper (if wrapped in section), comparison section, social proof section, enterprise callout section, FAQ section
- [X] T037 Add `aria-label="Billing period toggle"` to the billing toggle `<input>` and `role="region" aria-label="Pricing plans"` to `.pricing-cards-section` in `pricing.html`
- [X] T038 Scan all `<a class="btn-primary">` elements in `pricing.html` and confirm every `href` resolves to `book-a-demo.html`; fix any that do not
- [X] T039 [P] Scan `pricing.html` `<style>` block for any hardcoded hex values (e.g. `#0D4CF4`) or raw `px` values not referencing a `--space-*` or `--font-size-*` token; replace with the appropriate CSS custom property from the `:root` block

**Checkpoint**: All sections animate on scroll; billing toggle is labelled for screen readers; zero broken CTAs; no raw hex/px values in styles

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS all user story phases**
- **Phase 3 (US1)**: Depends on Phase 2 — can start after Foundational is complete
- **Phase 4 (US2)**: Depends on Phase 3 (billing toggle modifies price elements in the cards)
- **Phase 5 (US3)**: Depends on Phase 2 only — can run in parallel with Phases 3 & 4
- **Phase 6 (US4)**: Depends on Phase 2 only — can run in parallel with Phases 3, 4 & 5
- **Phase 7 (US5)**: Depends on Phase 2 only — can run in parallel with Phases 3–6
- **Phase 8 (Social Proof)**: Depends on Phase 2 only
- **Phase 9 (Nav Updates)**: Depends on Phase 1 only (independent of pricing.html content)
- **Phase 10 (Polish)**: Depends on all preceding phases being complete

### User Story Dependencies

- **US1 (P1)**: Only requires Foundational complete — no other story dependencies
- **US2 (P2)**: Requires US1 complete (toggle targets price elements created in US1)
- **US3 (P3)**: Only requires Foundational complete — independent of US1/US2
- **US4 (P4)**: Only requires Foundational complete — independent of all other stories
- **US5 (P5)**: Only requires Foundational complete — independent of all other stories

### Parallel Opportunities

All [P] tasks within a phase can run simultaneously. With a single developer, execute tasks in ID order. With multiple developers:

- T003, T004, T005, T006, T007, T008 (Phase 2) — all in parallel after T002
- T011, T012, T013 (Phase 3) — plan card HTML in parallel after T010
- T030, T031, T032, T033, T034, T035 (Phase 9) — all nav updates in parallel

---

## Parallel Example: Phase 9 (Nav Updates)

```bash
# All 6 nav update tasks run in parallel (different files, no conflicts):
Task T030: Update index.html nav + footer
Task T031: Update services.html nav + footer
Task T032: Update company.html nav + footer
Task T033: Update blog.html nav + footer
Task T034: Update blog-post.html nav + footer
Task T035: Update book-a-demo.html nav + footer
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002–T008) — **required before any cards can be built**
3. Complete Phase 3: US1 (T009–T016) — all 3 plan cards, hero, empty state
4. **STOP and VALIDATE**: Open `pricing.html` — all 3 cards display; CTAs work; page consistent with design system
5. Deploy/demo if stakeholder validation needed

### Full Incremental Delivery

1. Phase 1 + 2 → Foundation ready (pricing.html opens with navbar/footer)
2. Phase 3 → US1 done (plan cards visible) → MVP deliverable
3. Phase 4 → US2 done (billing toggle works) → Enhanced MVP
4. Phases 5, 6, 7 → US3/4/5 done (table, enterprise, FAQ) → Feature complete
5. Phase 8 → Social proof added
6. Phase 9 → Nav updated across all pages → Fully shipped
7. Phase 10 → Polish pass

---

## Summary

| Metric | Count |
|--------|-------|
| Total tasks | 39 |
| Phase 1 (Setup) | 1 |
| Phase 2 (Foundational) | 7 |
| Phase 3 (US1 — Plans) | 8 |
| Phase 4 (US2 — Toggle) | 4 |
| Phase 5 (US3 — Table) | 2 |
| Phase 6 (US4 — Enterprise) | 2 |
| Phase 7 (US5 — FAQ) | 3 |
| Phase 8 (Social Proof) | 2 |
| Phase 9 (Nav Updates) | 6 |
| Phase 10 (Polish) | 4 |
| Parallelizable tasks [P] | 21 |
| MVP scope (US1 only) | Phases 1–3 (16 tasks) |
