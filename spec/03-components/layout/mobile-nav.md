# MobileNav (Sheet) Component

## Overview

| Item | Detail |
|---|---|
| **Purpose** | Off-canvas mobile navigation drawer containing all nav links, toggles, and user actions |
| **File path** | `components/layout/mobile-nav.tsx` |
| **Component type** | Client Component (`"use client"`) |
| **When to use** | Displayed below `lg` breakpoint when the hamburger icon in the Header is tapped |
| **When NOT to use** | Desktop viewport (≥ lg). Admin layout (admin uses AdminSidebar). |

---

## Props / API

| Prop | Type | Default | Required | Description |
|---|---|---|---|---|
| `user` | `User \| null` | `null` | No | Current authenticated user. `null` = logged out. |
| `locale` | `"ja" \| "en"` | `"ja"` | No | Current UI locale. |
| `open` | `boolean` | `false` | Yes | Controlled open state from parent Header. |
| `onOpenChange` | `(open: boolean) => void` | — | Yes | Callback when open state should change. |

---

## Visual Structure

```
<Sheet open={open} onOpenChange={onOpenChange}>

  <SheetTrigger asChild>                         ← rendered in Header, not here
    <Button variant="ghost" size="icon"
            className="lg:hidden"
            aria-label="Open menu">
      <Menu className="w-5 h-5" />
    </Button>
  </SheetTrigger>

  <SheetContent side="right"                     ← w-80 bg-background
                className="w-80 flex flex-col">

    <!-- Header -->
    <SheetHeader>                                ← px-2
      <Link href="/" onClick={close}>
        <LogoMark />                                w-8 h-8
        <span>October Cohort</span>                 font-bold text-lg
      </Link>
    </SheetHeader>

    <!-- Navigation Links -->
    <nav aria-label="Mobile navigation"          ← flex flex-col gap-1 mt-8
         className="flex flex-col gap-1 mt-8">
      <NavLink href="/" icon={Home}>
        Home                                        px-3 py-2.5 rounded-xl text-base
      </NavLink>                                    font-medium transition-colors
      <NavLink href="/events" icon={Calendar}>
        Events                                      Active: bg-primary/10 text-primary
      </NavLink>
      <NavLink href="/members" icon={Users}>
        Members
      </NavLink>
      <NavLink href="/clubs" icon={Building2}>
        Clubs
      </NavLink>
    </nav>

    <Separator className="my-6" />

    <!-- Toggles -->
    <div className="flex flex-col gap-2">        ← px-1
      <ThemeToggle variant="full-width" />          flex items-center justify-between
                                                     px-3 py-2.5 rounded-xl
      <LanguageSwitcher variant="full-width" />     Same layout
    </div>

    <Separator className="my-6" />

    <!-- User Section -->
    <div className="mt-auto px-1">
      <!-- Logged in -->
      <div className="flex items-center gap-3 px-3 py-2.5">
        <Avatar className="w-10 h-10">
          <AvatarImage />
          <AvatarFallback />
        </Avatar>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>
      <div className="flex flex-col gap-1 mt-2">
        <NavLink href="/profile">Profile</NavLink>
        <NavLink href="/settings">Settings</NavLink>
        <NavLink href="/admin"                      Only if staff/admin role
                 icon={Shield}>Admin</NavLink>
        <button onClick={logout}                    text-destructive
                className="...">Log out</button>
      </div>

      <!-- OR Logged out -->
      <Link href="/login"                        ← w-full
            className="...">
        <Button className="w-full">Log in</Button>
      </Link>
    </div>

  </SheetContent>
</Sheet>
```

---

## Variant × State Matrix

### NavLink States

| State | Classes |
|---|---|
| **Default** | `text-foreground/70 hover:bg-accent/10 hover:text-foreground` |
| **Active (current route)** | `bg-primary/10 text-primary font-medium` |
| **Focus-visible** | `ring-2 ring-primary ring-offset-2 outline-none` |

### Auth States

| Auth State | Role | User Section |
|---|---|---|
| **Logged out** | — | Full-width "Log in" button |
| **Logged in** | `member` | Avatar + name + Profile, Settings, Logout |
| **Logged in** | `staff` / `admin` | Same + Admin link |

### Sheet States

| State | Behavior |
|---|---|
| **Closed** | Not rendered in DOM (Radix unmounts) |
| **Opening** | Slide in from right + overlay fade in |
| **Open** | Fully visible, focus trapped, body scroll locked |
| **Closing** | Slide out to right + overlay fade out |

---

## Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| **< lg** (< 1024px) | MobileNav is available. Trigger button visible in Header. |
| **≥ lg** (1024px+) | MobileNav is not rendered. Trigger button hidden (`lg:hidden`). |

Sheet width is fixed at `w-80` (320px) across all mobile breakpoints.

---

## Accessibility

### Focus Management

- **Focus trap**: Radix Sheet automatically traps focus within SheetContent when open
- **Initial focus**: First focusable element inside SheetContent (Logo link)
- **Close → return focus**: Focus returns to SheetTrigger button on close
- **Body scroll lock**: Radix locks body scroll when Sheet is open

### ARIA

| Element | Attribute |
|---|---|
| SheetTrigger | `aria-label="Open menu"`, `aria-expanded={open}`, `aria-controls="mobile-nav"` |
| SheetContent | `role="dialog"`, `aria-label="Mobile navigation menu"` |
| `<nav>` | `aria-label="Mobile navigation"` |
| Active link | `aria-current="page"` |
| Close button | Auto-provided by Radix `SheetClose` (`aria-label="Close"`) |

### Keyboard Interaction

| Key | Behavior |
|---|---|
| `Tab` | Cycles through focusable elements within the Sheet (trapped) |
| `Shift+Tab` | Reverse tab through focusable elements |
| `Escape` | Closes the Sheet, returns focus to trigger |
| `Enter` / `Space` | Activates focused link/button; navigates and closes Sheet |

---

## Animation

### Sheet Slide-In

```ts
// Framer Motion spring animation for SheetContent
const sheetVariants = {
  hidden: {
    x: "100%",
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
};
```

### Overlay Fade

```ts
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};
```

### NavLink Tap

```ts
// Subtle press feedback
<motion.div whileTap={{ scale: 0.98 }} transition={{ duration: 0.1 }}>
```

> Note: If using Radix Sheet's built-in CSS animations, the above Framer Motion config serves as reference for matching behavior. Implementation may use either approach.

---

## Dark Mode

| Element | Light | Dark |
|---|---|---|
| Sheet background | `bg-background` | Same (token adapts) |
| Overlay | `bg-black/50` | `bg-black/60` (slightly more opaque) |
| NavLink active | `bg-primary/10` | Same |
| Separator | `bg-border` | Same (token adapts) |

---

## Route Change Behavior

When a NavLink is clicked:
1. Sheet closes via `onOpenChange(false)`
2. Navigation proceeds to the target route
3. Focus returns to the trigger button in the header

Navigation and close should happen simultaneously — do not wait for Sheet close animation before navigating.

---

## Related Components

- [Header](header.md) — parent component that renders the trigger
- [Footer](footer.md) — page bottom navigation
- [AdminSidebar](admin-sidebar.md) — admin-specific navigation (different layout)
- [ThemeToggle](../shared/theme-toggle.md) — embedded in toggles section
- [LanguageSwitcher](../shared/language-switcher.md) — embedded in toggles section
