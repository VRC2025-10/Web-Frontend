# Risk Register

> **Version:** 1.0
> **Last Updated:** 2026-03-20

## Overview

This document identifies risks to the VRC community website frontend project, assesses their likelihood and impact, and defines mitigation strategies.

---

## Risk Assessment Matrix

| Likelihood / Impact | Low Impact | Medium Impact | High Impact |
| ------------------- | ---------- | ------------- | ----------- |
| **High**            | Monitor    | Mitigate      | Critical    |
| **Medium**          | Accept     | Mitigate      | Mitigate    |
| **Low**             | Accept     | Monitor       | Mitigate    |

---

## Risk Register

### R-01: ISR Cache Staleness

| Field       | Value                                                        |
| ----------- | ------------------------------------------------------------ |
| Risk        | Users see stale data after admin creates/updates/deletes content due to ISR revalidation delay. |
| Likelihood  | **High**                                                     |
| Impact      | **Medium**                                                   |
| Category    | Technical                                                    |
| Phase       | Phase 2+                                                     |
| Owner       | Frontend Lead                                                |

**Mitigation:**
- Implement on-demand revalidation via `revalidatePath()` and `revalidateTag()` in Server Actions after every admin mutation.
- Display "last updated" timestamps on pages so users understand data freshness.
- Set ISR revalidation periods conservatively (30–60s) as a safety net.
- Admin UI shows a "revalidating..." indicator after CRUD operations.

---

### R-02: Dark Mode Contrast Issues

| Field       | Value                                                        |
| ----------- | ------------------------------------------------------------ |
| Risk        | Warm dark palette colors fail WCAG 2.1 AA contrast requirements, making text unreadable for some users. |
| Likelihood  | **Medium**                                                   |
| Impact      | **High**                                                     |
| Category    | Accessibility                                                |
| Phase       | Phase 1                                                      |
| Owner       | Design Lead                                                  |

**Mitigation:**
- Verify every color token pair (foreground/background) against WCAG AA requirements (4.5:1 normal text, 3:1 large text) during design token definition.
- Use automated contrast checking in CI (axe-core, Lighthouse accessibility).
- Storybook a11y addon provides per-component contrast reporting.
- Maintain a contrast verification spreadsheet for all token combinations.
- Designate a "contrast fallback" — if a warm dark color fails, shift toward a cooler tone until AA is met.

---

### R-03: "Yurufuwa" Aesthetic vs Readability

| Field       | Value                                                        |
| ----------- | ------------------------------------------------------------ |
| Risk        | Decorative elements (leaf particles, soft gradients, rounded shapes) interfere with text readability and UI clarity. |
| Likelihood  | **Medium**                                                   |
| Impact      | **Medium**                                                   |
| Category    | Design                                                       |
| Phase       | Phase 2, Phase 5                                             |
| Owner       | Design Lead                                                  |

**Mitigation:**
- Strict rule: **decorative elements in background only**, clean text areas with sufficient contrast.
- Leaf particles render on a separate canvas layer behind content with reduced opacity.
- No text overlay on busy backgrounds without a semi-transparent backdrop.
- Component tests verify that text is legible (contrast ratios).
- User testing with real VRChat community members to validate aesthetics.

---

### R-04: MinIO Availability

| Field       | Value                                                        |
| ----------- | ------------------------------------------------------------ |
| Risk        | Self-hosted MinIO instance becomes unavailable, breaking image display and uploads. |
| Likelihood  | **Low**                                                      |
| Impact      | **High**                                                     |
| Category    | Infrastructure                                               |
| Phase       | Phase 2+                                                     |
| Owner       | Infrastructure Lead                                          |

**Mitigation:**
- MinIO uses S3-compatible API — can switch to any S3 provider with zero frontend code changes.
- Implement fallback placeholder images when MinIO is unreachable.
- Nginx caches served images — cached images survive brief MinIO outages.
- `next/image` optimization layer provides an additional caching tier.
- Backend health checks monitor MinIO and report status.

---

### R-05: Admin Event CRUD Backend API Not Yet Implemented

| Field       | Value                                                        |
| ----------- | ------------------------------------------------------------ |
| Risk        | Frontend Phase 4 (Admin) is blocked because backend admin event CRUD endpoints are not yet available. |
| Likelihood  | **High**                                                     |
| Impact      | **High**                                                     |
| Category    | Dependency                                                   |
| Phase       | Phase 4                                                      |
| Owner       | Project Lead                                                 |

