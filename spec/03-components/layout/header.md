# Header Component

## Overview

| Item | Detail |
|---|---|
| **Purpose** | Primary site navigation bar — provides logo, main nav links, theme/language toggles, user menu |
| **File path** | `components/layout/header.tsx` |
| **Component type** | Client Component (`"use client"`) |
| **When to use** | Rendered on every public page via root layout |
| **When NOT to use** | Admin layout (admin has its own header + sidebar) |

---

## Props / API

| Prop | Type | Default | Required | Description |
|---|---|---|---|---|
| `user` | `User \| null` | `null` | No | Current authenticated user object. `null` = logged out. |
| `locale` | `"ja" \| "en"` | `"ja"` | No | Current UI locale for language switcher state. |

> The Header is rendered in the root layout and receives `user` from the server-side session check. All other data (scroll state, theme) is derived from client-side hooks.

---

## Visual Structure

```
<header>                                          ← sticky top-0 z-40 border-b border-border/50
                                                     transition-colors duration-300
  <!-- Skip link (visually hidden until focused) -->
  <a href="#main-content"                         ← sr-only focus:not-sr-only focus:absolute
     className="...">                                focus:top-2 focus:left-2 focus:z-50
    Skip to content                                  focus:bg-background focus:px-4 focus:py-2
  </a>                                               focus:rounded-lg focus:shadow-md

  <div>                                           ← max-w-7xl mx-auto px-4 h-16
                                                     flex items-center justify-between
    <!-- Left: Logo -->
    <Link href="/">                               ← flex items-center gap-2
      <LogoMark />                                   w-8 h-8
      <span>October Cohort</span>                    font-bold text-lg hidden sm:inline
    </Link>

    <!-- Center: Desktop Nav -->
    <nav aria-label="Main navigation">            ← hidden lg:flex items-center gap-1
      <NavLink href="/">Home</NavLink>               px-3 py-2 rounded-lg text-sm font-medium
      <NavLink href="/events">Events</NavLink>       hover:bg-accent/10 transition-colors
      <NavLink href="/members">Members</NavLink>     active: bg-primary/10 text-primary
      <NavLink href="/clubs">Clubs</NavLink>
    </nav>

    <!-- Right: Actions -->
    <div>                                         ← flex items-center gap-2
      <ThemeToggle />                                Button variant="ghost" size="icon"
      <LanguageSwitcher />                           Button variant="ghost" size="sm"
      <!-- Logged in: -->
      <UserMenu user={user} />                       DropdownMenu with Avatar trigger
      <!-- Logged out: -->
      <Link href="/login">Log in</Link>              text-sm font-medium hover:text-primary

      <!-- Mobile only: -->
      <MobileMenuTrigger />                       ← lg:hidden Button variant="ghost" size="icon"
    </div>                                           Menu icon (hamburger)
  </div>
</header>
```

---

## Variant × State Matrix

### Scroll State

| State | Background | Border | Shadow | Transition |
|---|---|---|---|---|
| **At top** (`scrollY = 0`) | `bg-transparent` | `border-transparent` | none | `transition-colors duration-300` |
| **Scrolled** (`scrollY > 0`) | `bg-background/80 backdrop-blur-md` | `border-border/50` | `shadow-sm` | `transition-colors duration-300` |

### Auth × Role State

| Auth State | Role | Left | Center | Right |
|---|---|---|---|---|
| **Logged out** | — | Logo | Nav links | ThemeToggle, LangSwitcher, **LoginButton** |
| **Logged in** | `member` | Logo | Nav links | ThemeToggle, LangSwitcher, **UserMenu** (Profile, Settings, Logout) |
| **Logged in** | `staff` | Logo | Nav links | ThemeToggle, LangSwitcher, **UserMenu** (+Admin link) |
| **Logged in** | `admin` | Logo | Nav links | ThemeToggle, LangSwitcher, **UserMenu** (+Admin link) |

### NavLink States

