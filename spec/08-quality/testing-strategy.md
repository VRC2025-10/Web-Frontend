# Testing Strategy

> **Version:** 1.0
> **Last Updated:** 2026-03-20

## Overview

This document defines the comprehensive testing strategy for the VRC community website frontend. The strategy follows a testing pyramid approach, ensuring confidence at every layer while keeping feedback loops fast.

---

## 1. Testing Pyramid

```
         ╱╲
        ╱ E2E ╲          Playwright — critical user journeys
       ╱────────╲
      ╱  Visual   ╲       Playwright screenshots / Storybook + Chromatic
     ╱──────────────╲
    ╱  Integration    ╲    Playwright — multi-page user flows
   ╱────────────────────╲
  ╱    Component Tests    ╲  Vitest + Testing Library — isolated UI
 ╱──────────────────────────╲
╱       Unit Tests            ╲  Vitest — pure functions, hooks, schemas
╱──────────────────────────────╲
         Static Analysis          TypeScript, ESLint, Stylelint, Prettier
```

| Layer             | Tool                        | Speed   | Count    |
| ----------------- | --------------------------- | ------- | -------- |
| Static Analysis   | TS strict, ESLint, Prettier | Instant | All code |
| Unit              | Vitest                      | < 1s    | Many     |
| Component         | Vitest + Testing Library    | < 3s    | Moderate |
| Integration       | Playwright                  | < 15s   | Moderate |
| Visual Regression | Playwright / Chromatic      | < 30s   | Moderate |
| E2E               | Playwright                  | < 60s   | Few      |

---

## 2. Static Analysis

### TypeScript Strict Mode

- `strict: true` in `tsconfig.json` — no implicit `any`, strict null checks, strict function types.
- All API response types generated from or aligned with backend OpenAPI schemas via Zod.

### ESLint

| Plugin                    | Purpose                          |
| ------------------------- | -------------------------------- |
| `eslint-plugin-jsx-a11y`  | Accessibility lint rules         |
| `eslint-plugin-react`     | React best practices             |
| `eslint-plugin-import`    | Import ordering and cycle checks |
| `@next/eslint-plugin-next`| Next.js specific rules           |

### Stylelint

- Lint Tailwind CSS `@apply` usage and custom CSS.
- Enforce consistent ordering of utility classes.

### Prettier

- Consistent code formatting across the entire codebase.
- Runs as pre-commit hook via `lint-staged`.

---

## 3. Unit Tests (Vitest)

### Scope

Unit tests cover pure functions, schemas, and custom hooks in isolation.

### Targets

| Category         | Examples                                              | Coverage Target |
| ---------------- | ----------------------------------------------------- | --------------- |
| Utility functions| `cn()`, date formatters, URL builders, slug generators| 80%             |
| Zod schemas      | Request/response validation, form schemas             | 80%             |
| Custom hooks     | `useTheme`, `useLocale`, `useDebounce`                | 80%             |
| Formatters       | Date/time i18n, number formatting, relative time      | 80%             |

### Conventions

```typescript
// ✅ Good: descriptive, grouped by behavior
describe("cn()", () => {
  it("merges class names without conflicts", () => { ... });
  it("resolves Tailwind conflicts by last-wins", () => { ... });
});

describe("formatEventDate()", () => {
  it("formats date in Japanese locale", () => { ... });
  it("formats date in English locale", () => { ... });
  it("returns relative time for dates within 24 hours", () => { ... });
});
```

### File Naming

- `*.test.ts` for pure logic tests.
- Colocated next to the source file: `src/lib/utils.ts` → `src/lib/utils.test.ts`.

---

## 4. Component Tests (Vitest + Testing Library)

### Scope

Component tests verify rendering, interaction, accessibility, and theming of individual UI components.

### Query Priority (strict)

| Priority | Query                  | Use Case                    |
| -------- | ---------------------- | --------------------------- |
| 1        | `getByRole`            | Buttons, links, headings    |
| 2        | `getByLabelText`       | Form inputs                 |
| 3        | `getByText`            | Static content              |
| 4        | `getByDisplayValue`    | Current input values        |
| 5        | `getByAltText`         | Images                      |
| **Never**| ~~`getByTestId`~~      | **Prohibited** — use semantic queries |

### Test Requirements

Every component test MUST include:

1. **Render test** — component renders without crashing.
2. **Accessibility assertions** — `axe-core` check passes.
3. **Keyboard interaction** — Tab, Enter, Escape, Arrow keys where applicable.
4. **Screen reader** — ARIA labels, roles, live regions verified.
5. **Theme variants** — test both light and dark mode rendering.

### Example

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Button } from "./button";

