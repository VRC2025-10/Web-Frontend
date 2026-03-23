# Dropdown Menu Patterns

> Shadcn/ui DropdownMenu (Radix primitive) patterns for navigation and actions

---

## 1. Overview

| Item | Detail |
|---|---|
| **Purpose** | Provide contextual action menus triggered by icon buttons or avatars |
| **Base Component** | shadcn/ui DropdownMenu (wraps Radix DropdownMenu primitive) |
| **Component Type** | Client Component (interactive) |
| **When to Use** | User navigation menu, admin row-level actions, overflow menus |
| **When NOT to Use** | Form select inputs (use Select/Combobox), navigation (use Nav/Tabs), single-action buttons |

---

## 2. Props / API

### UserMenu Dropdown

| Name | Type | Default | Required | Description |
|---|---|---|---|---|
| `user` | `{ id: string; name: string; avatarUrl?: string; role: UserRole }` | — | Yes | Current user data for menu rendering |

### Admin Action Dropdown

| Name | Type | Default | Required | Description |
|---|---|---|---|---|
| `actions` | `ActionItem[]` | — | Yes | Array of action definitions |
| `onAction` | `(action: string, id: string) => void` | — | Yes | Handler when an action is selected |
| `entityId` | `string` | — | Yes | ID of the entity the dropdown acts on |

```ts
type ActionItem = {
  label: string;
  value: string;
  icon?: LucideIcon;
  variant?: "default" | "destructive";
  separator?: boolean;  // show separator before this item
};
```

---

## 3. Visual Structure

### UserMenu Dropdown

```
<DropdownMenu>
│
├─ <DropdownMenuTrigger asChild>
│  └─ <Button variant="ghost" className="relative w-9 h-9 rounded-full">
│       <Avatar className="w-9 h-9">
│         <AvatarImage src={user.avatarUrl} alt={user.name} />
│         <AvatarFallback className="rounded-full bg-primary/10 text-primary text-sm">
│           {user.name[0]}
│         </AvatarFallback>
│       </Avatar>
│     </Button>
│
└─ <DropdownMenuContent className="w-56 rounded-xl" align="end" sideOffset={8}>
   │
   ├─ <DropdownMenuLabel className="font-normal">
   │  ├─ <p className="text-sm font-medium">{user.name}</p>
   │  └─ <p className="text-xs text-muted-foreground">{user.role}</p>
   │
   ├─ <DropdownMenuSeparator />
   │
   ├─ <DropdownMenuItem asChild>
   │  └─ <Link href={`/members/${user.id}`}>
   │       <User className="mr-2 h-4 w-4" /> My Profile
   │     </Link>
   │
   ├─ <DropdownMenuItem asChild>
   │  └─ <Link href="/settings/profile">
   │       <Settings className="mr-2 h-4 w-4" /> Edit Profile
   │     </Link>
   │
   ├─ {(user.role === "admin" || user.role === "staff") && (
   │    <>
   │      <DropdownMenuItem asChild>
   │        <Link href="/admin">
   │          <Shield className="mr-2 h-4 w-4" /> Admin Panel
   │        </Link>
   │      </DropdownMenuItem>
   │    </>
   │  )}
   │
   ├─ <DropdownMenuSeparator />
   │
   └─ <DropdownMenuItem
        className="text-destructive focus:text-destructive"
        onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" /> Logout
      </DropdownMenuItem>
```

**Logout handler:** POST /api/v1/internal/auth/logout → clear session → redirect to `/`

### Admin Action Dropdown

```
<DropdownMenu>
│
├─ <DropdownMenuTrigger asChild>
│  └─ <Button variant="ghost" size="icon" className="w-8 h-8"
│             aria-label="Actions">
│       <MoreHorizontal className="w-4 h-4" />
│     </Button>
│
└─ <DropdownMenuContent className="w-48 rounded-xl" align="end">
   │
   ├─ {actions.map(action => (
   │    <>
   │      {action.separator && <DropdownMenuSeparator />}
   │      <DropdownMenuItem
   │        key={action.value}
   │        className={action.variant === "destructive" ? "text-destructive focus:text-destructive" : ""}
   │        onClick={() => onAction(action.value, entityId)}>
   │        {action.icon && <action.icon className="mr-2 h-4 w-4" />}
   │        {action.label}
   │      </DropdownMenuItem>
   │    </>
   │  ))}
```

### Context-Specific Admin Actions

#### User Management

| Action | Icon | Variant | Notes |
|---|---|---|---|
| View Profile | `Eye` | default | Navigate to profile |
| Change Role | `UserCog` | default | Opens role dialog |
| ---separator--- | | | |
| Suspend User | `Ban` | destructive | Opens confirmation dialog |

