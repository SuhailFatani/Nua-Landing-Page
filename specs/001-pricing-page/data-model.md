# Data Model: Pricing Page

**Feature**: 001-pricing-page
**Date**: 2026-02-24

> This is a static HTML page — there is no database or backend. The "data model" describes the content structure embedded in the HTML, which will be replaced with real data before launch.

---

## Entity: PricingPlan

Represents a single purchasable tier displayed as a card.

| Field | Type | Constraints | Placeholder |
|-------|------|-------------|-------------|
| `name` | string | Required, unique | "Starter", "Pro", "Enterprise" |
| `monthlyPrice` | string | Required for Starter/Pro; `null` for Enterprise | "$29", "$79", `null` |
| `annualPrice` | string | Required for Starter/Pro; `null` for Enterprise | "$24", "$65", `null` |
| `annualSavingsLabel` | string | Required when annualPrice present | "Save 17%", "Save 18%" |
| `features` | string[] | 4–6 items | See placeholder list below |
| `ctaLabel` | string | Required | "Book a Demo" |
| `ctaHref` | string | Required | `book-a-demo.html` (all tiers) |
| `isEnterprise` | boolean | Determines toggle exclusion | `true` for Enterprise only |

### Placeholder Feature Lists

**Starter**:
1. Up to 5 users
2. Core security features
3. Standard dashboard
4. Email support
5. Monthly reports

**Pro**:
1. Up to 25 users
2. Advanced threat detection
3. Custom dashboard
4. Priority support
5. Weekly reports
6. API access

**Enterprise**:
1. Unlimited users
2. Full threat intelligence suite
3. Dedicated dashboard
4. 24/7 dedicated support
5. Real-time reporting
6. Custom integrations

### State: Billing Toggle

The billing toggle controls which price variant is displayed:

```
State: monthly (default)
  → PricingPlan.monthlyPrice shown
  → annualSavingsLabel hidden
  → Enterprise: "Contact Sales" (unchanged)

State: annual
  → PricingPlan.annualPrice shown
  → annualSavingsLabel visible near toggle
  → Enterprise: "Contact Sales" (unchanged)
```

---

## Entity: FeatureComparisonRow

Represents one row in the feature comparison table.

| Field | Type | Constraints |
|-------|------|-------------|
| `featureName` | string | Required, unique per table |
| `starterValue` | string \| boolean | `true` = ✓, `false` = —, or descriptive string |
| `proValue` | string \| boolean | Same as above |
| `enterpriseValue` | string \| boolean | Same as above |

### Placeholder Comparison Table

| Feature | Starter | Pro | Enterprise |
|---------|---------|-----|------------|
| Users | Up to 5 | Up to 25 | Unlimited |
| Core security | ✓ | ✓ | ✓ |
| Standard dashboard | ✓ | ✓ | ✓ |
| Advanced threat detection | — | ✓ | ✓ |
| Custom dashboard | — | ✓ | ✓ |
| API access | — | ✓ | ✓ |
| Custom integrations | — | — | ✓ |
| Dedicated support | — | — | ✓ |
| Real-time reporting | — | ✓ | ✓ |
| SLA guarantee | — | — | ✓ |

---

## Entity: FAQItem

Represents one question-answer pair in the FAQ accordion.

| Field | Type | Constraints |
|-------|------|-------------|
| `question` | string | Required, unique |
| `answer` | string | Required |
| `defaultOpen` | boolean | At most one item = `true`; first item default open |

### Placeholder FAQ Content

1. **What's included in each plan?** — Each plan includes access to the Nua security platform with features scaled to your team size. Starter covers core security, Pro adds advanced detection and API access, Enterprise includes custom integrations and dedicated support.
2. **Can I change my plan later?** — Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.
3. **Is there a free trial?** — We offer a personalised demo for all plans. Book a demo to see Nua in action before committing.
4. **How do I cancel?** — You can cancel at any time by contacting our support team. There are no cancellation fees.
5. **What payment methods do you accept?** — We accept all major credit cards and can arrange invoicing for Enterprise customers.

---

## Entity: SocialProofLogo

Reused from `services.html` (`svc-logos-section` pattern). No new data model required — copy existing HTML block.

---

## Empty State

| Condition | Display |
|-----------|---------|
| Pricing data unavailable | Hide `.pricing-cards-section`; show `.pricing-empty-state` div |
| Empty state content | "Pricing coming soon." + "Contact us" link → `book-a-demo.html` |

```html
<!-- Empty state (hidden by default; shown via JS or server-side logic) -->
<div class="pricing-empty-state" hidden>
  <p>Pricing coming soon.</p>
  <a href="book-a-demo.html" class="btn-primary">Contact us</a>
</div>
```

---

## Navigation Update Model

Each of the 6 existing pages requires the following additions:

| Location | HTML to add |
|----------|-------------|
| Desktop nav `.svc-nav-links` | `<a href="pricing.html" class="svc-nav-link">Pricing</a>` |
| Mobile nav `.mobile-nav-links` | `<a href="pricing.html" class="mobile-nav-link">Pricing</a>` |
| Footer `.footer-link-col` (Links) | `<a href="pricing.html" class="footer-link">Pricing</a>` |

**Position**: Between "Services" and "Resources" in nav; after "Services" in footer Links column.

**Pages to update**: `index.html`, `services.html`, `company.html`, `blog.html`, `blog-post.html`, `book-a-demo.html`