describe("Button", () => {
  it("renders with correct role and label", () => {
    render(<Button>Submit</Button>);
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  it("handles keyboard activation", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Submit</Button>);
    const button = screen.getByRole("button", { name: "Submit" });
    await userEvent.tab();
    expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("passes accessibility audit", async () => {
    const { container } = render(<Button>Submit</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders correctly in dark mode", () => {
    render(
      <div data-theme="dark">
        <Button variant="primary">Submit</Button>
      </div>
    );
    // Assert computed styles or class names
  });
});
```

### File Naming

- `*.test.tsx` for component tests.
- Colocated: `src/components/ui/button.tsx` → `src/components/ui/button.test.tsx`.

---

## 5. Integration Tests (Playwright)

### Scope

Integration tests validate multi-step user flows that span multiple components and pages.

### User Flows

| Flow                | Description                                           |
| ------------------- | ----------------------------------------------------- |
| Login redirect      | Unauthenticated user → login → redirect to original page |
| Profile edit        | Navigate to profile → edit fields → save → verify update |
| Event browse        | Home → events list → filter → event detail → back     |
| Admin CRUD          | Admin dashboard → create event → edit → delete → verify |
| Form submission     | Fill form → validation errors → fix → submit → success |
| Error recovery      | Trigger server error → see error page → retry → success |

### Conventions

```typescript
// events.spec.ts
test("user can browse events and view details", async ({ page }) => {
  await page.goto("/events");
  await expect(page.getByRole("heading", { name: /events/i })).toBeVisible();

  // Filter by upcoming
  await page.getByRole("tab", { name: /upcoming/i }).click();

  // Click first event
  const firstEvent = page.getByRole("article").first();
  const eventTitle = await firstEvent.getByRole("heading").textContent();
  await firstEvent.getByRole("link").click();

  // Verify detail page
  await expect(page.getByRole("heading", { name: eventTitle! })).toBeVisible();
});
```

### File Naming

- `*.spec.ts` for Playwright tests.
- Located in `e2e/` directory at project root.

---

## 6. Visual Regression Testing

### Approach

Two complementary strategies:

| Method               | Tool                    | When                     |
| -------------------- | ----------------------- | ------------------------ |
| Playwright snapshots | `toHaveScreenshot()`    | CI pipeline on every PR  |
| Storybook + Chromatic| Chromatic cloud service | Component-level diffs    |

### Coverage Matrix

| Dimension          | Variants                              |
| ------------------ | ------------------------------------- |
| Component variants | All props combinations (variant, size)|
| States             | Default, hover, focus, active, disabled, loading, error |
| Themes             | Light mode, Dark mode                 |
| Breakpoints        | Mobile (375px), Tablet (768px), Desktop (1280px), Wide (1536px) |
| Locale             | Japanese, English                     |

### Playwright Screenshot Config

```typescript
// playwright.config.ts
expect: {
  toHaveScreenshot: {
    maxDiffPixelRatio: 0.01,
    threshold: 0.2,
  },
},
```

---

## 7. E2E Tests (Playwright)

### Critical Paths

These tests run against a full environment (or preview deployment) and must pass before merge.

| Path                  | Steps                                                  | Priority |
| --------------------- | ------------------------------------------------------ | -------- |
| Home page load        | Navigate → verify hero, events section, footer visible | P0       |
| Event list → detail   | Events page → scroll → click event → verify detail     | P0       |
| Member search         | Members page → search by name → verify results         | P0       |
| Login flow            | Click login → Discord OAuth → redirect back            | P0       |
| Admin dashboard       | Login as admin → navigate dashboard → verify stats     | P1       |
| Profile edit          | Login → profile → edit → save → verify                 | P1       |
| Dark mode toggle      | Toggle theme → verify styles update                    | P2       |
| Language toggle       | Toggle locale → verify content language changes        | P2       |

### Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: "./e2e",
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 5"] } },
  ],
});
```

---

## 8. Storybook

### Requirements

- **Every component** must have a Storybook story.
- Stories must cover **all variants and states** (see Visual Regression matrix above).
- Auto-generated docs via `autodocs` tag.

### Addons

| Addon                  | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| `@storybook/addon-a11y`| axe-core accessibility audit per story   |
| `@storybook/addon-docs`| Auto-generated documentation             |
| `@storybook/addon-viewport` | Responsive preview                 |
| `storybook-dark-mode`  | Light/dark theme toggle in Storybook     |

### Story Convention

```typescript
// button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "ghost", "destructive"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { variant: "primary", children: "Button" } };
export const Secondary: Story = { args: { variant: "secondary", children: "Button" } };
export const Loading: Story = { args: { variant: "primary", children: "Saving...", disabled: true } };
```

---

## 9. Coverage Targets

| Layer       | Target | Enforcement      |
| ----------- | ------ | ---------------- |
| Utilities   | 80%    | CI gate          |
| Components  | 70%    | CI gate          |
| Hooks       | 80%    | CI gate          |
| E2E paths   | 100% of critical paths | CI gate |
| Visual      | All component variants | PR review |

### Vitest Coverage Config

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      thresholds: {
        "src/lib/**": { statements: 80, branches: 80, functions: 80 },
        "src/components/**": { statements: 70, branches: 70, functions: 70 },
        "src/hooks/**": { statements: 80, branches: 80, functions: 80 },
      },
    },
  },
});
```

---

## 10. CI Integration

### Pipeline Stages

```
PR opened / updated
  ├── 1. Lint & Type Check (parallel)
  │     ├── TypeScript strict compilation
  │     ├── ESLint (including jsx-a11y)
  │     ├── Stylelint
  │     └── Prettier format check
  ├── 2. Unit & Component Tests
  │     ├── Vitest run
  │     └── Coverage threshold check
  ├── 3. Build
  │     └── next build (ensures no build errors)
  ├── 4. Integration & E2E Tests
  │     ├── Playwright integration tests
  │     └── Playwright E2E tests
  ├── 5. Visual Regression
  │     └── Playwright screenshots / Chromatic
  └── 6. Lighthouse CI
        └── Performance budget check
