# Navigation Pattern

> Version: 1.0 | Last updated: 2026-03-20

This document defines all navigation patterns, link behaviors, and routing conventions for the VRC community website.

---

## Table of Contents

- [Navigation Architecture](#navigation-architecture)
- [Primary Navigation (Public)](#primary-navigation-public)
- [Admin Navigation](#admin-navigation)
- [Back Navigation](#back-navigation)
- [Breadcrumbs](#breadcrumbs)
- [Active Link Indication](#active-link-indication)
- [Browser History Management](#browser-history-management)
- [Scroll Behavior](#scroll-behavior)
- [Deep Linking & Query Parameters](#deep-linking--query-parameters)
- [Skip Navigation](#skip-navigation)
- [Navigation Loading States](#navigation-loading-states)
- [Mobile Navigation](#mobile-navigation)
- [External Links](#external-links)
- [Route Map](#route-map)

---

## Navigation Architecture

```
┌─────────────────────────────────────────────────┐
│  Public Pages                                    │
│  ┌─────────────────────────────────────────────┐│
│  │ Header (desktop: horizontal links)          ││
│  │ Header (mobile: hamburger → Sheet)          ││
│  └─────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────┐│
│  │ Main Content                                ││
│  └─────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────┐│
│  │ Footer                                      ││
│  └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Admin Pages                                     │
│  ┌────────┐ ┌──────────────────────────────────┐│
│  │Sidebar │ │ Header (admin)                   ││
│  │(desktop)│ │ Main Content                    ││
│  │        │ │                                  ││
│  │ 7 items│ │                                  ││
│  └────────┘ └──────────────────────────────────┘│
│  (mobile: Sheet sidebar)                         │
└─────────────────────────────────────────────────┘
```

---

## Primary Navigation (Public)

### Desktop (≥ lg: 1024px)

Horizontal navigation in the Header with 4 main links:

| Link | Path | Label |
|---|---|---|
| Home | `/` | Home |
| Events | `/events` | Events |
| Members | `/members` | Members |
| Clubs | `/clubs` | Clubs |

Plus the **UserMenu** dropdown on the right side:
- Authenticated: Avatar + name → dropdown (Profile, Admin*, Logout)
- Unauthenticated: "Log in" button

```tsx
<header role="banner" className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div className="container flex h-16 items-center justify-between">
    {/* Logo */}
    <Link href="/" className="flex items-center gap-2">
      <Logo className="h-8 w-8" />
      <span className="font-bold text-lg">VRC Community</span>
    </Link>

    {/* Desktop Nav */}
    <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1">
      <NavLink href="/">Home</NavLink>
      <NavLink href="/events">Events</NavLink>
      <NavLink href="/members">Members</NavLink>
      <NavLink href="/clubs">Clubs</NavLink>
    </nav>

    {/* Right side */}
    <div className="flex items-center gap-2">
      <UserMenu />
      {/* Mobile hamburger (lg:hidden) */}
      <MobileNavTrigger className="lg:hidden" />
    </div>
  </div>
</header>
```

### Mobile (< lg: 1024px)

Hamburger icon button opens a **Sheet** (slide from right):

```tsx
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon" aria-label="Open menu" className="lg:hidden">
      <Menu className="h-5 w-5" />
    </Button>
  </SheetTrigger>
  <SheetContent side="right" className="w-72">
    <SheetHeader>
      <SheetTitle>Menu</SheetTitle>
    </SheetHeader>
    <nav aria-label="Mobile navigation" className="flex flex-col gap-1 mt-6">
      <MobileNavLink href="/" icon={Home}>Home</MobileNavLink>
      <MobileNavLink href="/events" icon={Calendar}>Events</MobileNavLink>
      <MobileNavLink href="/members" icon={Users}>Members</MobileNavLink>
      <MobileNavLink href="/clubs" icon={Building2}>Clubs</MobileNavLink>
    </nav>
    <Separator className="my-4" />
    {/* Auth section */}
    {isAuthenticated ? (
      <div className="flex flex-col gap-1">
        <MobileNavLink href="/profile" icon={User}>Profile</MobileNavLink>
        {isAdmin && <MobileNavLink href="/admin" icon={Shield}>Admin</MobileNavLink>}
        <Button variant="ghost" onClick={logout} className="justify-start">
          <LogOut className="mr-2 h-4 w-4" /> Log out
        </Button>
      </div>
    ) : (
      <Button asChild className="w-full">
        <Link href="/login">Log in</Link>
      </Button>
    )}
  </SheetContent>
</Sheet>
```

### Sheet Behavior

| Behavior | Implementation |
|---|---|
| Open trigger | Hamburger icon button |
| Close triggers | X button, Escape key, overlay click, link click |
| Focus trap | Automatic (Radix Sheet) |
| Focus return | To hamburger button on close |
| Close on navigation | Sheet closes when a nav link is clicked |
| Animation | 300ms slide from right |

---

## Admin Navigation

### Desktop Sidebar (≥ lg: 1024px)

Fixed sidebar with 7 navigation items:

| Icon | Label | Path |
|---|---|---|
| LayoutDashboard | Dashboard | `/admin` |
| Calendar | Events | `/admin/events` |
| Users | Members | `/admin/members` |
| Building2 | Clubs | `/admin/clubs` |
| Image | Galleries | `/admin/galleries` |
| AlertTriangle | Reports | `/admin/reports` |
| Settings | Settings | `/admin/settings` |

```tsx
<aside className="hidden lg:flex w-64 flex-col border-r bg-card min-h-screen sticky top-0">
  <div className="p-6">
    <Link href="/admin" className="flex items-center gap-2 font-bold text-lg">
      <Shield className="h-5 w-5" />
      Admin
    </Link>
  </div>
  <nav aria-label="Admin navigation" className="flex-1 px-3 space-y-1">
    <AdminNavLink href="/admin" icon={LayoutDashboard}>Dashboard</AdminNavLink>
    <AdminNavLink href="/admin/events" icon={Calendar}>Events</AdminNavLink>
    <AdminNavLink href="/admin/members" icon={Users}>Members</AdminNavLink>
    <AdminNavLink href="/admin/clubs" icon={Building2}>Clubs</AdminNavLink>
    <AdminNavLink href="/admin/galleries" icon={Image}>Galleries</AdminNavLink>
    <AdminNavLink href="/admin/reports" icon={AlertTriangle}>Reports</AdminNavLink>
    <AdminNavLink href="/admin/settings" icon={Settings}>Settings</AdminNavLink>
  </nav>
  <div className="p-4 border-t">
    <Button variant="ghost" asChild className="w-full justify-start">
      <Link href="/">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to site
      </Link>
    </Button>
  </div>
</aside>
```

### Mobile Admin (< lg: 1024px)

Admin sidebar becomes a Sheet (slide from left):

```tsx
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon" aria-label="Open admin menu" className="lg:hidden">
      <Menu className="h-5 w-5" />
    </Button>
  </SheetTrigger>
  <SheetContent side="left" className="w-64">
    <SheetHeader>
      <SheetTitle>Admin</SheetTitle>
    </SheetHeader>
    <nav aria-label="Admin navigation" className="flex flex-col gap-1 mt-6">
      {/* Same 7 items as desktop sidebar */}
    </nav>
  </SheetContent>
</Sheet>
```

---

## Back Navigation

### Pattern

A ghost button with left arrow is used for back navigation on detail/edit pages:

```tsx
<Button variant="ghost" asChild className="mb-4 -ml-2">
  <Link href={backUrl}>
    <ArrowLeft className="mr-2 h-4 w-4" />
    Back to {parentPageName}
  </Link>
</Button>
```

### Back Navigation Map

| Current Page | Back Target | Label |
|---|---|---|
| Event detail (`/events/[id]`) | `/events` | "Back to Events" |
| Event edit (`/admin/events/[id]/edit`) | `/admin/events` | "Back to Events" |
| Member detail (`/members/[id]`) | `/members` | "Back to Members" |
| Club detail (`/clubs/[id]`) | `/clubs` | "Back to Clubs" |
| Admin sub-pages | Parent admin section | "Back to {Section}" |
| Profile editor | `/` (or previous page) | "Back to Home" |

### Rules

- Always use explicit `href` — do NOT use `router.back()` as back target (unreliable if user arrives via external link).
- The back button is a `<Link>` styled as ghost button, not a browser-history-based action.
- Position: top-left of the page content, above the page heading.

---

## Breadcrumbs

**Breadcrumbs are NOT used** in this application.

### Rationale

- The site hierarchy is flat (max 2 levels deep).
- Back buttons provide sufficient navigation context.
- Breadcrumbs add visual clutter for minimal benefit in this information architecture.
- Admin pages use the sidebar for section context.

---

## Active Link Indication

### Desktop Nav Links

| State | Style |
|---|---|
| Default | `text-muted-foreground font-medium hover:text-foreground` |
| Active (current page) | `text-primary font-semibold` |

```tsx
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        'px-3 py-2 rounded-lg text-sm transition-colors',
        isActive
          ? 'text-primary font-semibold'
          : 'text-muted-foreground font-medium hover:text-foreground',
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}
```

### Admin Sidebar Links

| State | Style |
|---|---|
| Default | `text-muted-foreground hover:bg-accent hover:text-accent-foreground` |
| Active | `bg-accent text-accent-foreground font-semibold` |

### Mobile Nav Links

Same visual treatment as desktop, applied within the Sheet context.

### Matching Logic

- Home (`/`): exact match only.
- Other routes: `pathname.startsWith(href)` (e.g., `/events/123` activates "Events").
- Admin routes: `pathname.startsWith(href)` within the admin sidebar.

---

## Browser History Management

### Rules

| Action | History Behavior |
|---|---|
| Navigation via links | `router.push()` — adds to history stack |
| Filter/sort changes | `router.replace()` — replaces current entry (no back-stack pollution) |
| Pagination changes | `router.push()` — each page is a distinct history entry |
| Redirect after form submit | `router.replace()` — prevents re-submission on back |
| Auth redirect to login | `router.push('/login?returnUrl=...')` — preserves return path |
| Redirect after login | `router.replace(returnUrl)` — removes login from history |

### Implementation

```tsx
// Filter changes — replace URL, don't add history entry
function updateFilters(newFilters: Record<string, string>) {
  const params = new URLSearchParams(searchParams);
  Object.entries(newFilters).forEach(([key, value]) => {
    if (value) params.set(key, value);
    else params.delete(key);
  });
  router.replace(`${pathname}?${params.toString()}`);
}

// Pagination — push to allow back navigation between pages
function goToPage(page: number) {
  const params = new URLSearchParams(searchParams);
  params.set('page', String(page));
  router.push(`${pathname}?${params.toString()}`);
}
```

---

## Scroll Behavior

### Scroll to Top on Navigation

When navigating to a new page, scroll to the top:

```tsx
// Next.js App Router handles this automatically for route changes.
// For edge cases, enforce in layout:
// next.config.ts
export default {
  experimental: {
    scrollRestoration: true,
  },
};
```

### Scroll Behavior Rules

| Scenario | Scroll Behavior |
|---|---|
| Navigate to new page | Scroll to top |
| Browser back/forward | Restore previous scroll position |
| Filter/sort change (same page) | Stay at current position |
| Pagination change | Scroll to top of list section |
| Hash link (`#section`) | Smooth scroll to section |
| Open modal/sheet | No scroll change on background |

### Pagination Scroll

```tsx
function goToPage(page: number) {
  const params = new URLSearchParams(searchParams);
  params.set('page', String(page));
  router.push(`${pathname}?${params.toString()}`);
  // Scroll to top of list
  document.getElementById('list-section')?.scrollIntoView({ behavior: 'smooth' });
}
```

---

## Deep Linking & Query Parameters

All list pages support URL-based state for sharing and bookmarking:

### Parameter Convention

| Parameter | Type | Used On | Example |
|---|---|---|---|
| `status` | string enum | Events list | `?status=upcoming` |
| `tags` | comma-separated | Events list | `?tags=social,music` |
| `page` | number (1-based) | All list pages | `?page=2` |
| `sort` | string | Members, Events | `?sort=date-desc` |
| `q` | string | Members search | `?q=tanuki` |
| `role` | string enum | Members list | `?role=admin` |
| `tab` | string | Profile editor | `?tab=social` |

### Implementation Pattern

```tsx
// Read from URL
const searchParams = useSearchParams();
const status = searchParams.get('status') ?? 'upcoming';
const page = Number(searchParams.get('page') ?? '1');
const tags = searchParams.get('tags')?.split(',').filter(Boolean) ?? [];

// Write to URL (using replace to avoid history pollution)
function setFilter(key: string, value: string | null) {
  const params = new URLSearchParams(searchParams.toString());
  if (value) {
    params.set(key, value);
  } else {
    params.delete(key);
  }
  params.delete('page'); // Reset page when filters change
  router.replace(`${pathname}?${params.toString()}`);
}
```

### URL State Rules

- Default values are omitted from the URL (cleaner URLs).
- Changing a filter resets `page` to 1.
- All parameters are validated server-side; invalid values fall back to defaults.
- Parameters are read in Server Components via `searchParams` prop.

---

## Skip Navigation

A skip link is provided for keyboard users to bypass the header:

```tsx
// In the root layout, first element in <body>
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-xl focus:shadow-lg"
>
  Skip to main content
</a>

// The main element has the target id
<main id="main-content" tabIndex={-1}>
  {children}
</main>
```

### Skip Link Requirements

- Always the first focusable element on the page.
- Visually hidden until focused.
- Appears in the top-left corner when focused.
- Styled prominently (primary button style) so keyboard users can see it.
- Links to `#main-content` where `tabIndex={-1}` allows programmatic focus.

---

## Navigation Loading States

### Route-Level Loading

Next.js App Router `loading.tsx` files provide automatic loading states:

```tsx
// app/events/loading.tsx
export default function EventsLoading() {
  return (
    <div className="container py-8 space-y-6">
      <Skeleton className="h-8 w-48" /> {/* Page title */}
      <div className="flex gap-4">
        <Skeleton className="h-10 w-32" /> {/* Filter */}
        <Skeleton className="h-10 w-32" /> {/* Filter */}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
```

### Link Loading Indicator

For client-side navigation, use Next.js's built-in loading indication or a top progress bar:

```tsx
// Optional: NProgress-style bar for visual feedback
// Using next/navigation's useRouter and transition state
function NavigationProgress() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  // Show progress bar during route transitions
  return isNavigating ? (
    <div className="fixed top-0 left-0 right-0 z-[100] h-0.5 bg-primary animate-pulse" />
  ) : null;
}
```

---

## Mobile Navigation

### Bottom Navigation

**Bottom navigation is NOT used**.

### Rationale

- The Sheet (hamburger) menu is sufficient for the 4 public links + auth.
- Bottom navigation would compete with browser chrome on mobile.
- The site is PC-first; mobile is functional but not primary.
- Fewer persistent UI elements = simpler implementation.

### Mobile Navigation Summary

| Context | Navigation Method |
|---|---|
| Public pages | Header hamburger → Sheet (right) |
| Admin pages | Header hamburger → Sheet (left) |
| Back navigation | Ghost button at top of content |
| Between pages | Standard link taps |

---

## External Links

All external links follow these rules:

| Rule | Implementation |
|---|---|
| Open in new tab | `target="_blank"` |
| Security | `rel="noopener noreferrer"` |
| Accessibility | `aria-label` includes "opens in new tab" |
| Visual indicator | External link icon (optional, for body content links) |

```tsx
// External link component
function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${children} (opens in new tab)`}
      className="inline-flex items-center gap-1 text-primary hover:underline"
    >
      {children}
      <ExternalLinkIcon className="h-3 w-3" aria-hidden="true" />
    </a>
  );
}
```

### Where External Links Appear

- Member profiles: social media links (Twitter, GitHub, website)
- Event details: external event URLs
- Footer: legal/policy links (if hosted externally)

---

## Route Map

| Route | Page | Layout | Auth Required |
|---|---|---|---|
| `/` | Home | Public | No |
| `/events` | Events list | Public | No |
| `/events/[id]` | Event detail | Public | No |
| `/members` | Members list | Public | No |
| `/members/[id]` | Member detail | Public | No |
| `/clubs` | Clubs list | Public | No |
| `/clubs/[id]` | Club detail | Public | No |
| `/login` | Login | Minimal (no header nav) | No |
| `/profile` | Profile editor | Public | Yes |
| `/admin` | Admin dashboard | Admin (sidebar) | Yes (admin) |
| `/admin/events` | Events management | Admin | Yes (admin) |
| `/admin/events/new` | Create event | Admin | Yes (admin) |
| `/admin/events/[id]/edit` | Edit event | Admin | Yes (admin) |
| `/admin/members` | Members management | Admin | Yes (admin) |
| `/admin/members/[id]` | Member detail/edit | Admin | Yes (admin) |
| `/admin/clubs` | Clubs management | Admin | Yes (admin) |
| `/admin/clubs/new` | Create club | Admin | Yes (admin) |
| `/admin/clubs/[id]/edit` | Edit club | Admin | Yes (admin) |
| `/admin/galleries` | Galleries management | Admin | Yes (admin) |
| `/admin/galleries/[id]` | Gallery detail/edit | Admin | Yes (admin) |
| `/admin/reports` | Reports management | Admin | Yes (admin) |
| `/admin/settings` | Site settings | Admin | Yes (admin) |

---

## Cross-References

- [Accessibility Pattern](./accessibility.md) — keyboard navigation, skip links
- [Responsive Pattern](./responsive.md) — breakpoint-specific nav behavior
- [Error Handling Pattern](./error-handling.md) — 404 handling
- [Header Component](../03-components/layout/header.md)
- [Sidebar Component](../03-components/layout/sidebar.md)
- [Routing Spec](../ui/routing.md)
- [Page Specifications](../04-pages/)
