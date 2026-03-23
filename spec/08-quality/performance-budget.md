# Performance Budget

> **Version:** 1.0
> **Last Updated:** 2026-03-20

## Overview

This document defines performance budgets and optimization strategies for the VRC community website frontend. All metrics are enforced in CI and monitored in production.

---

## 1. Lighthouse Targets

| Category        | Target | Minimum |
| --------------- | ------ | ------- |
| Performance     | 95+    | 90      |
| Accessibility   | 100    | 100     |
| Best Practices  | 100    | 95      |
| SEO             | 100    | 95      |

These targets apply to both mobile and desktop audits. Mobile uses simulated throttling (Moto G Power on slow 4G).

---

## 2. Core Web Vitals

| Metric                       | Target   | Maximum  | Measurement                 |
| ---------------------------- | -------- | -------- | --------------------------- |
| Largest Contentful Paint (LCP)| < 2.0s  | < 2.5s  | 75th percentile             |
| Interaction to Next Paint (INP)| < 150ms | < 200ms | 75th percentile             |
| Cumulative Layout Shift (CLS) | < 0.05  | < 0.1   | 75th percentile             |

### Per-Page LCP Targets

| Page          | LCP Element                  | Target  |
| ------------- | ---------------------------- | ------- |
| Home          | Hero image or heading        | < 1.8s  |
| Events list   | First event card             | < 2.0s  |
| Event detail  | Event banner image           | < 2.2s  |
| Members list  | First member card            | < 2.0s  |
| Member detail | Avatar image                 | < 2.0s  |
| Gallery       | First gallery image          | < 2.5s  |
| Admin         | Dashboard stats              | < 2.0s  |

---

## 3. Bundle Size Budget

### JavaScript

| Category              | Budget (gzipped) | Monitoring              |
| --------------------- | ---------------- | ----------------------- |
| Initial JS (First Load)| < 150 KB        | `next build` output     |
| Per-route JS chunk    | < 50 KB          | `next build` output     |
| Total shared JS       | < 100 KB         | Bundle analyzer         |

### Per-Dependency Budget

| Package           | Budget (gzipped) | Notes                            |
| ----------------- | ---------------- | -------------------------------- |
| React + React DOM | ~45 KB           | Framework baseline               |
| Next.js runtime   | ~30 KB           | Framework baseline               |
| Framer Motion     | < 25 KB          | Dynamic import, tree-shake       |
| Tailwind CSS      | < 15 KB          | Purged in production             |
| embla-carousel    | < 8 KB           | Lightweight carousel             |
| Zod               | < 12 KB          | Schema validation                |
| date-fns          | < 10 KB          | Tree-shakeable date utilities    |
| Lucide icons      | < 5 KB           | Only imported icons bundled      |

### CSS

| Category     | Budget (gzipped) | Notes                        |
| ------------ | ---------------- | ---------------------------- |
| Total CSS    | < 30 KB          | Tailwind purged + custom     |

---

## 4. Image Optimization

### Strategy

```
Source Image → next/image → WebP/AVIF → Responsive sizes → CDN cached
```

### Rules

| Rule                          | Implementation                                  |
| ----------------------------- | ----------------------------------------------- |
| Format                        | WebP primary, AVIF where supported              |
| Lazy loading                  | All images below the fold use `loading="lazy"`  |
| Priority loading              | LCP images use `priority` prop                  |
| Responsive sizes              | `sizes` attribute on all images                 |
| Aspect ratio                  | `width` and `height` always specified            |
| Placeholder                   | `blur` placeholder for above-fold images        |
| Maximum dimensions            | Source images max 2048px wide                   |
| Quality                       | 80 for photos, 90 for UI elements               |

### Image Size Limits

| Context               | Max file size | Max dimensions |
| --------------------- | ------------- | -------------- |
| Avatar                | 500 KB        | 512×512        |
| Event banner          | 2 MB          | 1920×1080      |
| Gallery image         | 5 MB          | 2048×2048      |
| Thumbnail             | 100 KB        | 384×384        |

---

## 5. Font Optimization

### Configuration

```typescript
// src/app/layout.tsx
import { Noto_Sans_JP } from "next/font/google";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: true,
  fallback: ["Hiragino Kaku Gothic ProN", "Hiragino Sans", "sans-serif"],
});
```

### Font Budget

| Font            | Weights      | Budget (woff2) | Notes                        |
| --------------- | ------------ | -------------- | ---------------------------- |
| Noto Sans JP    | 400, 500, 700| < 150 KB total | Subset to latin + used kanji |

### Rules

- `font-display: swap` — prevent invisible text during load.
- `preload` the primary font.
- Subset to minimize download size.
- System font fallback chain for instant rendering.
- No custom display/decorative fonts for body text.

---

## 6. Framer Motion Optimization

### Dynamic Import Strategy

```typescript
// Only load Framer Motion on pages that need animation
import dynamic from "next/dynamic";

const AnimatedHero = dynamic(
  () => import("@/components/home/animated-hero"),
  { ssr: false }
);
```

### Rules

| Rule                            | Implementation                                |
| ------------------------------- | --------------------------------------------- |
| Dynamic import                  | All Framer Motion components loaded lazily     |
| Tree-shaking                    | Import only `motion`, `AnimatePresence` as needed |
| SSR disabled for animations     | `ssr: false` on dynamic imports               |
| Reduced motion                  | Respect `prefers-reduced-motion` media query   |
| Leaf particles                  | Canvas-based, not DOM-based; dynamic import    |

---

## 7. ISR & Caching Strategy

### Incremental Static Regeneration