#### Report Management

| Action | Icon | Variant | Notes |
|---|---|---|---|
| View Details | `Eye` | default | Opens report detail |
| Resolve | `CheckCircle` | default | Mark as resolved |
| ---separator--- | | | |
| Dismiss | `XCircle` | destructive | Dismiss report |

---

## 4. Variant × State Matrix

### Menu States

| State | Visual | Behavior |
|---|---|---|
| Closed | Trigger button only | Click/Enter/Space to open |
| Opening | Fade + slide animation | Focus moves to first item |
| Open | Menu content visible | Arrow key navigation active |
| Item focused | `bg-accent` highlight | Visual focus indicator |
| Item clicked | Highlight flash | Action executed, menu closes |
| Closing | Reverse animation | Focus returns to trigger |

### Trigger Variants

| Context | Trigger | Size | Shape |
|---|---|---|---|
| UserMenu | Avatar | `w-9 h-9` | `rounded-full` |
| Admin table | MoreHorizontal icon | `w-8 h-8` | `rounded-lg` |

### Item Variants

| Variant | Text Color | Focus Color | Use |
|---|---|---|---|
| Default | `text-foreground` | `bg-accent` | Standard actions |
| Destructive | `text-destructive` | `bg-destructive/10` | Delete, suspend, logout |

---

## 5. Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| Mobile (`< md`) | Menu opens with same styling, may shift alignment to avoid viewport edge |
| Tablet (`md`) | Standard positioning: `align="end"` |
| Desktop (`lg+`) | Standard positioning |

### Mobile Adjustments

- Radix handles positioning automatically (collision detection)
- Menu may flip to opposite side if insufficient space
- Touch targets: menu items have minimum `h-10` for comfortable tapping
- No additional mobile-specific changes needed (Radix handles edge cases)

---

## 6. Accessibility

### ARIA (Managed by Radix)

- Trigger: `aria-haspopup="menu"`, `aria-expanded="true|false"`
- Menu container: `role="menu"`
- Menu items: `role="menuitem"`
- Separators: `role="separator"`
- Labels: `role="presentation"` (non-interactive)
- Admin trigger: `aria-label="Actions"` (since icon-only)
- User trigger: identified by avatar alt text

### Keyboard

- **Enter / Space**: Open menu (on trigger), activate item (on item)
- **Arrow Down**: Focus next item
- **Arrow Up**: Focus previous item
- **Home**: Focus first item
- **End**: Focus last item
- **Escape**: Close menu → focus to trigger
- **Type-ahead**: Type characters to jump to matching item (Radix built-in)

### Screen Reader

- Trigger announces: "User menu" or "Actions" (via aria-label)
- On open: menu role announced, first item focused
- Items announced: icon is decorative (`aria-hidden`), label text read
- Destructive items: no special ARIA (visual cue only — context makes intent clear)
- Separators: announced as separator by screen reader

### Focus Management

- On open: focus moves to first `menuitem`
- On close (Escape or backdrop click): focus returns to trigger
- On item activation: menu closes, focus returns to trigger, action executes

---

## 7. Animation

### Menu Open

```tsx
// shadcn/ui DropdownMenuContent includes animation via Tailwind:
// data-[state=open]:animate-in data-[state=closed]:animate-out
// data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
// data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
// data-[side=bottom]:slide-in-from-top-2
// data-[side=top]:slide-in-from-bottom-2
```

### Menu Close

```
Reverse of open: fade-out + zoom-out + slide
Duration: ~150ms
```

### Item Hover/Focus

```css
/* CSS transition for background color */
transition: background-color 0.1s ease;
```

### Reduced Motion

- Open/close: instant opacity change, no zoom/slide
- Item focus: instant highlight (no transition)

---

## 8. Dark Mode Changes

| Element | Light | Dark |
|---|---|---|
| Menu background | `bg-popover` (white) | `bg-popover` (dark surface) |
| Menu border | `border-border` | `border-border` (dark) |
| Menu shadow | `shadow-md` (warm) | `shadow-md` (darker) |
| Item text | `text-popover-foreground` | `text-popover-foreground` |
| Item hover bg | `bg-accent` (light warm) | `bg-accent` (dark accent) |
| Destructive text | `text-destructive` | `text-destructive` |
| Separator | `bg-border` | `bg-border` (dark) |
| Avatar fallback | `bg-primary/10 text-primary` | `bg-primary/10 text-primary` |

No structural changes — Radix + shadcn tokens handle dark mode automatically.