**Mitigation:**
- **Type-first development:** Define request/response TypeScript types and Zod schemas ahead of backend implementation.
- **MSW mock API:** Use Mock Service Worker to simulate all admin endpoints during frontend development.
- **Contract-first:** Agree on API contracts (see [backend-requirements.md](backend-requirements.md)) before development starts.
- Frontend and backend development can proceed in parallel.
- Integration testing against the real API happens once endpoints are available.

---

### R-06: Report Management API Gaps

| Field       | Value                                                        |
| ----------- | ------------------------------------------------------------ |
| Risk        | Backend report management API (status transitions, context fetching) is incomplete or has a different shape than expected. |
| Likelihood  | **Medium**                                                   |
| Impact      | **Medium**                                                   |
| Category    | Dependency                                                   |
| Phase       | Phase 4                                                      |
| Owner       | Project Lead                                                 |

**Mitigation:**
- Same approach as R-05: type-first development with MSW mocks.
- Define expected report status enum (`pending`, `reviewed`, `resolved`, `dismissed`) early and align with backend.
- Regular sync meetings between frontend and backend teams on API shape.

---

### R-07: Scope Creep

| Field       | Value                                                        |
| ----------- | ------------------------------------------------------------ |
| Risk        | Additional features requested during development extend timelines and increase complexity. |
| Likelihood  | **High**                                                     |
| Impact      | **Medium**                                                   |
| Category    | Project Management                                           |
| Phase       | All phases                                                   |
| Owner       | Project Lead                                                 |

**Mitigation:**
- **Phased delivery with phase gates** — new features are deferred to later phases.
- Phase gate reviews explicitly ask: "Is this scope creep?"
- Maintain a backlog for post-Phase 5 features.
- Each phase has well-defined acceptance criteria — done means done.
- "Nice-to-have" features are documented but not committed.

---

### R-08: Japanese Font Loading Performance

| Field       | Value                                                        |
| ----------- | ------------------------------------------------------------ |
| Risk        | Noto Sans JP is a large font family; Japanese character sets are significantly larger than Latin, causing slow initial page loads. |
| Likelihood  | **Medium**                                                   |
| Impact      | **Medium**                                                   |
| Category    | Performance                                                  |
| Phase       | Phase 1                                                      |
| Owner       | Frontend Lead                                                |

**Mitigation:**
- Use `next/font/google` with automatic subsetting.
- Limit font weights to 400 (regular), 500 (medium), and 700 (bold) only.
- `font-display: swap` ensures text is visible immediately with fallback font.
- `preload: true` prioritizes font loading.
- System font fallback chain: `Hiragino Kaku Gothic ProN`, `Hiragino Sans`, `sans-serif`.
- Monitor font file sizes in CI — flag if total exceeds 150KB.

---

### R-09: Framer Motion Bundle Size

| Field       | Value                                                        |
| ----------- | ------------------------------------------------------------ |
| Risk        | Framer Motion adds significant JavaScript to the client bundle (~25KB gzipped), impacting initial load performance. |
| Likelihood  | **Medium**                                                   |
| Impact      | **Medium**                                                   |
| Category    | Performance                                                  |
| Phase       | Phase 5                                                      |
| Owner       | Frontend Lead                                                |

