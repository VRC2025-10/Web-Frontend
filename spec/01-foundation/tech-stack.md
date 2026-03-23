# Tech Stack

This document defines the complete technology stack for the VRC October Cohort community website frontend. Every dependency is chosen with explicit rationale and rejected alternatives documented.

---

## 1. Core Stack

### Framework & Language

| Category | Choice | Version | Why | Rejected Alternatives |
|---|---|---|---|---|
| **Framework** | Next.js (App Router) | 16.x | React Server Components, ISR, Server Actions, built-in image optimization, file-based routing, standalone Docker output | **Remix** (less mature RSC story, smaller ecosystem), **Nuxt** (Vue — team uses React), **SvelteKit** (smaller ecosystem, fewer UI libraries) |
| **Language** | TypeScript | 5.x (strict mode) | Compile-time type safety, IDE intellisense, self-documenting APIs, catches bugs before runtime | Plain JavaScript (no type safety), **Flow** (losing ecosystem support) |
| **Runtime** | Node.js | 22.x LTS | Required by Next.js, LTS stability, broad ecosystem | **Bun** (not yet fully compatible with Next.js production), **Deno** (Next.js not supported) |

### UI Components & Styling

| Category | Choice | Version | Why | Rejected Alternatives |
|---|---|---|---|---|
| **UI Components** | shadcn/ui + Radix UI | Latest | Headless primitives, fully customizable, copy-paste ownership (no node_modules lock-in), MIT licensed, excellent accessibility defaults, Tailwind-native | **MUI** (heavy, opinionated styling, hard to customize deeply), **Chakra UI** (runtime CSS-in-JS, less App Router compat), **Ant Design** (corporate aesthetic, heavy), **Headless UI** (fewer components) |
| **Styling** | Tailwind CSS | v4 | Utility-first, zero-runtime, JIT compilation, excellent DX, design token integration via CSS custom properties, first-class dark mode | **CSS Modules** (more boilerplate, harder token integration), **styled-components** (runtime CSS-in-JS, RSC incompatible), **Vanilla Extract** (build complexity), **Panda CSS** (newer, less ecosystem) |
| **CSS Typography** | @tailwindcss/typography | v4 compatible | `prose` class for rendered Markdown/rich content, consistent typography without manual styling | Manual typography CSS (maintenance burden) |
| **Icons** | Lucide React | Latest | Soft, rounded icon variants match Autumn Soft aesthetic, tree-shakeable, 1000+ icons, MIT license | **Heroicons** (sharper aesthetic, fewer variants), **Phosphor** (good but less shadcn integration), **React Icons** (bundle size concerns with barrel exports) |

### Animation

| Category | Choice | Version | Why | Rejected Alternatives |
|---|---|---|---|---|
| **Animation** | Framer Motion | 12.x | Best-in-class React integration, spring physics for "adult-cute" feel, layout animations, AnimatePresence for exit animations, gesture support | **GSAP** (not React-native, commercial license for some features), **CSS-only** (no spring physics, no exit animations, no layout animations), **React Spring** (less active development), **Motion One** (less React integration) |

### Theming & Dark Mode

| Category | Choice | Version | Why | Rejected Alternatives |
|---|---|---|---|---|
| **Dark Mode** | next-themes | Latest | SSR flash prevention (critical for Docker/self-hosted), system preference detection, cookie-based persistence, tiny bundle | **Manual implementation** (SSR flash is hard to solve correctly), **CSS-only** (no persistence, no system detection) |

---

## 2. Data & Forms

| Category | Choice | Version | Why | Rejected Alternatives |
|---|---|---|---|---|
| **Forms** | react-hook-form | Latest | Uncontrolled form performance, minimal re-renders, excellent DX, tiny bundle, first-class Zod integration | **Formik** (more re-renders, larger bundle, less active), **React Final Form** (smaller ecosystem), **Native forms only** (insufficient for complex validation UX) |
| **Validation** | Zod | Latest | TypeScript-first schema validation, infers types from schemas (single source of truth), works on server and client, composable schemas | **Yup** (less TypeScript integration), **Valibot** (newer, smaller ecosystem), **io-ts** (complex API) |
| **Date/Time** | date-fns | Latest | Tree-shakeable (only import what you use), pure functions (no mutation), comprehensive i18n with locale imports, small bundle impact | **dayjs** (plugin system adds complexity), **Moment.js** (deprecated, massive bundle, mutable), **Temporal API** (not yet widely supported) |
| **State Management** | None (RSC + Server Actions) | — | Server Components eliminate most client state needs. Server Actions handle mutations. Minimal client state for UI-only concerns (modals, form state) handled by React's built-in useState/useReducer | **Redux** (massive boilerplate for minimal client state), **Zustand** (unnecessary when RSC handles data), **Jotai** (same — unnecessary complexity) |

