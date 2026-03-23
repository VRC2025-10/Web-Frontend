# Typography System

Complete typographic scale, font families, loading strategy, and CJK-aware configuration for the Autumn Soft theme.

---

## Font Families

### Primary — Zen Kaku Gothic New (Japanese Body)

- **Source:** [Google Fonts](https://fonts.google.com/specimen/Zen+Kaku+Gothic+New)
- **Category:** Sans-serif, rounded terminals
- **Weights available:** 300, 400, 500, 700, 900
- **Weights used:** 400 (body), 500 (card titles), 700 (headings)
- **Why:** Rounded stroke endings match the Autumn Soft aesthetic. Outstanding CJK readability with balanced Latin glyphs. Warm personality without sacrificing legibility.
- **Applied to:** All body text, descriptions, navigation labels, form inputs, Japanese content.

### Secondary — Nunito (English Headings & Numbers)

- **Source:** [Google Fonts](https://fonts.google.com/specimen/Nunito)
- **Category:** Sans-serif, fully rounded
- **Weights available:** 200–1000 (variable)
- **Weights used:** 600 (section titles), 700 (page titles), 800 (hero)
- **Why:** Perfectly round terminals complement Zen Kaku. Excellent weight range for hierarchical headings. Soft, friendly, café-like character.
- **Applied to:** Display text, hero headlines, section headings, numeric values, English-heavy UI sections.

### Monospace — JetBrains Mono

- **Source:** [Google Fonts](https://fonts.google.com/specimen/JetBrains+Mono)
- **Weights used:** 400
- **Why:** Clean and readable monospace for code snippets in member profiles and markdown-rendered content.
- **Applied to:** Code blocks, inline code, technical identifiers (VRChat world IDs, etc.).

### Fallback Stack

```css
--font-sans: "Zen Kaku Gothic New", "Nunito", system-ui, -apple-system, "Segoe UI", Roboto, "Hiragino Sans", "Noto Sans JP", sans-serif;
--font-heading: "Nunito", "Zen Kaku Gothic New", system-ui, -apple-system, sans-serif;
--font-mono: "JetBrains Mono", ui-monospace, "Cascadia Code", "Fira Code", Consolas, monospace;
```

---

## Font Loading Strategy

### Next.js Integration

```tsx
// app/layout.tsx
import { Zen_Kaku_Gothic_New, Nunito, JetBrains_Mono } from "next/font/google";

const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ["latin", "latin-ext", "japanese"],       // Removed "cyrillic" — not needed
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-zen-kaku",
  preload: true,
  fallback: ["system-ui", "-apple-system", "Hiragino Sans", "sans-serif"],
});

const nunito = Nunito({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
  variable: "--font-nunito",
  preload: true,
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-mono",
  preload: false, // Code blocks are not above the fold
  fallback: ["ui-monospace", "Consolas", "monospace"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ja"
      className={`${zenKaku.variable} ${nunito.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

### Loading Priorities

| Font | Preload | Rationale |
|---|---|---|
| Zen Kaku Gothic New 400 | ✅ Yes | Primary body font — visible on every page immediately |
| Zen Kaku Gothic New 700 | ✅ Yes | Used in headings above the fold |
| Nunito 700 | ✅ Yes | Hero/page titles above the fold |
| Nunito 800 | ✅ Yes | Hero display text |
| Nunito 600 | ✅ Yes | Section headings, often above fold |
| JetBrains Mono 400 | ❌ No | Code blocks are below fold / profile pages only |
| Zen Kaku Gothic New 500 | ✅ Yes | Card titles, nav items — frequently above the fold |

### Performance Budget

- **Total web font payload target:** < 250 KB (compressed, all weights)
- Zen Kaku Gothic New Japanese subset: ~100-150 KB (compressed)
- Nunito variable subset: ~30-50 KB
- JetBrains Mono: ~20 KB
- `next/font` handles subsetting, self-hosting, and optimal `font-display` automatically.

---

## Type Scale

All sizes use `rem` units with `16px` root. Pixel equivalents are for reference only.

| Token | Size (rem) | Size (px) | Line Height | Letter Spacing | Weight | Use Case |
|---|---|---|---|---|---|---|
| `--text-xs` | 0.75rem | 12px | 1rem (16px) | 0.01em | 400 | Captions, timestamps, metadata |
| `--text-sm` | 0.875rem | 14px | 1.25rem (20px) | 0.005em | 400 | Helper text, badges, table cells |
| `--text-base` | 1rem | 16px | 1.5rem (24px) | 0 | 400 | Body text, descriptions, form inputs |
| `--text-lg` | 1.125rem | 18px | 1.75rem (28px) | -0.005em | 500 | Card titles, emphasized body |
| `--text-xl` | 1.25rem | 20px | 1.75rem (28px) | -0.01em | 600 | Section titles, dialog headers |
| `--text-2xl` | 1.5rem | 24px | 2rem (32px) | -0.015em | 700 | Page subtitles, major section headings |
| `--text-3xl` | 1.875rem | 30px | 2.25rem (36px) | -0.02em | 700 | Page titles |
| `--text-4xl` | 2.25rem | 36px | 2.5rem (40px) | -0.02em | 800 | Hero display (mobile) |
| `--text-5xl` | 3rem | 48px | 1 (line-height: 1) | -0.025em | 800 | Hero main text (desktop) |
| `--text-7xl` | 4.5rem | 72px | 1 (line-height: 1) | -0.03em | 800 | Hero main text (large desktop, 2xl+) |

### Responsive Heading Scale

Hero and page-level headings scale across breakpoints:

```
Hero Main:     text-4xl → sm:text-5xl → xl:text-7xl
Page Title:    text-2xl → sm:text-3xl
Section Title: text-xl  → sm:text-2xl
Card Title:    text-lg  (fixed)
```

---

## Font Weight Scale

| Token | Value | CSS Variable | Tailwind | Usage |
|---|---|---|---|---|
| `--font-normal` | 400 | `--font-weight-normal` | `font-normal` | Body text, descriptions, helper text, form inputs |
| `--font-medium` | 500 | `--font-weight-medium` | `font-medium` | Card titles, navigation items, table headers |
| `--font-semibold` | 600 | `--font-weight-semibold` | `font-semibold` | Section headings, emphasized text, button text |
| `--font-bold` | 700 | `--font-weight-bold` | `font-bold` | Page titles, buttons, member names, important labels |
| `--font-extrabold` | 800 | `--font-weight-extrabold` | `font-extrabold` | Hero display text only |

### Weight Assignment Rules

- **Nunito** is used at weights 600, 700, 800 (headings and display).
- **Zen Kaku Gothic New** is used at weights 400, 500, 700 (body and card-level text).
- Never use weight 300 (thin) — it reduces readability in the warm/soft aesthetic.
- Never use weight 900 (black) — too heavy for the gentle feel.

---

## CJK Considerations

The site is bilingual (Japanese primary, English secondary). Japanese text requires special typographic handling.

### Line Height

| Context | Latin Recommendation | CJK Recommendation | Our Value |
|---|---|---|---|
| Body text | 1.5 | 1.7–1.8 | 1.5rem (24px at 16px) — compromise |
| Card descriptions | 1.5 | 1.7 | 1.5rem |
| Long-form content | 1.6 | 1.8 | 1.75rem (28px at 16px) — boosted |
| Headings | 1.2–1.3 | 1.3–1.4 | Varies by scale token |

For long-form Japanese content (event descriptions, profile bios), apply `leading-relaxed` (1.625) or `leading-loose` (2) as appropriate.

### Word Breaking & Line Breaking

```css
/* Apply globally or to known Japanese content containers */
.text-ja {
  word-break: break-all;          /* Allow breaking within any character for Japanese */
  line-break: strict;             /* Enforce proper kinsoku (Japanese line-break rules) */
  overflow-wrap: break-word;      /* Fallback for very long unbroken strings */
  hanging-punctuation: first last; /* Proper CJK punctuation at line edges */
}
```

### Minimum Sizes for CJK

| Element | Minimum Size | Rationale |
|---|---|---|
| Body text | 14px (0.875rem) | CJK characters unreadable below 14px due to stroke complexity |
| Helper text | 12px (0.75rem) | Acceptable for timestamps/metadata only (not full sentences in Japanese) |
| Button labels | 14px (0.875rem) | Touch target readability |
| Input text | 16px (1rem) | Prevents iOS zoom on focus (< 16px triggers auto-zoom on Safari) |

### Character Spacing for CJK

Japanese text should **not** have additional letter-spacing. CJK characters are already designed with built-in spacing (monospaced glyph widths). Apply letter-spacing only to Latin/heading text.

```css
/* Only apply negative letter-spacing to Nunito headings, not Zen Kaku body */
.font-heading {
  letter-spacing: -0.02em;
}
```

---

## Tailwind Typography Plugin Customization

Override `@tailwindcss/typography` prose classes for the Autumn Soft theme. Used in event descriptions, profile bios, and any user-generated markdown content.

### Configuration

```ts
// tailwind.config.ts (prose override section)
typography: {
  DEFAULT: {
    css: {
      '--tw-prose-body': 'hsl(var(--foreground))',
      '--tw-prose-headings': 'hsl(var(--foreground))',
      '--tw-prose-lead': 'hsl(var(--muted-foreground))',
      '--tw-prose-links': 'hsl(var(--primary))',
      '--tw-prose-bold': 'hsl(var(--foreground))',
      '--tw-prose-counters': 'hsl(var(--muted-foreground))',
      '--tw-prose-bullets': 'hsl(var(--muted-foreground))',
      '--tw-prose-hr': 'hsl(var(--border))',
      '--tw-prose-quotes': 'hsl(var(--muted-foreground))',
      '--tw-prose-quote-borders': 'hsl(var(--border))',
      '--tw-prose-captions': 'hsl(var(--muted-foreground))',
      '--tw-prose-code': 'hsl(var(--foreground))',
      '--tw-prose-pre-code': 'hsl(var(--foreground))',
      '--tw-prose-pre-bg': 'hsl(var(--muted))',
      '--tw-prose-th-borders': 'hsl(var(--border))',
      '--tw-prose-td-borders': 'hsl(var(--border))',

      /* Autumn Soft specific overrides */
      'h1, h2, h3, h4': {
        fontFamily: 'var(--font-heading)',
        fontWeight: '700',
        color: 'hsl(var(--foreground))',
      },
      a: {
        color: 'hsl(var(--primary))',
        textDecoration: 'none',
        fontWeight: '500',
        '&:hover': {
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
        },
      },
      'code::before': { content: '""' },  /* Remove backtick decorations */
      'code::after': { content: '""' },
      code: {
        backgroundColor: 'hsl(var(--muted))',
        color: 'hsl(var(--foreground))',
        borderRadius: '0.5rem',            /* rounded-lg for warm feel */
        padding: '0.15em 0.4em',
        fontWeight: '400',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.875em',
      },
      pre: {
        backgroundColor: 'hsl(var(--muted))',
        color: 'hsl(var(--foreground))',
        borderRadius: '0.75rem',           /* rounded-xl */
        border: '1px solid hsl(var(--border))',
        padding: '1rem 1.25rem',
      },
      blockquote: {
        fontStyle: 'normal',               /* No italic — clash with CJK */
        color: 'hsl(var(--muted-foreground))',
        borderLeftColor: 'hsl(var(--border))',
        borderLeftWidth: '3px',
        paddingLeft: '1rem',
      },
      table: {
        fontSize: '0.875rem',
      },
      'thead th': {
        color: 'hsl(var(--foreground))',
        fontWeight: '600',
        borderBottomColor: 'hsl(var(--border))',
      },
      'tbody td': {
        borderBottomColor: 'hsl(var(--border))',
      },
      img: {
        borderRadius: '0.75rem',           /* rounded-xl for consistency */
      },
    },
  },
},
```

### Dark Mode Prose

The prose plugin automatically inherits from CSS custom properties (`--foreground`, `--muted`, etc.), so dark mode works via the `.dark` class without additional overrides. No `prose-invert` needed.

### Usage in Components

```tsx
{/* Event description rendered from markdown */}
<div className="prose prose-sm max-w-none">
  <ReactMarkdown>{event.description}</ReactMarkdown>
</div>

{/* Profile bio */}
<div className="prose prose-base max-w-prose">
  <ReactMarkdown>{member.bio}</ReactMarkdown>
</div>
```

---

## Composite Typography Patterns

Quick-reference for common text patterns across the site:

| Pattern | Classes | Font |
|---|---|---|
| Hero headline | `font-heading text-4xl sm:text-5xl xl:text-7xl font-extrabold tracking-tight` | Nunito |
| Page title | `font-heading text-2xl sm:text-3xl font-bold` | Nunito |
| Section heading | `font-heading text-xl sm:text-2xl font-semibold` | Nunito |
| Card title | `text-lg font-medium` | Zen Kaku |
| Body text | `text-base font-normal` | Zen Kaku |
| Helper / meta | `text-sm text-muted-foreground` | Zen Kaku |
| Caption / time | `text-xs text-muted-foreground` | Zen Kaku |
| Button label | `text-sm font-bold` | Zen Kaku |
| Badge text | `text-xs font-semibold` | Zen Kaku |
| Code inline | `font-mono text-sm` | JetBrains Mono |
| Numeric display | `font-heading tabular-nums` | Nunito |
