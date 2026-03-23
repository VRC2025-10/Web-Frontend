# Personas & User Scenarios

This document defines the primary user personas, their goals, device contexts, and the user scenarios that drive design and development priorities.

---

## 1. Primary Personas

### Persona A: Regular Member — Yuki (ゆき)

| Attribute | Detail |
|---|---|
| **Age** | 25 years old |
| **Occupation** | Office worker (IT company) |
| **VRChat experience** | 2 years, active 3–4 nights per week |
| **Primary device** | Gaming PC (RTX 3070, 27" 1440p monitor) |
| **Secondary device** | iPhone 15, used for quick checks during commute |
| **Browser** | Chrome (PC), Safari (iPhone) |
| **Technical skill** | Can use Discord, Google Docs; limited Markdown; no coding |
| **Personality** | Shy in large groups, expressive in small circles, loves customizing VRChat avatar and spaces |

**Goals:**
- "I want to see upcoming event times at a glance without digging through Discord"
- "I want to make a cute, personalized profile page that shows off my avatar"
- "I want to check event schedules on my phone while on the train"
- "I want to find and connect with new members who share my interests"

**Frustrations:**
- Important event announcements get buried in Discord chat
- Can't easily check event times without scrolling through channels
- Profile options on Discord are too limited to express personality
- Most VRChat community sites look too "techy" and cold

**Markdown Ability:** Can handle basic bold/italic if shown examples. Cannot write tables or code blocks. Prefers a WYSIWYG-like preview experience.

**Accessibility Notes:** No specific accessibility needs, but appreciates large touch targets on mobile and clear, readable text.

---

### Persona B: Staff / Club Leader — Haruto (はると)

| Attribute | Detail |
|---|---|
| **Age** | 28 years old |
| **Occupation** | Freelance designer |
| **VRChat experience** | 3 years, one of the founding members, runs weekly events |
| **Primary device** | Gaming PC (RTX 4070, dual 27" monitors) |
| **Secondary device** | Android tablet, occasionally phone |
| **Browser** | Firefox (PC), Chrome (tablet) |
| **Technical skill** | Comfortable with Markdown, basic HTML, image editing; can learn admin tools quickly |
| **Personality** | Organized, responsible, wants tools that don't waste time, cares about community quality |

**Goals:**
- "I want to create and publish event announcements in under 2 minutes"
- "I want to moderate gallery submissions quickly — approve/reject with one click"
- "I want to manage member roles and see community statistics"
- "I want to batch-upload event photos to the gallery efficiently"

**Frustrations:**
- Current workflow involves posting to Discord + Google Calendar + Notion — three places for one event
- No quick way to moderate/approve content without opening multiple tools
- Manually resizing images for different formats is tedious
- Hard to track community growth or engagement without digging through Discord stats

**Markdown Ability:** Fluent. Writes Markdown daily. Expects a live preview with GFM support (tables, task lists, strikethrough).

**Accessibility Notes:** Extended screen time (4+ hours for admin tasks). Values reduced eye strain — warm color palette is a genuine comfort feature, not just aesthetic.

---

### Persona C: External Visitor — Mio (みお)

| Attribute | Detail |
|---|---|
| **Age** | 22 years old |
| **Occupation** | University student |
| **VRChat experience** | New — heard about VRChat from a friend, exploring communities |
| **Primary device** | MacBook Air (13") |
| **Secondary device** | iPhone 14, primary browsing device |
| **Browser** | Safari (both devices) |
| **Technical skill** | Basic — uses social media, can browse websites, no technical background |
| **Personality** | Curious but cautious, wants to feel welcome before committing, first impressions matter a lot |

**Goals:**
- "I want to feel the community vibe — are these people friendly? Is it active?"
- "I want to see what events they host — would I enjoy them?"
- "I want to browse member profiles and gallery to see if this community fits me"
- "I want to know how to join easily if I decide to"

**Frustrations:**
- Many VRChat community sites are confusing or intimidating (dark themes, jargon-heavy)
- Can't tell if a community is active without joining their Discord first
- No way to preview what the community is about from outside
- Join processes are often opaque or require too many steps

**Markdown Ability:** None. Will never author content. Only consumes rendered content.

**Accessibility Notes:** Small laptop screen (13"), may use mobile primarily. Expects the site to work well at medium viewport sizes.

---

## 2. Accessibility Personas

These overlay personas represent accessibility needs that may apply to any primary persona.

### AP-1: Keyboard-Only User — Kenji

| Attribute | Detail |
|---|---|
| **Condition** | RSI (repetitive strain injury) — cannot use mouse for extended periods |
| **Input method** | Full keyboard navigation + occasional trackpad |
| **Expectations** | Visible focus indicators, logical tab order, skip-to-content links, keyboard-accessible dropdown menus and modals |

**Design Requirements:**
- All interactive elements reachable and operable via Tab, Enter, Space, Arrow keys
- Focus ring: 2px solid coral (`#E8836B`), 2px offset, visible on all backgrounds
- Skip-to-content link as first focusable element
- Modal focus trap: Tab cycles within modal while open
- Dropdown menus: Arrow keys for navigation, Escape to close
- No functionality available only via hover (tooltips must be keyboard-triggered)

---

### AP-2: Screen Reader User — Akiko

| Attribute | Detail |
|---|---|
| **Condition** | Blind — uses NVDA (Windows) screen reader |
| **Input method** | Keyboard only + screen reader commands |
| **Expectations** | Proper semantic HTML, ARIA labels, live regions for dynamic content, meaningful alt text |

**Design Requirements:**
- All images have descriptive alt text (not "image" or filename)
- Form inputs have associated labels (not placeholder-only)
- Dynamic content updates announced via `aria-live` regions
- Page structure navigable via headings (h1 → h2 → h3, no skipped levels)
- Interactive components follow WAI-ARIA Authoring Practices patterns
- Tables have proper `<thead>`, `<th>`, and `scope` attributes
- Icon-only buttons have `aria-label`

---

### AP-3: Low-Vision User — Tama

| Attribute | Detail |
|---|---|
| **Condition** | Low vision — uses browser zoom (150–200%) and high contrast settings |
| **Input method** | Mouse with large cursor, keyboard as backup |
| **Expectations** | Text scales without layout breaking, sufficient contrast, no clipped content |

**Design Requirements:**
- Layout functional at 200% browser zoom without horizontal scrolling
- Minimum contrast ratios: 4.5:1 (normal text), 3:1 (large text), 3:1 (UI components)
- No text embedded in images
- Relative font sizing (rem/em), never fixed px for body text
- `prefers-contrast: more` media query support for high-contrast mode
- No information conveyed only by color — always icon, text, or shape as well

---

## 3. User Scenarios

### Scenario 1: Event Check on Phone (Persona A — Yuki, Mobile)

**Context:** It's 8:30 AM. Yuki is on the train to work. She wants to check tonight's event time.

**Flow:**
1. Opens the community website on iPhone Safari
2. Sees the home page with a prominent "Upcoming Events" section
3. Tonight's event is visible immediately — large event card with:
   - Event name (readable at arm's length)
   - Date and time in her timezone (JST)
   - Location (VRChat world name)
   - Event type icon (music, social, game, etc.)
4. Taps the event card for details
5. Sees full description, attendee count, and a "copies to calendar" button
6. Closes Safari and continues her commute

**Design Implications:**
- Home page must surface upcoming events above the fold on mobile
- Event cards need large, scannable text (16px+ body, 20px+ title)
- Date/time must be formatted clearly and localized (JST by default)
- Event detail page must load fast (<2s LCP on 4G)
- Tap targets: minimum 44×44px for all interactive elements
- One-thumb reachability: primary actions in bottom half of screen

**Success Metric:** Time from opening site to reading event time < 5 seconds.

---

### Scenario 2: Profile Creation on PC (Persona A — Yuki, Desktop)

**Context:** It's Saturday evening. Yuki just joined the community and wants to set up her profile page.

**Flow:**
1. Logs in via the website (previously registered through Discord OAuth or email)
2. Navigates to Profile Editor from the navigation bar
3. Sees a form with live preview:
   - Left: form fields (avatar image upload, display name, bio, interests, social links)
   - Right: live preview of how the profile will look
4. Uploads her VRChat avatar screenshot — image is immediately shown in preview
5. Writes a short bio using the Markdown editor:
   - Simple toolbar: Bold, Italic, Link, List (no complex formatting)
   - Preview pane shows rendered Markdown in real-time
6. Selects interest tags from a predefined list (music, dance, games, building, etc.)
7. Saves — sees a beautiful, warm-styled profile card with her information
8. Shares the profile URL with friends

**Design Implications:**
- Profile editor uses split-pane layout on desktop (form | preview)
- Image upload: drag-and-drop + click, with immediate preview
- Markdown editor: simplified toolbar for non-technical users, live preview
- Save action: optimistic update with server confirmation toast
- Profile page: the "showcase moment" — must look beautiful and shareable
- Mobile profile editor: stacked layout (form above, preview toggle below)

**Success Metric:** Profile completion from empty to saved < 5 minutes for a non-technical user.

---

### Scenario 3: Member Discovery (Persona A — Yuki, Desktop)

**Context:** Yuki wants to find other members who are interested in VRChat world-building.

**Flow:**
1. Navigates to the Members page
2. Sees a grid of member profile cards — warm, inviting thumbnails
3. Uses the search/filter:
   - Text search by display name
   - Filter by interest tags
   - Sort by join date, activity, name
4. Filters by "World Building" interest tag
5. Browses filtered results — each card shows:
   - Avatar image
   - Display name
   - Short bio excerpt (first 60 characters)
   - Interest tags (visible pills)
6. Clicks on an interesting profile to view the full profile page
7. Sees their full bio, gallery images, and social links

**Design Implications:**
- Member grid: responsive card layout (1 col mobile, 2 col tablet, 3–4 col desktop)
- Filter UI: accessible combobox for tags, search input with debounce
- Profile cards: consistent height with image aspect ratio handling
- Loading: skeleton screens matching card layout during fetch
- Empty state: warm message with leaf motif when no results match

**Success Metric:** Found a relevant member within 30 seconds of reaching the Members page.

---

### Scenario 4: Gallery Management (Persona B — Haruto, Desktop)

**Context:** After last night's Halloween event, Haruto needs to upload and manage 30+ screenshots for the gallery.

**Flow:**
1. Logs into the admin panel
2. Navigates to Gallery Management
3. Bulk upload flow:
   - Drags 30 images into the upload zone
   - Upload progress shown per-image (thumbnail + progress bar)
   - Images auto-compressed and thumbnails generated server-side
4. Reviews uploaded images in a grid:
   - Quick actions on hover: approve/reject/edit metadata
   - Bulk selection: checkbox on each image, "Select All" option
   - Batch actions: approve selected, reject selected, add tags to selected
5. Tags images with event name ("Halloween 2026")
6. Approves 28 images, rejects 2 (blurry)
7. Published images appear immediately on the public gallery

**Design Implications:**
- Admin gallery: dense grid layout with small thumbnails (efficient scanning)
- Bulk upload: multi-file drag-and-drop, progress tracking per file
- Quick actions: hover-revealed action buttons (admin panel allows hover patterns)
- Batch operations: persistent action bar when items are selected
- Keyboard support: checkbox selection via Space, arrow key navigation between images
- Feedback: toast notifications for batch actions ("28 images approved")

**Success Metric:** Upload, review, and publish 30 images in < 10 minutes.

---

### Scenario 5: Community Vibe Check (Persona C — Mio, Mobile)

**Context:** Mio heard about this VRChat community from a friend's tweet. She taps the link on her iPhone.

**Flow:**
1. Lands on the home page — immediate impression:
   - Warm, inviting colors (not dark/techy)
   - Clear community name and tagline
   - Recent event photos in a carousel (looks fun and active)
   - "Upcoming Events" section (community is alive)
   - Member count / recent activity indicator
2. Scrolls down:
   - Brief community description (what this group is about)
   - Featured gallery images (beautiful VRChat screenshots)
   - Testimonials or member highlights
3. Taps "Events" in the navigation:
   - Sees a calendar of upcoming and past events
   - Past events have photos — community looks fun
4. Taps "Gallery":
   - Beautiful grid of VRChat screenshots
   - Can browse without logging in
5. Feels welcomed and interested, looks for how to join
6. Finds a clear "Join Us" CTA explaining the simple process
7. Decides to join

**Design Implications:**
- Home page must create a strong positive first impression in < 3 seconds
- Above-the-fold: community identity + evidence of activity (events, photos)
- No login required to browse public content (events, gallery, member list)
- Mobile layout must be polished — this may be the only device Mio uses
- "Join Us" CTA: prominent but not aggressive, warm invitation tone
- Social proof: visible activity indicators (member count, upcoming events, recent photos)
- Load performance: critical on mobile networks — LCP < 2.5s on 3G

**Success Metric:**
- Time to "this looks fun": < 5 seconds
- Bounce rate for external visitors: < 40%
- Click-through to Join Us: > 15% of external visitors

---

## 4. Device Strategy

### Design Philosophy: PC-First Design, Mobile-First Quality

VRChat players overwhelmingly use gaming PCs. The primary experience is designed for desktop viewports. However, quick-check scenarios (event times, gallery browse) happen frequently on mobile. Both experiences must be polished.

### Device Distribution (Expected)

| Device | Usage Share | Primary Scenarios |
|---|---|---|
| Gaming PC (1080p–1440p) | ~60% | Profile editor, gallery management, admin, event detail, long reading |
| Laptop (1080p–1366p) | ~15% | General browsing, event check, member discovery |
| Tablet (768p–1024p) | ~5% | Casual browsing, gallery viewing |
| Mobile (360p–428p) | ~20% | Event time check, quick gallery browse, social sharing landing |

### Breakpoint Priorities

| Breakpoint | Width | Priority | Optimization Focus |
|---|---|---|---|
| `sm` | 640px | P1 — Mobile | Single column, large touch targets, essential content only |
| `md` | 768px | P2 — Tablet | Two-column layouts begin, expanded navigation |
| `lg` | 1024px | P1 — Desktop (small) | Full navigation, sidebar layouts, split panes |
| `xl` | 1280px | P0 — Desktop (standard) | Primary design target, maximum content density |
| `2xl` | 1536px | P3 — Desktop (wide) | Content max-width container, don't stretch beyond readability |

### Responsive Adaptation Rules

| Component | Mobile (< 768px) | Tablet (768–1023px) | Desktop (≥ 1024px) |
|---|---|---|---|
| Navigation | Bottom bar or hamburger | Top bar with dropdown | Full top bar with all items |
| Event list | Single column cards | Two column grid | Three column grid |
| Profile editor | Stacked (form → preview toggle) | Stacked with side preview | Side-by-side (form | preview) |
| Gallery grid | 2 columns | 3 columns | 4–5 columns with masonry |
| Admin panel | Simplified — limited to critical actions | Full layout, compact sidebar | Full layout, expanded sidebar |
| Member cards | Full-width list items | 2 column grid | 3–4 column grid |

### Touch Target Requirements

| Element | Minimum Size | Minimum Spacing |
|---|---|---|
| Buttons | 44 × 44 px | 8px between adjacent buttons |
| Links in text | 44px height (via padding) | N/A |
| Checkboxes / Radio | 44 × 44 px tap area | 12px between options |
| Navigation items | 44 × 48 px | 4px between items |
| Icon buttons | 44 × 44 px | 8px between icons |

---

## 5. Persona-to-Feature Priority Matrix

| Feature | Yuki (Member) | Haruto (Staff) | Mio (Visitor) | Priority |
|---|---|---|---|---|
| Event list (public) | HIGH | MEDIUM | HIGH | P0 |
| Event detail page | HIGH | MEDIUM | HIGH | P0 |
| Gallery (public view) | MEDIUM | MEDIUM | HIGH | P0 |
| Profile page (public) | HIGH | LOW | MEDIUM | P0 |
| Home page | MEDIUM | LOW | HIGH | P0 |
| Profile editor | HIGH | LOW | — | P1 |
| Member directory | MEDIUM | MEDIUM | MEDIUM | P1 |
| Gallery management (admin) | — | HIGH | — | P1 |
| Event management (admin) | — | HIGH | — | P1 |
| Member management (admin) | — | HIGH | — | P1 |
| Join Us / registration flow | — | — | HIGH | P1 |
| Markdown editor (profile/event) | MEDIUM | HIGH | — | P2 |
| Dashboard / statistics (admin) | — | HIGH | — | P2 |
| Notifications | MEDIUM | HIGH | — | P2 |
| Search | MEDIUM | MEDIUM | LOW | P2 |
| Dark mode | LOW | MEDIUM | LOW | P3 |

---

## 6. Persona Validation

These personas should be validated and updated as the community grows:

- [ ] Conduct informal interviews with 3–5 existing community members (Persona A)
- [ ] Interview 2–3 staff members about admin workflow pain points (Persona B)
- [ ] Track landing page analytics to understand external visitor behavior (Persona C)
- [ ] Review and update personas quarterly based on actual usage data
- [ ] Add new personas if unexpected user groups emerge (e.g., multi-community managers)