---

## 3. Content & Media

| Category | Choice | Version | Why | Rejected Alternatives |
|---|---|---|---|---|
| **Markdown Rendering** | react-markdown + remark-gfm | Latest | Client-side Markdown preview in profile/event editors, GFM support (tables, task lists, strikethrough), customizable renderers, React-native | **marked** (not React-native, XSS concerns without sanitization), **MDX** (overkill for user content), **unified** directly (react-markdown wraps it more conveniently) |
| **Markdown Sanitization** | rehype-sanitize | Latest | Prevents XSS in user-authored Markdown content, allowlist-based HTML filtering | **DOMPurify** (requires DOM, not ideal for server rendering) |
| **Image Optimization** | next/image | Built-in | Automatic WebP/AVIF conversion, responsive sizes, lazy loading, blur placeholder, built into Next.js | **Manual `<img>`** (no optimization), **Cloudinary** (external dependency, cost), **Sharp directly** (next/image wraps it) |
| **Carousel** | embla-carousel + embla-carousel-react | Latest | Lightweight (~3KB gzipped), extensible plugin system, shadcn/ui standard carousel dependency, touch/drag support, accessibility | **Swiper** (heavier, more opinionated styling), **Slick** (jQuery legacy, maintenance concerns), **Keen Slider** (less ecosystem integration) |

---

## 4. Internationalization

| Category | Choice | Version | Why | Rejected Alternatives |
|---|---|---|---|---|
| **i18n** | next-intl | Latest | Best App Router / RSC support, cookie-based locale detection (no URL prefix required), message extraction tooling, ICU message format, type-safe message keys | **next-i18n-router** (less feature-complete), **i18next / react-i18next** (complex setup with App Router), **Lingui** (smaller Next.js ecosystem) |

### i18n Strategy

- **Primary locale:** `ja` (Japanese)
- **Secondary locale:** `en` (English)
- **Locale detection:** Cookie-based (`NEXT_LOCALE`), fallback to `Accept-Language` header
- **URL strategy:** No locale prefix in URL (cookie determines language)
- **Content:** UI strings via next-intl message files; user-generated content stored in original language (no translation)

---

## 5. Testing

| Category | Choice | Version | Why | Rejected Alternatives |
|---|---|---|---|---|
| **E2E Testing** | Playwright | Latest | Best App Router compatibility, multi-browser support, auto-waiting, trace viewer, network interception | **Cypress** (weaker multi-tab/multi-origin, slower), **TestCafe** (smaller ecosystem) |
| **Unit / Component Testing** | Vitest | Latest | Vite-native speed, Jest-compatible API, ESM-first, excellent TypeScript support, built-in coverage | **Jest** (slower, CJS-first, more config needed for ESM/TypeScript) |
| **Component Testing Library** | React Testing Library | Latest | Tests user behavior (not implementation details), accessibility-first queries, industry standard | **Enzyme** (deprecated for modern React), **Testing Library alternatives** (none as established) |
| **Visual Testing** | Storybook | Latest | Component development in isolation, visual regression testing, documentation, accessibility addon (a11y) | **Ladle** (less ecosystem), **Histoire** (Vue-focused) |
| **API Mocking** | MSW (Mock Service Worker) | Latest | Intercepts at network level (works in browser and Node), realistic mock API responses, shared mocks between Storybook/Vitest/Playwright | **Nock** (Node-only), **Mirage** (heavier, less modern) |
| **Accessibility Testing** | axe-core (via @axe-core/playwright + vitest-axe) | Latest | Automated WCAG compliance checking, integrates into existing test pipeline | **Pa11y** (less integration), **manual only** (not scalable) |

### Test Strategy Summary

```
Playwright (E2E)     — Critical user flows: event check, profile creation, admin operations
Vitest (Unit)        — Utility functions, hooks, server actions, API client
RTL (Component)      — Interactive components: forms, dropdowns, modals, editors
Storybook (Visual)   — All UI components in isolation, all variants documented
MSW (API Mock)       — Shared mock layer across all test types
axe-core (A11y)      — Automated accessibility checks in E2E and component tests
```

