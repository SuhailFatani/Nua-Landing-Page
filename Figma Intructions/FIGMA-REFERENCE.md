# Figma references — Nua design

Use these as the **single source of truth** for tokens, variables, components, and patterns when designing or implementing new pages.

---

## Token reference (required for all designs)

**Every design and implementation must use CSS variables or values from this file.**

| Field   | Value |
|--------|--------|
| **File** | `TokensNua (2).json` (project root) |
| **Format** | Tokens Studio JSON: `option-tokens-mode 1`, `alias-tokens--value`, `component-tokens-light`, `component-tokens-dark` |

- **Colors** — e.g. `blue.50`–`950`, `natural.*`, etc. Map to CSS custom properties (e.g. `--color-primary-600`).
- **Spacing / typography / radius / shadow** — use token values from this file; do not hardcode hex or px unless they match a token.
- When adding or updating pages, define or reuse `:root` variables that mirror this token set (see existing pages for the pattern).

---

## Nua Design System 2.0

**Tokens, variables, and component library.**

| Field   | Value |
|--------|--------|
| **URL** | https://www.figma.com/design/fyTMvSTumkD1UY5vghxA6l/Nua-Design-System-2.0?node-id=9005-27276 |
| **fileKey** | `fyTMvSTumkD1UY5vghxA6l` |
| **nodeId** | `9005:27276` |

Use for: colors, typography, spacing, radii, shadows, and component specs.

---

## Nua UX/UI Design

**Screens, flows, and layout patterns.**

| Field   | Value |
|--------|--------|
| **URL** | https://www.figma.com/design/2maVUkzVJeu03zk0rjsVVT/Nua-UX-UI-Design?node-id=2588-12805 |
| **fileKey** | `2maVUkzVJeu03zk0rjsVVT` |
| **nodeId** | `2588:12805` |

Use for: page layouts, patterns, and UX reference when implementing new user stories.

---

## Using these in code

- **Tokens** → Always reference `TokensNua (2).json`. Use CSS custom properties that map to these tokens (see `company.html`, `services.html`, etc. — “DESIGN TOKENS — mirroring Figma token structure”). No ad‑hoc colors or spacing; use the token file.
- **Design system (Figma)** → Align with Nua Design System 2.0; mirror its structure in CSS via the token file.
- **New pages** → Pull design context from the relevant Figma node; implement using tokens from `TokensNua (2).json` and existing component patterns in this repo.


# Figma MCP Configuration & Usage Guide

This document defines the MCP setup and usage rules for any AI agent
interacting with Figma via MCP.

------------------------------------------------------------------------

## 1️⃣ MCP Server Configuration

Use the following configuration:

``` json
{
  "mcpServers": {
    "Figma": {
      "url": "https://mcp.figma.com/mcp",
      "headers": {}
    },
    "Figma Desktop": {
      "url": "http://127.0.0.1:3845/mcp",
      "headers": {}
    }
  }
}
```

### Server Usage Rules

-   Use **Figma (cloud)** when accessing shared team files.
-   Use **Figma Desktop (local)** when working with open local Figma
    sessions.
-   Prefer Desktop if both are available and the file is open locally.
-   Never assume access permissions --- always validate via `whoami`.

------------------------------------------------------------------------

## 2️⃣ Tooling Reference

### Core Design Context

-   get_screenshot
-   get_design_context
-   get_metadata
-   get_variable_defs
-   get_figjam
-   generate_diagram

### Code Connect

-   get_code_connect_map
-   add_code_connect_map
-   get_code_connect_suggestions
-   send_code_connect_mappings

### System & Structure

-   create_design_system_rules

### Identity

-   whoami

------------------------------------------------------------------------

## 3️⃣ Agent Operating Rules

### Context Handling

-   Avoid sending large frames unless necessary.
-   Always request minimal node selection.
-   If the frame is too large → break into sections.

### Design System Extraction

When analyzing a file: 1. Extract color variables 2. Extract typography
scale 3. Extract spacing system 4. Identify layout grid 5. Identify
reusable components 6. Map interaction states

Then convert them into structured rules using:
create_design_system_rules

------------------------------------------------------------------------

## 4️⃣ Best Practices

### Performance

-   Avoid large full-page screenshots unless required.
-   Prefer node-based queries instead of full-canvas parsing.
-   If stuck → re-request metadata before retrying.

### Code Connect

-   Always validate existing mappings before adding new ones.
-   Suggest improvements before overriding.
-   Keep naming consistent with component hierarchy.

------------------------------------------------------------------------

## 5️⃣ Error Handling

If: - Images fail → retry get_screenshot - 500 error → reinitialize
session - MCP tools not loading → validate server connection - Slow
response → narrow node selection

------------------------------------------------------------------------

## 6️⃣ Design Consistency Protocol

When generating new UI based on existing file:

The agent must: - Preserve color tokens - Preserve typography
hierarchy - Preserve spacing scale - Reuse component structure - Match
tone of voice in copy - Avoid visual deviation

Do NOT: - Invent new random styles - Break grid alignment - Change
established visual language

------------------------------------------------------------------------

## 7️⃣ Workflow Recommendation

Standard workflow for page generation:

1.  whoami
2.  get_metadata
3.  get_variable_defs
4.  get_design_context
5.  create_design_system_rules
6.  Generate new section aligned with extracted system
7.  Validate consistency
8.  (Optional) map via Code Connect

------------------------------------------------------------------------

## 8️⃣ Mission

The goal of this MCP integration is:

> To ensure any AI agent can analyze, understand, and extend the
> existing Figma design system without breaking visual consistency.

This file must be treated as mandatory operational guidance.
