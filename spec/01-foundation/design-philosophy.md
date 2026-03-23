# Design Philosophy — Autumn Soft

> **Concept Identity:** Autumn Soft (秋ソフト)
> **Motif:** Autumn leaves / 紅葉 (momiji)
> **Tagline:** Warm, welcoming, and comfortable — a digital café for the VRChat community.

---

## 1. Core Design Principles

### Principle 1: Warmth First (温もり優先)

> Every design decision should radiate warmth and invitation.

- **Color:** Choose warm tones over neutral or cool ones. Ivory over white. Coral over red. Mustard over yellow. Mocha-brown over black.
- **Shape:** Round over sharp. Soft over hard. Organic over geometric.
- **Motion:** Gentle over snappy. Spring over linear. Ease-out over ease-in.
- **Spacing:** Generous over tight. Breathable over dense. Comfortable over efficient.
- **Tone:** Friendly over formal. Welcoming over impressive. Human over mechanical.

**Test:** If a stranger lands on the page and their first emotional reaction isn't "this feels nice and warm," the design has failed.

---

### Principle 2: Content Before Chrome (内容優先)

> Decorations exist to support content, never to overwhelm it.

- Autumn leaf motifs enhance section dividers — they do not fill backgrounds
- Animations draw attention to content changes — they do not perform for their own sake
- Colors guide the eye to important actions — they do not create a rainbow
- Illustrations support understanding — they do not replace text
- Shadows create hierarchy — they do not create spectacle

**Rule of Thumb:** If you remove all decorative elements and the page is still usable and readable, the decoration was well-placed. If the page becomes confusing without decoration, the information architecture is wrong.

**Decoration Budget:**
- Maximum 1 decorative motif per viewport
- Maximum 2 accent colors visible simultaneously
- Animations must complete within 400ms
- No purely decorative elements in the critical rendering path

---

### Principle 3: Accessible Luxury (美しさとアクセシビリティの両立)

> Beautiful design AND full accessibility are not in conflict — they are both required.

- **WCAG AA minimum** on all text contrast ratios (4.5:1 normal, 3:1 large)
- **WCAG AAA target** for body text where possible (7:1)
- **Focus indicators** are visible and styled (warm coral focus ring, not browser default)
- **Keyboard navigation** works for every interactive element
- **Screen reader support** with proper ARIA labels, roles, and live regions
- **Reduced motion** respected via `prefers-reduced-motion` — animations degrade to fades or instant
- **Color is never the only indicator** — always paired with icon, text, or shape

**The Standard:** A keyboard-only user with a screen reader should be able to perform every task a sighted mouse user can, with equivalent efficiency.

---

### Principle 4: Progressive Enhancement (段階的強化)

> The site works without JavaScript. It delights with it.

| Layer | Without JS | With JS |
|---|---|---|
| Navigation | HTML links, form submissions | Client-side routing, prefetching |
| Forms | Standard form POST | Optimistic updates, inline validation |
| Images | `<img>` with srcset | next/image lazy loading, blur placeholder |
| Animations | CSS transitions only | Framer Motion spring physics |
| Toast/notifications | Page-level flash messages | Sonner toast overlays |
| Markdown preview | Server-rendered preview | Live client-side preview |
| Search | Full page reload with results | Instant search-as-you-type |

**Implementation Strategy:**
1. Build the server-rendered version first (RSC)
2. Add client interactivity only where it meaningfully improves UX
3. Every `"use client"` directive must justify its existence
4. Forms use Server Actions as the primary submission path

---

### Principle 5: Server-First (サーバーファースト)

> React Server Components by default. Client components only when interaction demands it.

**Default:** Every component is a Server Component unless it needs:
- Event handlers (onClick, onChange, onSubmit)
- Browser APIs (window, document, localStorage)
- React hooks (useState, useEffect, useRef)
- Third-party client-only libraries

**Client Component Boundaries:**

| Component Type | Server or Client | Reason |
|---|---|---|
| Page layout | Server | Static structure |
| Navigation bar | Server + Client island | Logo/links server, mobile menu toggle client |
| Event list | Server | Data fetching, rendering |
| Event card | Server | Pure display |
| Like button | Client | onClick handler, optimistic update |
| Profile editor form | Client | Form state, validation, preview |
| Gallery grid | Server | Data fetching |
| Image lightbox | Client | Browser APIs, gesture handling |
| Admin data table | Server + Client island | Table server, sort/filter controls client |
| Toast container | Client | Portal, animation state |
| Theme toggle | Client | localStorage, DOM manipulation |