| State | Classes |
|---|---|
| **Default** | `text-foreground/70 hover:text-foreground` |
| **Hover** | `bg-accent/10 text-foreground` |
| **Active (current page)** | `bg-primary/10 text-primary font-medium` |
| **Focus-visible** | `ring-2 ring-primary ring-offset-2 outline-none` |

### ThemeToggle States

| State | Icon | aria-label |
|---|---|---|
| **Light mode** | `Moon` | `"Switch to dark mode"` |
| **Dark mode** | `Sun` | `"Switch to light mode"` |

### LanguageSwitcher States

| State | Label | aria-label |
|---|---|---|
| **Japanese active** | `EN` | `"Switch to English"` |
| **English active** | `JA` | `"Switch to Japanese"` |

---

## Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| **< sm** (< 640px) | Logo mark only (text hidden). MobileMenuTrigger visible. DesktopNav hidden. |
| **sm – lg** (640–1023px) | Logo mark + text. MobileMenuTrigger visible. DesktopNav hidden. |
| **≥ lg** (1024px+) | Full layout. DesktopNav visible. MobileMenuTrigger hidden. |

---

## Accessibility

### Roles & Landmarks

- `<header>` — implicit `role="banner"` (no explicit role needed)
- `<nav aria-label="Main navigation">` wrapping DesktopNav
- Skip link: `<a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to content</a>` as the very first focusable element inside `<header>`

### Interactive Elements

| Element | Semantics | Notes |
|---|---|---|
| Nav links | `<Link>` (renders `<a>`) | Native keyboard focusable |
| ThemeToggle | `<button aria-label="...">` | Label changes based on current theme |
| LanguageSwitcher | `<button aria-label="...">` | Label changes based on current locale |
| UserMenu trigger | `<button>` with Avatar | Radix DropdownMenu manages disclosure |
| MobileMenuTrigger | `<button aria-label="Open menu">` | Opens Sheet component |
| LoginButton | `<Link>` (renders `<a>`) | Standard link behavior |

### Keyboard Interaction

| Key | Behavior |
|---|---|
| `Tab` | Moves focus through: Skip link → Logo → Nav links → ThemeToggle → LangSwitcher → UserMenu/Login → MobileMenu trigger |
| `Enter` / `Space` | Activates focused element |
| `Escape` | Closes UserMenu dropdown (if open) |
| `Arrow Down/Up` | Navigates within open DropdownMenu |

No focus traps in the header. Focus management is linear tab order.

### Screen Reader

- Current page link: `aria-current="page"` on active NavLink
- External links: none in header (all internal)
- UserMenu dropdown: Radix announces expanded/collapsed state

---

## Animation

### Scroll Transition

```ts
// CSS transition (no Framer Motion needed for bg change)
className="transition-colors duration-300"
```

### UserMenu Dropdown

```ts
// Radix DropdownMenu handles its own animation
// Optional Framer Motion enhancement:
const dropdownVariants = {
  hidden: { opacity: 0, y: -4, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};
```

### NavLink Hover

```ts
// CSS transition on background/color
className="transition-colors duration-150"
```

---

## Dark Mode

| Element | Light | Dark |
|---|---|---|
| Header bg (scrolled) | `bg-background/80` | `bg-background/80` (dark background) |
| Backdrop blur | `backdrop-blur-md` | Same |
| Border | `border-border/50` | Same (border token adapts) |
| NavLink active bg | `bg-primary/10` | Same (primary token adapts) |

No special dark-mode overrides needed — semantic color tokens handle the switch.

---

## Scroll Detection Implementation

```ts
const [isScrolled, setIsScrolled] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 0);
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
```

---

## Related Components

- [MobileNav (Sheet)](mobile-nav.md) — mobile navigation drawer triggered from header
- [Footer](footer.md) — bottom page navigation
- [AdminSidebar](admin-sidebar.md) — admin-specific navigation (separate layout)
- [ThemeToggle](../shared/theme-toggle.md)
- [LanguageSwitcher](../shared/language-switcher.md)
