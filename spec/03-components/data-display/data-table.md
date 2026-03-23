# AdminDataTable Component

## Overview

| Item | Detail |
|---|---|
| **Purpose** | Generic, reusable data table for admin CRUD views with sorting, filtering, pagination, and row selection |
| **File path** | `components/features/admin/data-table.tsx` |
| **Component type** | Client Component (`"use client"`) — interactive sorting, filtering, pagination |
| **When to use** | All admin management pages: users, events, reports, galleries, clubs, tags |
| **When NOT to use** | Public-facing data display (use card grids). Simple lists without sorting/filtering. |

---

## Props / API

| Prop | Type | Default | Required | Description |
|---|---|---|---|---|
| `columns` | `ColumnDef<TData, TValue>[]` | — | Yes | @tanstack/react-table column definitions |
| `data` | `TData[]` | — | Yes | Array of row data |
| `searchKey` | `string` | — | No | Column key to use for the global search input |
| `searchPlaceholder` | `string` | `"Search..."` | No | Placeholder text for the search input |
| `pageSize` | `number` | `10` | No | Number of rows per page |
| `onRowClick` | `(row: TData) => void` | — | No | Callback when a row is clicked |
| `enableSelection` | `boolean` | `false` | No | Show row selection checkboxes |
| `enableColumnVisibility` | `boolean` | `true` | No | Show column visibility toggle |

### Generic Type

```ts
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  pageSize?: number;
  onRowClick?: (row: TData) => void;
  enableSelection?: boolean;
  enableColumnVisibility?: boolean;
}
```

---

## Visual Structure

```
<div className="space-y-4">

  <!-- Toolbar -->
  <div className="flex items-center justify-between  ← gap-2
                  gap-2">

    <!-- Search -->
    {searchKey && (
      <div className="relative max-w-sm">
        <Search className="absolute left-3              w-4 h-4 text-muted-foreground
                           top-1/2 -translate-y-1/2" />
        <Input
          placeholder={searchPlaceholder}             ← pl-9 h-9 rounded-lg
          value={filterValue}                            bg-background
          onChange={...}
          className="pl-9 h-9"
        />
      </div>
    )}

    <!-- Column Visibility Toggle -->
    {enableColumnVisibility && (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline"                  ← ml-auto h-9 text-sm
                  size="sm"
                  className="ml-auto">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Columns
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {table.getAllColumns()
            .filter(col => col.getCanHide())
            .map(col => (
              <DropdownMenuCheckboxItem              ← capitalize
                checked={col.getIsVisible()}
                onCheckedChange={col.toggleVisibility}>
                {col.id}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )}
  </div>

  <!-- Table -->
  <div className="rounded-xl border                 ← overflow-hidden
                  overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          {enableSelection && (
            <TableHead className="w-12">
              <Checkbox                              ← aria-label="Select all"
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={table.toggleAllPageRowsSelected}
                aria-label="Select all"
              />
            </TableHead>
          )}
          {headerGroups.map(header => (
            <TableHead>
              {header.column.getCanSort() ? (
                <Button variant="ghost"              ← -ml-3 h-8 text-xs font-medium
                        size="sm"                       uppercase tracking-wider
                        onClick={header.column.toggleSorting}
                        className="...">
                  {header.label}
                  <ArrowUpDown className="ml-1.5 w-3.5 h-3.5" />
                </Button>
              ) : (
                header.label                         ← text-xs font-medium uppercase
              )}                                        tracking-wider
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {rows.length > 0 ? (
          rows.map(row => (
            <TableRow                                ← hover:bg-muted/50
              className="hover:bg-muted/50              data-[state=selected]:bg-muted
                         data-[state=selected]:bg-muted
                         cursor-pointer transition-colors"
              onClick={() => onRowClick?.(row.original)}
            >
              {enableSelection && (
                <TableCell>
                  <Checkbox                          ← aria-label="Select row"
                    checked={row.getIsSelected()}
                    onCheckedChange={row.toggleSelected}
                    aria-label="Select row"
                  />
                </TableCell>
              )}
              {row.getVisibleCells().map(cell => (
                <TableCell className="py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <!-- Empty State -->
          <TableRow>
            <TableCell
              colSpan={columns.length}               ← text-center py-12
              className="text-center py-12              text-muted-foreground
                         text-muted-foreground">
              No results found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>

  <!-- Pagination -->
  <div className="flex items-center justify-between  ← px-2
                  px-2">

    <!-- Selection Count (if enabled) -->
    {enableSelection && (
      <p className="text-sm text-muted-foreground">
        {selectedCount} of {totalCount} row(s) selected
      </p>
    )}

    <!-- Page Info -->
    <p className="text-sm text-muted-foreground       ← ml-auto (if no selection count)
                  {!enableSelection && 'ml-0'}">
      Page {currentPage} of {totalPages}
    </p>

    <!-- Page Controls -->
    <div className="flex items-center gap-2 ml-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
        aria-label="Go to previous page"
        className="h-8 px-3">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
        aria-label="Go to next page"
        className="h-8 px-3">
        Next
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  </div>

</div>
```

---

## Variant × State Matrix

### Table Row States

| State | Classes | Notes |
|---|---|---|
| **Default** | `bg-background` | Standard row |
| **Hover** | `bg-muted/50` | Subtle highlight |
| **Selected** | `bg-muted` | Checkbox checked, `data-[state=selected]:bg-muted` |
| **Focus-within** | Standard focus styles | When checkbox or link inside is focused |