---

## 6. Developer Experience

| Category | Choice | Version | Why | Rejected Alternatives |
|---|---|---|---|---|
| **Package Manager** | npm | 10.x (ships with Node 22) | Standard, universal, zero additional setup, lockfile (`package-lock.json`) well understood | **pnpm** (faster but adds setup complexity and potential CI issues), **yarn** (berry/PnP has compatibility issues with some packages), **bun** (not yet stable for production) |
| **Linting** | ESLint | 9.x (flat config) | Industry standard, extensive plugin ecosystem, auto-fixable rules | **Biome** (promising but less plugin ecosystem for React/Next.js) |
| **Formatting** | Prettier | Latest | Opinionated (eliminates formatting debates), ESLint integration, editor support | **Biome** (formatting is good but less ecosystem), **dprint** (less adoption) |
| **Git Hooks** | lint-staged + husky | Latest | Pre-commit linting/formatting, prevents CI failures from code style issues | **lefthook** (Go dependency), **simple-git-hooks** (less feature-complete) |
| **Commit Convention** | Conventional Commits | — | Structured commit messages, enables auto-changelog, enforced via commitlint | Free-form commits (inconsistent, hard to parse) |
| **Toast Notifications** | Sonner (via shadcn/ui) | Latest | Beautiful default styling, accessible (ARIA live region), customizable, shadcn/ui standard | **react-hot-toast** (less accessible, less customizable), **react-toastify** (heavier, more opinionated) |

---

## 7. Infrastructure & Deployment

| Category | Choice | Why | Notes |
|---|---|---|---|
| **Deployment** | Docker (self-hosted) | Full control, no vendor lock-in, consistent environments | `output: 'standalone'` in next.config |
| **Backend API** | Rust / Axum (external) | Independent backend, communicates via REST JSON | Not part of this frontend repo |
| **Image Storage** | MinIO (S3-compatible) | Self-hosted object storage, S3 API compatible | Custom next/image loader for MinIO URLs |
| **Reverse Proxy** | Nginx or Caddy | TLS termination, static file serving, gzip/brotli | Configured separately |
| **CI/CD** | GitHub Actions | Automated testing, building, Docker image push | Runs Playwright, Vitest, ESLint, type-check |

### Docker Configuration Notes

- Next.js `output: 'standalone'` produces a minimal Node.js server
- Multi-stage Dockerfile: build stage (Node + deps) → production stage (Node + standalone output)
- No reliance on Vercel-specific features:
  - No Edge Runtime
  - No Edge Middleware (use standard Next.js middleware)
  - No Vercel KV, Vercel Blob, or Vercel Postgres
  - No `@vercel/*` packages
- ISR uses filesystem cache (default Next.js behavior)
- Environment variables injected at container runtime, not build time

---

## 8. Complete npm Package List