```

### Merge Requirements

- **All stages must pass** — failure blocks merge.
- Coverage thresholds must be met.
- No new accessibility violations.
- Visual regression diffs must be approved (if any).

---

## 11. Test Data Management

### Factory Functions

```typescript
// tests/factories/event.ts
import { faker } from "@faker-js/faker";

export function createMockEvent(overrides?: Partial<Event>): Event {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.words(3),
    description: faker.lorem.paragraph(),
    startDate: faker.date.future().toISOString(),
    endDate: faker.date.future().toISOString(),
    imageUrl: faker.image.url(),
    tags: [faker.lorem.word()],
    ...overrides,
  };
}
```

### MSW (Mock Service Worker)

- All API calls mocked with MSW in component and integration tests.
- Handlers organized by domain: `handlers/events.ts`, `handlers/auth.ts`, etc.
- Shared between Vitest (via `msw/node`) and Storybook (via `msw-storybook-addon`).

```typescript
// tests/mocks/handlers/events.ts
import { http, HttpResponse } from "msw";
import { createMockEvent } from "../factories/event";

export const eventHandlers = [
  http.get("/api/v1/public/events", () => {
    return HttpResponse.json({
      items: Array.from({ length: 10 }, () => createMockEvent()),
      total: 10,
    });
  }),
];
```

---

## 12. Accessibility Testing

### Layered Approach

| Layer            | Tool                  | What it checks                         |
| ---------------- | --------------------- | -------------------------------------- |
| Static analysis  | eslint-plugin-jsx-a11y| Missing alt text, invalid ARIA, roles  |
| Component tests  | vitest-axe (axe-core) | WCAG 2.1 AA violations per component  |
| Storybook        | @storybook/addon-a11y | Visual a11y panel for each story       |
| E2E              | @axe-core/playwright  | Full-page accessibility audit          |

### Playwright Accessibility Scan

```typescript
import AxeBuilder from "@axe-core/playwright";

test("home page passes accessibility audit", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

### WCAG 2.1 AA Requirements

- All interactive elements keyboard accessible.
- Color contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text.
- All images have meaningful `alt` text (or are decorative with `alt=""`).
- Focus indicators visible on all interactive elements.
- ARIA landmarks on all pages (`main`, `nav`, `banner`, `contentinfo`).
- Live regions for dynamic content updates (toasts, form errors).

---

## Appendix: Test File Structure

```
project-root/
├── e2e/                          # Playwright E2E & integration tests
│   ├── home.spec.ts
│   ├── events.spec.ts
│   ├── members.spec.ts
│   ├── login.spec.ts
│   ├── admin/
│   │   ├── dashboard.spec.ts
│   │   └── events-crud.spec.ts
│   └── fixtures/
│       └── auth.ts               # Authenticated state fixture
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── button.test.tsx    # Component test
│   │       └── button.stories.tsx # Storybook story
│   ├── lib/
│   │   ├── utils.ts
│   │   └── utils.test.ts         # Unit test
│   └── hooks/
│       ├── use-theme.ts
│       └── use-theme.test.ts     # Hook test
├── tests/
│   ├── factories/                # Mock data factories
│   │   ├── event.ts
│   │   ├── member.ts
│   │   └── user.ts
│   ├── mocks/
│   │   ├── handlers/             # MSW handlers
│   │   │   ├── auth.ts
│   │   │   ├── events.ts
│   │   │   └── members.ts
│   │   └── server.ts             # MSW server setup
│   └── setup.ts                  # Vitest global setup
├── playwright.config.ts
└── vitest.config.ts
```