### Sort Header States

| State | Icon | `aria-sort` |
|---|---|---|
| **Unsorted** | `ArrowUpDown` (neutral) | `"none"` |
| **Ascending** | `ArrowUp` | `"ascending"` |
| **Descending** | `ArrowDown` | `"descending"` |

### Pagination Button States

| State | Classes |
|---|---|
| **Default** | `variant="outline" size="sm"` |
| **Hover** | Standard outline hover |
| **Disabled** | `opacity-50 cursor-not-allowed` |

### Table States

| State | Display |
|---|---|
| **With data** | Normal rows |
| **Empty** | "No results found" centered message |
| **Loading** | Skeleton rows (5 rows of Skeleton cells) |

### Loading Skeleton

```
<div className="rounded-xl border overflow-hidden">
  <Table>
    <TableHeader>
      <TableRow className="bg-muted/50">
        {columns.map(() => (
          <TableHead>
            <Skeleton className="h-4 w-20" />
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          {columns.map((_, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

---

## Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| **< md** (< 768px) | Table scrolls horizontally (`overflow-x-auto` on wrapper). Toolbar stacks vertically. Pagination simplified. |
| **≥ md** (768px+) | Full table visible. Toolbar inline. Full pagination. |

### Mobile Considerations

- Wrap table in `<div className="overflow-x-auto">` for horizontal scroll
- Consider hiding less important columns at small viewpoints via column visibility defaults
- Pagination buttons stack if needed: `flex-wrap`

---

## Accessibility

### Table Semantics

| Element | Role/Attribute | Notes |
|---|---|---|
| `<Table>` | `role="table"` | Native HTML table semantics |
| `<TableHead>` | `role="columnheader"` | Native `<th>` |
| Sortable `<th>` | `aria-sort="ascending\|descending\|none"` | Updates on sort toggle |
| `<TableBody>` | `role="rowgroup"` | Native `<tbody>` |
| `<TableRow>` | `role="row"` | Native `<tr>` |
| `<TableCell>` | `role="cell"` | Native `<td>` |

### Interactive Elements

| Element | `aria-label` |
|---|---|
| Select all checkbox | `"Select all"` |
| Row checkbox | `"Select row"` |
| Previous button | `"Go to previous page"` |
| Next button | `"Go to next page"` |
| Search input | `placeholder` serves as label, plus `<Label className="sr-only">` |
| Column toggle | `"Toggle column visibility"` |

### Keyboard Interaction

| Key | Context | Behavior |
|---|---|---|
| `Tab` | Global | Moves through: Search → Column toggle → Table cells (checkboxes, links) → Pagination |
| `Space` | Checkbox | Toggles selection |
| `Enter` | Sort header button | Toggles sort direction |
| `Enter` | Row (if `onRowClick`) | Triggers row click action |
| `Arrow keys` | Within DropdownMenu | Navigate column visibility options |

### Empty State

```tsx
<TableRow>
  <TableCell
    colSpan={columns.length}
    className="text-center py-12 text-muted-foreground"
  >
    No results found
  </TableCell>
</TableRow>
```

---

## Animation

### Row Hover (CSS)

```
className="transition-colors duration-150"
```

### Sort Icon Transition

```ts
// Subtle rotation on sort change
<motion.span
  animate={{ rotate: sortDirection === "desc" ? 180 : 0 }}
  transition={{ duration: 0.2 }}
>
  <ArrowUp className="w-3.5 h-3.5" />
</motion.span>
```

### Page Transition

```ts
// When pagination changes, animate table body
const tableBodyVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.15 },
  },
};
```

---

## Dark Mode

| Element | Light | Dark |
|---|---|---|
| Table bg | `bg-background` | Same (token adapts) |
| Header row | `bg-muted/50` | Same |
| Row hover | `bg-muted/50` | Same |
| Selected row | `bg-muted` | Same |
| Border | `border-border` | Same |
| Empty text | `text-muted-foreground` | Same |

No special dark-mode overrides — semantic tokens handle the switch.

---

## Usage Contexts

| Admin Page | `searchKey` | Selection | Notable Columns |
|---|---|---|---|
| **User Management** | `name` or `email` | Yes | Avatar, Name, Email, Role, Status, Joined |
| **Event Management** | `title` | Yes | Thumbnail, Title, Date, Host, Status |
| **Report Management** | `reason` | Yes | Reporter, Target, Reason, Status, Date |
| **Gallery Management** | `title` | Yes | Thumbnail, Title, Uploader, Status, Date |
| **Club Management** | `name` | Yes | Cover, Name, Members, Created |
| **Tag Management** | `name` | No | Name, Color, Usage Count, Actions |

---

## Usage Example

```tsx
"use client";

import { DataTable } from "@/components/features/admin/data-table";
import { columns } from "./columns"; // ColumnDef[] for this page

interface UserManagementPageProps {
  users: User[];
}

export function UserManagementTable({ users }: UserManagementPageProps) {
  return (
    <DataTable
      columns={columns}
      data={users}
      searchKey="name"
      searchPlaceholder="Search users..."
      enableSelection
      pageSize={20}
    />
  );
}
```

---

## Related Components

- [StatCard](stat-card.md) — dashboard KPI cards shown above the table
- [AdminSidebar](../layout/admin-sidebar.md) — admin navigation alongside the table
