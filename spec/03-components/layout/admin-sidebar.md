# AdminSidebar Component

## Overview

| Item | Detail |
|---|---|
| **Purpose** | Persistent left-side navigation for the admin dashboard |
| **File path** | `components/layout/admin-sidebar.tsx` |
| **Component type** | Client Component (`"use client"`) |
| **When to use** | Rendered in the admin layout (`app/(admin)/layout.tsx`) for all `/admin/*` routes |
| **When NOT to use** | Public pages (use Header + MobileNav instead) |

---

## Props / API

| Prop | Type | Default | Required | Description |
|---|---|---|---|---|
| `userRole` | `"staff" \| "admin"` | — | Yes | Current user's role. Determines which menu items are visible. |

---

## Visual Structure

```
<!-- Desktop: persistent sidebar -->
<!-- Mobile: Sheet triggered from admin header -->

<Sidebar                                         ← shadcn/ui Sidebar component
  className="w-64 border-r border-border bg-background">

  <!-- Sidebar Header -->
  <SidebarHeader className="p-4">
    <Link href="/admin"
          className="flex items-center gap-2">
      <Shield className="w-5 h-5 text-primary" />
      <span className="font-bold">Admin</span>      text-lg
    </Link>
  </SidebarHeader>

  <Separator />

  <!-- Sidebar Content -->
  <SidebarContent className="px-2 py-4">
    <SidebarGroup>
      <SidebarGroupLabel>                        ← text-xs text-muted-foreground uppercase
        Management                                  tracking-wider px-3 mb-2
      </SidebarGroupLabel>
      <SidebarMenu>

        <SidebarMenuItem>                        ← (repeated for each menu item)
          <SidebarMenuButton asChild
            isActive={pathname === "/admin"}
            className="...">
            <Link href="/admin">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <!-- ... more items ... -->

      </SidebarMenu>
    </SidebarGroup>
  </SidebarContent>

  <!-- Sidebar Footer -->
  <SidebarFooter className="p-4 border-t border-border">
    <Link href="/"                               ← text-sm text-muted-foreground
          className="flex items-center gap-2        hover:text-foreground transition-colors
                     text-sm text-muted-foreground">
      <ArrowLeft className="w-4 h-4" />
      Back to site
    </Link>
  </SidebarFooter>

</Sidebar>
```

---

## Menu Items

| Icon | Label | Path | Required Role | Description |
|---|---|---|---|---|
| `LayoutDashboard` | Dashboard | `/admin` | `staff+` | Overview stats and quick actions |
| `Users` | User Management | `/admin/users` | `admin` | View/edit/ban users, change roles |
| `Image` | Gallery Management | `/admin/galleries` | `staff+` | Moderate uploaded images |
| `Calendar` | Event Management | `/admin/events` | `admin` | Create/edit/delete events |
| `Tag` | Event Tag Management | `/admin/tags` | `admin` | Manage event tag taxonomy |
| `Flag` | Report Management | `/admin/reports` | `admin` | Handle user reports |
| `Building2` | Club Management | `/admin/clubs` | `admin` | Manage clubs |

### Role-Based Filtering

```ts
const menuItems = allMenuItems.filter((item) => {
  if (item.requiredRole === "admin") return userRole === "admin";
  if (item.requiredRole === "staff") return userRole === "staff" || userRole === "admin";
  return true;
});
```

Items that don't match the user's role are **hidden** (not rendered), not disabled.

---

## Variant × State Matrix

### Menu Item States

| State | Classes |
|---|---|
| **Default** | `text-foreground/70 hover:bg-accent/10 hover:text-foreground rounded-lg px-3 py-2` |
| **Hover** | `bg-accent/10 text-foreground` |
| **Active (current route)** | `bg-primary/10 text-primary font-medium border-l-2 border-primary` |
| **Focus-visible** | `ring-2 ring-primary ring-offset-2 outline-none` |

### Sidebar Mode

| Mode | Viewport | Behavior |
|---|---|---|
| **Persistent** | ≥ lg (1024px+) | Always visible, `w-64`, pushes content |
| **Sheet** | < lg | Hidden by default. Opened via admin header hamburger button. Sheet from left side. |

---

## Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| **< lg** (< 1024px) | Sidebar hidden. Sheet trigger visible in admin header. Sheet slides from left (`side="left"`). |
| **≥ lg** (1024px+) | Sidebar persistent, `w-64`. Main content offset by sidebar width. |

### Mobile Sheet Configuration

```
<Sheet>
  <SheetTrigger asChild>                         ← in admin header, lg:hidden
    <Button variant="ghost" size="icon"
            aria-label="Open admin menu">
      <Menu className="w-5 h-5" />
    </Button>
  </SheetTrigger>
  <SheetContent side="left" className="w-64 p-0">
    <!-- Same Sidebar content rendered inside Sheet -->
  </SheetContent>
</Sheet>
```

---

## Accessibility

### ARIA

| Element | Attribute |
|---|---|
| Sidebar `<nav>` | `aria-label="Admin navigation"` |
| SidebarGroupLabel | `id="sidebar-group-management"` (referenced by `aria-labelledby` on the group) |
| Active item | `aria-current="page"` |
| Sheet trigger | `aria-label="Open admin menu"`, `aria-expanded` |

### Keyboard Interaction

| Key | Behavior |
|---|---|
| `Tab` | Moves through sidebar items top-to-bottom |
| `Arrow Down` | Next menu item |
| `Arrow Up` | Previous menu item |
| `Enter` | Navigates to the item's route |
| `Escape` | Closes Sheet (mobile only) |
| `Home` | First menu item |
| `End` | Last menu item |

### Screen Reader

- Group label "Management" announced before group items
- Active item: "Dashboard, current page" via `aria-current="page"`
- Filtered items: not rendered, so no confusion about disabled vs hidden

---

## Animation

### Menu Item Hover

```ts
// CSS transition
className="transition-colors duration-150"
```

### Active Indicator

```ts
// Left border with Framer Motion layout animation
<motion.div
  layoutId="admin-sidebar-active"
  className="absolute left-0 w-0.5 h-6 bg-primary rounded-full"
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
/>
```

### Mobile Sheet

```ts
// Sheet slide from left
const sheetVariants = {
  hidden: { x: "-100%" },
  visible: {
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },
  exit: {
    x: "-100%",
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
};
```

---

## Dark Mode

| Element | Light | Dark |
|---|---|---|
| Sidebar bg | `bg-background` | Same (token adapts) |
| Border | `border-border` | Same |
| Active item bg | `bg-primary/10` | Same |
| Group label | `text-muted-foreground` | Same |
| Footer link | `text-muted-foreground` | Same |

No special dark-mode overrides — semantic tokens handle the switch.

---

## Related Components

- [Header](header.md) — public site header (not used in admin layout)
- [MobileNav](mobile-nav.md) — public mobile nav (not used in admin layout)
- [StatCard](../data-display/stat-card.md) — admin dashboard cards
- [AdminDataTable](../data-display/data-table.md) — admin data tables
