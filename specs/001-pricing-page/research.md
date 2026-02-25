# Research: Pricing Page

**Feature**: 001-pricing-page
**Date**: 2026-02-24

## Decision 1: Billing Toggle Implementation

**Decision**: Vanilla JS data-attribute swap pattern
**Rationale**: The project uses no build tools or frameworks. All existing JS in the project (e.g. the `.reveal` scroll animation in `services.html`) is vanilla. A `data-monthly` / `data-annual` attribute pattern on price elements lets JS swap displayed text without DOM manipulation of card structure.
**Implementation pattern**:
```html
<span class="price-amount" data-monthly="$29" data-annual="$24">$29</span>
<span class="price-period">/mo</span>
```
```js
toggle.addEventListener('change', () => {
  const isAnnual = toggle.checked;
  document.querySelectorAll('.price-amount').forEach(el => {
    el.textContent = isAnnual ? el.dataset.annual : el.dataset.monthly;
  });
  document.querySelectorAll('.billing-period').forEach(el => {
    el.textContent = isAnnual ? '/mo billed annually' : '/mo';
  });
  savingsBadge.style.display = isAnnual ? 'block' : 'none';
});
```
Enterprise card: `.enterprise-price` element has no `data-annual` / `data-monthly` — it always renders "Contact Sales" as static text and is excluded from the query selector.

**Alternatives considered**:
- CSS class toggle (`.is-annual` on body) — cleaner but requires duplicate content in HTML (hidden monthly / hidden annual spans). Data-attribute approach is simpler for this use case.

---

## Decision 2: FAQ Accordion

**Decision**: Single-open accordion using vanilla JS with `aria-expanded` for accessibility
**Rationale**: Single-open is simpler to implement and reduces cognitive load for users. `aria-expanded` is required for screen reader compatibility (WCAG 2.1 AA baseline).
**Implementation pattern**:
```html
<div class="faq-item">
  <button class="faq-question" aria-expanded="false">
    What's included in each plan?
    <span class="faq-icon">+</span>
  </button>
  <div class="faq-answer" hidden>
    <p>Each plan includes...</p>
  </div>
</div>
```
```js
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    // Close all
    document.querySelectorAll('.faq-question').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.nextElementSibling.hidden = true;
    });
    // Open clicked (if was closed)
    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      btn.nextElementSibling.hidden = false;
    }
  });
});
```
**Alternatives considered**:
- CSS-only `<details>`/`<summary>` — simpler but less design control over animation and icon state.
- Multi-open accordion — rejected per plan decision (single-open is simpler).

---

## Decision 3: Responsive Feature Comparison Table

**Decision**: Standard HTML `<table>` with `overflow-x: auto` wrapper on mobile
**Rationale**: A real `<table>` element is semantically correct for tabular comparison data and is accessible to screen readers (column/row headers via `<th scope="col">` and `<th scope="row">`). Horizontal scrolling on mobile is the standard fallback for wide tables and is used by major SaaS pricing pages (Stripe, Notion).
**Implementation pattern**:
```html
<div class="comparison-table-wrapper">
  <table class="comparison-table">
    <thead>
      <tr>
        <th scope="col">Feature</th>
        <th scope="col">Starter</th>
        <th scope="col">Pro</th>
        <th scope="col">Enterprise</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row">Core feature 1</th>
        <td>✓</td><td>✓</td><td>✓</td>
      </tr>
    </tbody>
  </table>
</div>
```
```css
.comparison-table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.comparison-table { min-width: 600px; width: 100%; border-collapse: collapse; }
```
**Alternatives considered**:
- CSS Grid / Flexbox fake table — more design flexibility but loses semantic accessibility.
- Stacked mobile layout (show one plan at a time with a plan selector) — much more complex JS, overkill for this feature scope.

---

## Decision 4: Scroll Reveal Animation

**Decision**: Reuse `.reveal` + IntersectionObserver pattern exactly as implemented in `services.html`
**Rationale**: The pattern already exists and works. Copying it verbatim ensures visual consistency and avoids introducing a new animation library.
**Pattern**: Copy the JS block from `services.html` that uses `IntersectionObserver` to add `.visible` class to `.reveal` elements when they enter the viewport.

---

## Decision 5: CSS Token Scope

**Decision**: Copy the full `:root` token block from `services.html` into `pricing.html`
**Rationale**: Each page in this project is self-contained (no shared CSS file). The `:root` block in `services.html` already mirrors `TokensNua (2).json` completely. New pricing-specific styles (card layouts, toggle, table) will use only existing token variables.
**New tokens needed**: None — all required values exist in the token set.

---

## Decision 6: Page Hero Background

**Decision**: Light background (`--color-natural-50` = white) with dark text
**Rationale**: The billing toggle and pricing cards need to stand out. A dark hero (like `index.html`) would compete with the card layout. `services.html` uses a light hero for its title section — the same approach works here. This also matches the `navbar-light` theme already used for pages with white backgrounds.