**Bundle Size Goal:** Client-side JavaScript < 100KB gzipped for initial page load.

---

### Principle 6: One Source of Truth (単一の真実源)

> Design tokens drive all visual values. No magic numbers in component code.

- **Colors** defined once in the token system, consumed everywhere via CSS custom properties
- **Spacing** uses a defined scale (4px base), never arbitrary pixel values
- **Typography** sizes, weights, and line-heights from the type scale, never ad-hoc
- **Border radii** from the radius scale (sm/md/lg/xl), never inline values
- **Shadows** from the shadow scale (sm/md/lg), never one-off shadows
- **Animations** use shared duration and easing tokens, never per-component timings

**Token Flow:**
```
Design Tokens (spec/02-tokens/)
  → Tailwind CSS theme config (tailwind.config.ts)
    → CSS Custom Properties (:root)
      → Utility classes (bg-autumn-ivory, rounded-autumn-md)
        → Component styles
```

**Enforcement:** Any hardcoded color, spacing, or size value in a component file is a code smell and should be flagged in code review.

---

## 2. Color Philosophy

### Why Ivory, Not White

| Property | Pure White (`#FFFFFF`) | Ivory (`#FFFDF7`) |
|---|---|---|
| Perceived temperature | Cold, clinical | Warm, natural |
| Eye strain | Higher (max brightness) | Lower (slightly muted) |
| Association | Hospital, lab, sterile | Paper, cream, café |
| Contrast with warm accents | Jarring | Harmonious |

Pure white backgrounds make warm accent colors look "pasted on." Ivory creates a cohesive warm environment where coral and mustard feel at home.

### Why Coral, Not Red

| Property | Red (`#FF0000`) | Coral (`#E8836B`) |
|---|---|---|
| Emotional response | Urgency, danger, stop | Warmth, autumn, invitation |
| Saturation | Maximum — visually aggressive | Moderate — comfortable |
| Accessibility | Hard to pair for contrast | Good contrast against ivory and mocha |
| VRChat association | Error states, alerts | Autumn leaves, sunset |

Red signals danger in UI convention. Coral carries warmth without alarm. It maps directly to the 紅葉 (autumn foliage) motif and differentiates from the red-heavy palettes of gaming sites.

### Why Mustard, Not Yellow

| Property | Yellow (`#FFFF00`) | Mustard (`#D4A843`) |
|---|---|---|
| Readability | Extremely poor on light backgrounds | Good contrast on ivory |
| Association | Caution, construction | Harvest, warmth, golden hour |
| Sophistication | Childish at full saturation | Mature, refined |
| Pairing with coral | Clashing / circus | Complementary / autumn |

Pure yellow is one of the hardest colors to use in UI — it's too bright for backgrounds and too low-contrast for text. Mustard solves both problems while evoking golden autumn light.

### Why Mocha-Brown, Not Black

| Property | Black (`#000000`) | Mocha-Brown (`#3D2E2A`) |
|---|---|---|
| Perceived weight | Heavy, imposing | Substantial but gentle |
| Warmth | None — neutral to cold | Warm undertones |
| Eye strain | High contrast against light backgrounds | Slightly reduced, still AAA-compliant |
| Association | Stark, absolute, digital | Coffee, wood, earth, natural |

Mocha-brown maintains readability (7:1+ contrast ratio against ivory) while staying in the warm family. Text feels like it was written on aged paper rather than printed by a laser.

---

## 3. Concept Identity — Autumn Soft

### The Story

Imagine a small café on an autumn afternoon. Sunlight streams through windows, casting warm shadows on wooden tables. The menu is handwritten on a board — clear, readable, but with personality. Leaves drift past the window. Everything is rounded, soft, warm. You feel comfortable. You want to stay.

**That is the feeling this website should evoke.**

### The Motif — 紅葉 (Momiji / Autumn Leaves)

Autumn leaves appear as a subtle, recurring motif:

| Usage | Placement | Style |
|---|---|---|
| Section dividers | Between major page sections | Thin line with small leaf accent (SVG, 1-color) |
| Loading states | Centered in loading container | Single leaf, gentle rotation animation |
| Empty states | Below "no items" messages | 2-3 scattered leaves, muted color |
| 404 page | Hero illustration | Leaf caught in wind, larger scale |
| Seasonal decorations | Header area (October build) | Falling leaf particles (CSS, no JS required) |

**Restraint Rule:** The leaf motif is an accent, not a wallpaper. Maximum 1 leaf element per viewport. Never as a repeating pattern behind content.

---

## 4. Success Criteria

### Performance

| Metric | Target | Measurement |
|---|---|---|
| Lighthouse Performance | ≥ 95 | Lighthouse CI in pipeline |
| Largest Contentful Paint (LCP) | < 2.5s | Core Web Vitals |
| First Input Delay (FID) | < 100ms | Core Web Vitals |
| Cumulative Layout Shift (CLS) | < 0.1 | Core Web Vitals |
| Time to First Byte (TTFB) | < 200ms | Server monitoring |
| Client JS bundle (initial) | < 100KB gzipped | Build analysis |

### Accessibility

| Metric | Target | Method |
|---|---|---|
| WCAG AA compliance | All pages | axe-core automated + manual audit |
| Keyboard navigability | 100% of interactive elements | Manual testing checklist |
| Screen reader compatibility | NVDA + VoiceOver | Manual testing |
| Focus visibility | All focusable elements | Visual inspection |
| Color independence | No color-only information | Design review |

### Responsiveness

| Strategy | Detail |
|---|---|
| Design approach | PC-first design, mobile-first implementation quality |
| Breakpoints | sm: 640px, md: 768px, lg: 1024px, xl: 1280px |
| Touch targets | Minimum 44×44px on mobile |
| Text scaling | Supports browser zoom to 200% without layout break |
| Orientation | Landscape and portrait supported |

**"PC-first design, mobile-first quality"** means: The design is optimized for the PC viewport (where most VRChat players spend time), but the mobile experience is not a degraded afterthought — it is equally polished with appropriate adaptations.

### Testing

| Layer | Tool | Coverage Target |
|---|---|---|
| E2E | Playwright | Critical user paths (event check, profile edit, admin operations) |
| Component | Vitest + React Testing Library | All interactive components |
| Visual regression | Storybook + Chromatic (or Percy) | All component variants |
| Accessibility | axe-core (in Vitest + Playwright) | Every page |
| API integration | MSW (Mock Service Worker) | All API endpoints mocked |

**Day 1 mandate:** Testing infrastructure is set up before the first component is built. No "we'll add tests later."

---

## 5. Constraints

### Backend

- **Rust / Axum REST API** — completely independent, communicates via HTTP JSON
- API contract is defined separately; frontend consumes it via typed fetch wrappers
- No BFF (Backend for Frontend) layer — Next.js server components call the Rust API directly
- Authentication: cookie-based sessions managed by the Rust backend

### Deployment

- **Docker self-hosted** — no Vercel, no Netlify, no cloud functions
- Next.js runs as a standalone Node.js server inside Docker
- `output: 'standalone'` in Next.js config
- No reliance on Vercel-specific features (Edge Runtime, Edge Middleware, Vercel KV, etc.)
- ISR uses the filesystem cache, not a shared cache service

### Image Storage

- **MinIO (S3-compatible)** — self-hosted object storage
- Images served via presigned URLs or a CDN proxy
- next/image configured with a custom loader for MinIO URLs
- Upload directly from browser to MinIO via presigned PUT URLs

### Dependency Restrictions

| Restriction | Rationale |
|---|---|
| No C/C++ native dependencies | Build simplicity — must compile in Docker without build tools for native modules |
| No GPL libraries | License compatibility — project uses a permissive license |
| No Vercel-only packages | Deployment independence |
| No CSS-in-JS runtime | Performance — no runtime style computation |
| Minimal client-side JavaScript | Bundle size — RSC by default |

---

## 6. Design Decision Framework

When making any design decision, apply these filters in order:

1. **Does it feel warm?** If not, reconsider.
2. **Does it serve the content?** If not, remove it.
3. **Is it accessible?** If not, fix it.
4. **Does it work without JS?** If not, provide a fallback.
5. **Can it be a server component?** If yes, keep it server.
6. **Is it driven by a token?** If not, create a token.

If a decision passes all six filters, it belongs in the system.