### Production Dependencies

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",

    "@radix-ui/react-accordion": "latest",
    "@radix-ui/react-alert-dialog": "latest",
    "@radix-ui/react-aspect-ratio": "latest",
    "@radix-ui/react-avatar": "latest",
    "@radix-ui/react-checkbox": "latest",
    "@radix-ui/react-collapsible": "latest",
    "@radix-ui/react-context-menu": "latest",
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-dropdown-menu": "latest",
    "@radix-ui/react-hover-card": "latest",
    "@radix-ui/react-label": "latest",
    "@radix-ui/react-menubar": "latest",
    "@radix-ui/react-navigation-menu": "latest",
    "@radix-ui/react-popover": "latest",
    "@radix-ui/react-progress": "latest",
    "@radix-ui/react-radio-group": "latest",
    "@radix-ui/react-scroll-area": "latest",
    "@radix-ui/react-select": "latest",
    "@radix-ui/react-separator": "latest",
    "@radix-ui/react-slider": "latest",
    "@radix-ui/react-slot": "latest",
    "@radix-ui/react-switch": "latest",
    "@radix-ui/react-tabs": "latest",
    "@radix-ui/react-toast": "latest",
    "@radix-ui/react-toggle": "latest",
    "@radix-ui/react-toggle-group": "latest",
    "@radix-ui/react-tooltip": "latest",

    "tailwindcss": "^4.0.0",
    "@tailwindcss/typography": "^4.0.0",

    "framer-motion": "^12.0.0",

    "next-intl": "latest",
    "next-themes": "latest",

    "react-hook-form": "latest",
    "@hookform/resolvers": "latest",
    "zod": "latest",

    "date-fns": "latest",

    "embla-carousel-react": "latest",
    "embla-carousel-autoplay": "latest",

    "lucide-react": "latest",

    "react-markdown": "latest",
    "remark-gfm": "latest",
    "rehype-sanitize": "latest",

    "sonner": "latest",

    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest",
    "cmdk": "latest",

    "nuqs": "latest"
  }
}
```

### Development Dependencies

```json
{
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "@types/node": "^22.0.0",

    "eslint": "^9.0.0",
    "eslint-config-next": "^16.0.0",
    "@eslint/js": "latest",
    "typescript-eslint": "latest",
    "eslint-plugin-react-hooks": "latest",
    "eslint-plugin-jsx-a11y": "latest",

    "prettier": "latest",
    "prettier-plugin-tailwindcss": "latest",

    "husky": "latest",
    "lint-staged": "latest",
    "@commitlint/cli": "latest",
    "@commitlint/config-conventional": "latest",

    "playwright": "latest",
    "@playwright/test": "latest",
    "@axe-core/playwright": "latest",

    "vitest": "latest",
    "@vitejs/plugin-react": "latest",
    "@testing-library/react": "latest",
    "@testing-library/jest-dom": "latest",
    "@testing-library/user-event": "latest",
    "vitest-axe": "latest",
    "jsdom": "latest",

    "storybook": "latest",
    "@storybook/react-vite": "latest",
    "@storybook/addon-essentials": "latest",
    "@storybook/addon-a11y": "latest",
    "@storybook/addon-interactions": "latest",
    "@storybook/test": "latest",

    "msw": "latest",

    "@tailwindcss/postcss": "^4.0.0"
  }
}
```

### Utility Notes

| Package | Purpose |
|---|---|
| `class-variance-authority` | Component variant management (shadcn/ui standard) |
| `clsx` | Conditional class name joining |
| `tailwind-merge` | Intelligent Tailwind class merging (avoids conflicts) |
| `cmdk` | Command palette component (⌘K) — shadcn/ui uses this |
| `nuqs` | Type-safe URL search parameter state management |
| `@hookform/resolvers` | Connects react-hook-form with Zod schemas |
| `embla-carousel-autoplay` | Autoplay plugin for gallery/event carousels |

---

## 9. Dependency Constraints

| Constraint | Rule | Rationale |
|---|---|---|
| **No C/C++ native dependencies** | All npm packages must be pure JavaScript/TypeScript or WASM | Docker build must not require native build tools (node-gyp, python, gcc) |
| **No GPL libraries** | All dependencies must use permissive licenses (MIT, Apache 2.0, BSD, ISC) | License compatibility with the project's permissive license |
| **No Vercel-only packages** | No `@vercel/*` packages, no Vercel-specific APIs | Deployment independence — must work on any Docker host |
| **No CSS-in-JS runtime** | No styled-components, Emotion, or similar runtime style solutions | Performance — no runtime style computation, RSC compatibility |
| **No barrel re-exports for icons** | Import icons individually: `import { Heart } from "lucide-react"` | Tree-shaking — prevents bundling unused icons |
| **Pin major versions** | Use `^` for minor/patch, update majors explicitly and deliberately | Stability — prevents unexpected breaking changes |

---

## 10. Version Compatibility Matrix

| Package | Minimum Version | Compatible With | Notes |
|---|---|---|---|
| Next.js | 16.0.0 | React 19, Node 22 | App Router, RSC, Server Actions |
| React | 19.0.0 | Next.js 16 | Required for `use` hook, Server Components |
| TypeScript | 5.7.0 | Next.js 16, ESLint 9 | Strict mode enabled |
| Tailwind CSS | 4.0.0 | Next.js 16, PostCSS | CSS-first configuration |
| Framer Motion | 12.0.0 | React 19, RSC (client boundary) | `"use client"` required |
| Node.js | 22.0.0 | Next.js 16, npm 10 | LTS, used in Docker |
| ESLint | 9.0.0 | TypeScript 5.7, flat config | New flat config format |
| Playwright | latest | Node 22 | Multi-browser E2E |
| Vitest | latest | React 19, TypeScript 5.7 | Vite-powered, ESM-first |
| Storybook | latest | React 19, Vite | React-Vite builder |