**Mitigation:**
- **Dynamic import** all Framer Motion components with `next/dynamic` and `ssr: false`.
- Tree-shake by importing only used exports (`motion`, `AnimatePresence`, specific hooks).
- Animation components are not in the critical rendering path — they load after page content.
- Leaf particle animation uses Canvas API, not Framer Motion DOM elements.
- Monitor per-route bundle sizes in CI — flag if any route exceeds 50KB.
- Consider `motion/mini` (Framer Motion's reduced bundle) if available.

---

### R-10: Cookie-Based i18n SEO Limitation

| Field       | Value                                                        |
| ----------- | ------------------------------------------------------------ |
| Risk        | Search engines cannot discover or index English language content because URLs are locale-agnostic and SEO bots default to Japanese. |
| Likelihood  | **High**                                                     |
| Impact      | **Low**                                                      |
| Category    | SEO                                                          |
| Phase       | Phase 2                                                      |
| Owner       | Frontend Lead                                                |

**Mitigation:**
- **Accepted risk.** The primary audience is Japanese VRChat users. Japanese content indexing is the priority.
- English content is a convenience for non-Japanese community members, not an SEO target.
- If English SEO becomes important later, migrate to path-based i18n (`/en/...`) — this is a reversible decision.
- Document this limitation in the project README.

---

### R-11: Discord OAuth2 redirect_to Implementation

| Field       | Value                                                        |
| ----------- | ------------------------------------------------------------ |
| Risk        | After Discord OAuth2 callback, the user should be redirected to their original page. The OAuth2 flow interrupts navigation, and the original URL must be preserved. |
| Likelihood  | **Medium**                                                   |
| Impact      | **Medium**                                                   |
| Category    | Technical                                                    |
| Phase       | Phase 2, Phase 3                                             |
| Owner       | Frontend Lead                                                |

**Mitigation:**
- Store the `redirect_to` URL in `localStorage` before initiating the OAuth2 flow.
- After OAuth2 callback, read from `localStorage` and navigate to the saved URL.
- Validate the `redirect_to` URL to prevent open redirect attacks — only allow same-origin paths.
- Fallback to home page (`/`) if `redirect_to` is missing or invalid.
- Clear `localStorage` entry after successful redirect.

---

### R-12: Image Upload Size/Type Attacks

| Field       | Value                                                        |
| ----------- | ------------------------------------------------------------ |
| Risk        | Malicious users upload oversized files, non-image files with spoofed MIME types, or images with embedded malicious content. |
| Likelihood  | **Medium**                                                   |
| Impact      | **High**                                                     |
| Category    | Security                                                     |
| Phase       | Phase 3                                                      |
| Owner       | Security Lead                                                |

**Mitigation:**
- **Client-side validation (first line):**
  - File size limits enforced before upload (avatar: 500KB, event: 2MB, gallery: 5MB).
  - MIME type whitelist: `image/jpeg`, `image/png`, `image/webp`, `image/gif`.
  - File extension validation.
- **Server-side validation (authoritative):**
  - Backend validates file magic bytes (not just MIME type header).
  - Backend enforces same size limits.
  - Backend strips EXIF metadata.
  - Images are re-encoded (resized/compressed) — this neutralizes most embedded payloads.
- **Upload flow:**
  - Uploads go through the backend API, never directly to MinIO from the client.
  - Pre-signed URLs are generated by the backend with size and type constraints.

---

### R-13: XSS via Markdown

| Field       | Value                                                        |
| ----------- | ------------------------------------------------------------ |
| Risk        | User-authored Markdown content (event descriptions, member bios) contains malicious HTML or JavaScript that executes in other users' browsers. |
| Likelihood  | **Medium**                                                   |
| Impact      | **Critical**                                                 |
| Category    | Security                                                     |
| Phase       | Phase 2, Phase 3                                             |
| Owner       | Security Lead                                                |

**Mitigation:**
- **Backend sanitization with ammonia** (Rust HTML sanitizer) — the single authoritative sanitization layer.
  - Whitelist of allowed HTML tags (p, strong, em, a, ul, ol, li, h1-h6, code, pre, blockquote, img).
  - Strip all `<script>`, `<iframe>`, `<object>`, `<embed>`, event handlers (`onclick`, etc.).
  - Sanitize `href` attributes — allow only `http://`, `https://`, `mailto:` protocols.
  - Strip `javascript:` URLs.
- **Frontend display:** Render backend-provided HTML via `dangerouslySetInnerHTML` — safe because the backend already sanitized it.
- **Frontend preview (edit mode):** Use `rehype-sanitize` with matching rules for client-side preview.
- **Never** render raw user HTML input on the client without sanitization.
- **Content Security Policy (CSP):** Deployed via Nginx headers as an additional defense layer.
- Regular security review of the sanitization whitelist.

---

## Risk Summary

| ID    | Risk                                    | Likelihood | Impact   | Strategy   |
| ----- | --------------------------------------- | ---------- | -------- | ---------- |
| R-01  | ISR cache staleness                     | High       | Medium   | Mitigate   |
| R-02  | Dark mode contrast issues               | Medium     | High     | Mitigate   |
| R-03  | "Yurufuwa" aesthetic vs readability     | Medium     | Medium   | Mitigate   |
| R-04  | MinIO availability                      | Low        | High     | Mitigate   |
| R-05  | Admin event CRUD API not implemented    | High       | High     | Critical   |
| R-06  | Report management API gaps              | Medium     | Medium   | Mitigate   |
| R-07  | Scope creep                             | High       | Medium   | Mitigate   |
| R-08  | Japanese font loading performance       | Medium     | Medium   | Mitigate   |
| R-09  | Framer Motion bundle size               | Medium     | Medium   | Mitigate   |
| R-10  | Cookie-based i18n SEO limitation        | High       | Low      | Accept     |
| R-11  | Discord OAuth2 redirect_to              | Medium     | Medium   | Mitigate   |
| R-12  | Image upload size/type attacks          | Medium     | High     | Mitigate   |
| R-13  | XSS via Markdown                        | Medium     | Critical | Mitigate   |
