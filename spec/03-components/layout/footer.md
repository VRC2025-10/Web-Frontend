# Footer Component

## Overview

| Item | Detail |
|---|---|
| **Purpose** | Site-wide footer with logo, social links, language switcher, and copyright |
| **File path** | `components/layout/footer.tsx` |
| **Component type** | Server Component |
| **When to use** | Rendered on every public page via root layout |
| **When NOT to use** | Admin layout (admin has its own minimal footer or none) |

---

## Props / API

| Prop | Type | Default | Required | Description |
|---|---|---|---|---|
| `locale` | `"ja" \| "en"` | `"ja"` | No | Current UI locale, passed for LanguageSwitcher initial state |

> Footer is a Server Component. The LanguageSwitcher inside it is a Client Component island.

---

## Visual Structure

```
<footer>                                          ← bg-muted/50 border-t border-border mt-auto
  <div>                                           ← max-w-7xl mx-auto px-4 py-12

    <!-- Top Row -->
    <div>                                         ← flex flex-col md:flex-row justify-between
                                                     items-center gap-6
      <!-- Logo -->
      <Link href="/">                             ← flex items-center gap-2 text-muted-foreground
        <LogoMark />                                 w-6 h-6 opacity-70
        <span>October Cohort</span>                  text-sm font-medium
      </Link>

      <!-- Social Links -->
      <div>                                       ← flex items-center gap-6
        <a href="https://discord.gg/..."          ← text-muted-foreground hover:text-foreground
           target="_blank"                           transition-colors
           rel="noopener noreferrer"
           aria-label="Discord (opens in new tab)">
          <DiscordIcon />                            w-5 h-5 (custom SVG or lucide MessageCircle)
        </a>
        <a href="https://x.com/..."               ← text-muted-foreground hover:text-foreground
           target="_blank"                           transition-colors
           rel="noopener noreferrer"
           aria-label="X / Twitter (opens in new tab)">
          <TwitterIcon />                            w-5 h-5 (custom SVG or lucide Twitter)
        </a>
      </div>

      <!-- Language Switcher (Client Island) -->
      <LanguageSwitcher locale={locale} />        ← Button variant="ghost" size="sm"
    </div>

    <!-- Bottom Row -->
    <div>                                         ← text-center text-muted-foreground text-sm mt-8
      © 2026 VRChat October Cohort
    </div>

  </div>
</footer>
```

---

## Variant × State Matrix

### Link States

| State | Classes |
|---|---|
| **Default** | `text-muted-foreground` |
| **Hover** | `text-foreground` |
| **Focus-visible** | `ring-2 ring-primary ring-offset-2 outline-none rounded-sm` |
| **Active** | `text-foreground` |

### Footer Appearance

| Variant | Description |
|---|---|
| **Standard** | Shown on all public pages. Full layout as described. |

> Footer has no complex variant matrix — it is static content.

---

## Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| **< md** (< 768px) | Top row stacks vertically: Logo → Social links → LanguageSwitcher. All items centered. `flex-col items-center gap-6`. |
| **≥ md** (768px+) | Top row is horizontal: Logo left, Social center, LanguageSwitcher right. `flex-row justify-between`. |

---

## Accessibility

### Roles & Landmarks

- `<footer>` — implicit `role="contentinfo"` (no explicit attribute needed)

### External Links

| Link | `aria-label` | Attributes |
|---|---|---|
| Discord | `"Discord (opens in new tab)"` | `target="_blank" rel="noopener noreferrer"` |
| X / Twitter | `"X / Twitter (opens in new tab)"` | `target="_blank" rel="noopener noreferrer"` |

### Keyboard Interaction

| Key | Behavior |
|---|---|
| `Tab` | Moves focus through: Logo link → Discord → Twitter → LanguageSwitcher |
| `Enter` | Activates focused link/button |

### Screen Reader

- Social links: `aria-label` provides context since only icons are visible
- Copyright text: read naturally as text content

---

## Animation

No Framer Motion animations in the footer. CSS transitions only:

```
// Link hover
className="transition-colors duration-150"
```

---

## Dark Mode

| Element | Light | Dark |
|---|---|---|
| Background | `bg-muted/50` | `bg-muted/50` (muted token adapts) |
| Border | `border-border` | Same (border token adapts) |
| Text | `text-muted-foreground` | Same (token adapts) |
| Link hover | `text-foreground` | Same (token adapts) |

No special dark-mode overrides needed — semantic color tokens handle the switch.

---

## Related Components

- [Header](header.md) — top navigation
- [LanguageSwitcher](../shared/language-switcher.md) — embedded Client Component island