| Page/Data            | Revalidation Period | Justification                        |
| -------------------- | ------------------- | ------------------------------------ |
| Home page            | 60s                 | Event highlights change infrequently |
| Events list          | 30s                 | New events may be added              |
| Event detail         | 60s                 | Content rarely changes after creation|
| Members list         | 60s                 | Member list relatively stable        |
| Member detail        | 60s                 | Profile updates are infrequent       |
| Gallery              | 60s                 | Images added occasionally            |
| Clubs                | 60s                 | Club data rarely changes             |

### On-Demand Revalidation

- Admin CRUD operations trigger `revalidatePath()` or `revalidateTag()` after mutations.
- Ensures immediate consistency after admin edits.

### CDN Cache Headers

| Resource Type     | Cache-Control                              |
| ----------------- | ------------------------------------------ |
| Static assets     | `public, max-age=31536000, immutable`      |
| HTML pages        | `public, max-age=0, s-maxage=60, stale-while-revalidate=300` |
| API responses     | `private, no-cache` (authenticated)        |
| Images (next/image)| `public, max-age=31536000, immutable`     |
| Fonts             | `public, max-age=31536000, immutable`      |

---

## 8. Critical Rendering Path

### Optimization Checklist

| Optimization                  | Status   | Implementation                              |
| ----------------------------- | -------- | ------------------------------------------- |
| Server-side rendering (RSC)   | Default  | Next.js App Router with React Server Components |
| Streaming                     | Enabled  | Suspense boundaries for progressive loading  |
| CSS inlining                  | Auto     | Tailwind critical CSS inlined by Next.js     |
| Font preloading               | Enabled  | `next/font` with `preload: true`             |
| Image priority hints          | Manual   | `priority` on LCP images only                |
| Preconnect                    | Enabled  | `<link rel="preconnect">` for API domain     |
| JavaScript defer              | Auto     | Next.js handles script loading strategy      |
| Code splitting                | Auto     | Per-route code splitting by Next.js          |

### Rendering Strategy Per Route

| Route              | Strategy        | Reason                                   |
| ------------------ | --------------- | ---------------------------------------- |
| `/`                | ISR             | Public, cacheable, frequently visited    |
| `/events`          | ISR             | Public, list data changes moderately     |
| `/events/[id]`     | ISR             | Public, individual event data            |
| `/members`         | ISR             | Public, list data changes moderately     |
| `/members/[id]`    | ISR             | Public, individual member data           |
| `/gallery`         | ISR             | Public, image data changes occasionally  |
| `/clubs`           | ISR             | Public, club data rarely changes         |
| `/login`           | Static          | No dynamic data                          |
| `/profile/edit`    | Dynamic (SSR)   | Authenticated, user-specific data        |
| `/admin/*`         | Dynamic (SSR)   | Authenticated, real-time admin data      |
| `/error/*`         | Static          | No dynamic data                          |

---

## 9. Third-Party Scripts

### Budget: None

No third-party scripts are included in the initial release:

- No analytics (Google Analytics, Plausible, etc.)
- No tracking pixels
- No chat widgets
- No advertising scripts

### Future Considerations

If analytics is needed later:

- Use a lightweight, privacy-respecting solution (e.g., Plausible, Umami).
- Budget: < 5 KB gzipped.
- Load via `next/script` with `strategy="afterInteractive"`.
- Must not impact LCP or INP.

---

## 10. Monitoring & Enforcement

### Lighthouse CI

```yaml
# lighthouserc.json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000/",
        "http://localhost:3000/events",
        "http://localhost:3000/members"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.90 }],
        "categories:accessibility": ["error", { "minScore": 1.0 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 2000 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "interactive": ["error", { "maxNumericValue": 3500 }]
      }
    }
  }
}
```

### Web Vitals Reporting

```typescript
// src/app/layout.tsx — report Web Vitals in production
export function reportWebVitals(metric: NextWebVitalsMetric) {
  if (metric.label === "web-vital") {
    console.log(metric); // Replace with reporting endpoint when available
  }
}
```

### CI Pipeline Integration

| Check                    | Tool                | Threshold                  | Blocking |
| ------------------------ | ------------------- | -------------------------- | -------- |
| Bundle size              | `next build` output | Per-route < 50KB gzipped   | Yes      |
| Lighthouse scores        | Lighthouse CI       | Per category minimums      | Yes      |
| Core Web Vitals          | Lighthouse CI       | LCP, INP, CLS thresholds  | Yes      |
| Unused JavaScript        | Bundle analyzer     | Review only                | No       |

---

## 11. Performance Testing Matrix

| Scenario             | Device Profile         | Network          | Purpose                  |
| -------------------- | ---------------------- | ---------------- | ------------------------ |
| Desktop baseline     | Desktop Chrome         | Cable (5Mbps)    | Primary user experience  |
| Desktop slow         | Desktop Chrome         | Slow 3G          | Worst case desktop       |
| Mobile baseline      | Moto G Power           | 4G               | Mobile experience        |
| Mobile throttled     | Moto G Power           | Slow 3G          | Worst case mobile        |

### Performance Test Scenarios

1. **Cold load** — first visit, empty cache.
2. **Warm load** — return visit, populated cache.
3. **Navigation** — client-side navigation between pages.
4. **Interaction** — form filling, filtering, scrolling.
5. **Long list** — events list with 100+ items, members list with 200+ items.

---

## Appendix: Bundle Analysis Commands

```bash
# Analyze production bundle
ANALYZE=true next build

# Check bundle size
npx @next/bundle-analyzer

# Measure specific page performance
npx lighthouse http://localhost:3000 --output=json --output-path=./lighthouse-report.json

# Run Lighthouse CI
npx lhci autorun
```
