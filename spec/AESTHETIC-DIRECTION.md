# Aesthetic Direction — Autumn Soft

> **Mood Keywords:** "Adult-cute café warmth" (大人かわいい・カフェ的な温もり)

This document maps the emotional target of the Autumn Soft design language to concrete, measurable design attributes. Every visual decision in this project traces back to this file.

---

## 1. Mood-to-Design Attribute Mapping

The design is driven by three mood pillars:

| Pillar | Japanese | Meaning |
|--------|----------|---------|
| **Adult-cute** | 大人かわいい | Cute but not childish — rounded, colorful, playful, yet mature and restrained |
| **Café warmth** | カフェ的な温もり | The feeling of sitting in a warm café on an autumn afternoon — soft lighting, natural materials, unhurried comfort |
| **Autumn palette** | 秋色 | Warm, muted tones drawn from autumn foliage, harvest, and golden-hour light |

### Attribute Mapping Table

| Mood Keyword | Color Temperature | Corner Radius | Shadow Style | Font Personality | Animation Speed / Style | Layout Density |
|---|---|---|---|---|---|---|
| **Adult-cute** | Warm-neutral (ivory base) | 12–20 px (generous, pillowy) | Soft, diffused, warm-tinted | Rounded sans-serif for UI; clean serif for headings | 200–400 ms spring curves (playful but not bouncy) | Breathable — generous padding, whitespace |
| **Café warmth** | Warm amber undertones | 8–16 px (smooth, inviting) | Layered, low-opacity warm brown | High readability, moderate weight contrast | 300–500 ms ease-out (relaxed, unhurried) | Comfortable — content blocks well-separated |
| **Autumn palette** | Coral/mustard/olive accents on ivory | Consistent across components | Drop shadows with `oklch` warm brown tint | Accent fonts only for decorative touches | Leaf-drift micro-animations (subtle parallax) | Medium — enough content density to feel alive |

### Composite Design Values

These are the synthesized values used in the design token system:

| Attribute | Value | Rationale |
|---|---|---|
| Base background | `ivory` / `#FFFDF7` | Warmer than pure white, reduces eye strain, feels like aged paper |
| Primary accent | `coral` / `#E8836B` | Warm, inviting, autumn leaf tone — softer than red, more personality than orange |
| Secondary accent | `mustard` / `#D4A843` | Golden-hour warmth, harvest association, complements coral without clashing |
| Text color | `mocha-brown` / `#3D2E2A` | Warmer than black, easier on eyes, café-menu feel |
| Border radius (small) | `8px` | Buttons, badges, chips |
| Border radius (medium) | `12px` | Cards, inputs, dropdowns |
| Border radius (large) | `16–20px` | Modals, hero sections, image containers |
| Shadow (default) | `0 2px 8px oklch(0.3 0.02 60 / 0.08)` | Warm-tinted, soft, barely visible — "floating on warm air" |
| Shadow (elevated) | `0 8px 24px oklch(0.3 0.02 60 / 0.12)` | Modals, popovers — more depth but still gentle |
| Animation easing | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Spring-like overshoot for enter; `ease-out` for exit |
| Animation duration | `200–400ms` | Fast enough to feel responsive, slow enough to notice |
| Spacing scale | `4px` base, generous multiples | `p-4` minimum for touch targets, `gap-6` standard for card grids |

---

## 2. Visual Identity — What This Design IS

### Core Characteristics

- **Warm ivory base** — the entire canvas feels like natural, unbleached paper under soft lighting
- **Coral and mustard accents** — primary and secondary colors drawn directly from autumn leaves (紅葉 / momiji)
- **Generous rounded corners** — every interactive element feels soft and touchable, like smooth river stones
- **Soft brown shadows** — warm-tinted shadows that feel like late-afternoon sun casting gentle shade
- **Gentle spring animations** — elements enter with a subtle bounce, exit with a soft fade, never jarring
- **Breathable spacing** — generous padding and margins; content never feels cramped
- **Textured warmth** — subtle grain or noise textures on backgrounds (optional) to add organic feel
- **Layered depth** — cards and surfaces create a sense of stacked paper, not flat panels

### Visual Metaphors

| Metaphor | Application |
|---|---|
| Autumn leaves drifting | Page transition animations, loading states |
| Café menu board | Typography hierarchy, card layouts |
| Warm window light | Gradient overlays, hero sections |
| Handcrafted paper | Card surfaces, subtle textures |
| Cozy reading nook | Content layout, generous margins |

---

## 3. Visual Identity — What This Design IS NOT

| Anti-Pattern | Why It's Excluded |
|---|---|
| **Cold / clinical** | No blue-white, no sterile grays — warmth is the core identity |
| **Cyber / neon** | Most VRChat community sites default to cyber-dark aesthetics; this project differentiates by being the warm alternative |
| **Sharp-cornered** | Hard rectangles feel aggressive and corporate — antithetical to the café mood |
| **Dense / cramped** | Information-dense layouts feel like dashboards, not communities |
| **Dark-first** | Dark mode exists but is secondary — the light/warm experience is the signature |
| **Childish / infantile** | No baby pastels, no excessive emoji decoration, no kawaii mascot bombardment — "adult-cute" means refined playfulness |
| **Brutalist / raw** | No exposed structure, no aggressive typography, no intentional ugliness |
| **Glassmorphism / neumorphism** | These trends feel cold and artificial — this design is warm and organic |

---

## 4. The "Adult" Balance (大人かわいい)

The key tension in this design is between **cute** and **adult**. Here is how that balance is maintained:

### Visual Layer (Cute)

- Rounded corners everywhere (12–20 px radius)
- Colorful accent palette (coral, mustard, olive, sage)
- Playful micro-animations (spring physics, slight overshoot)
- Decorative autumn leaf motifs in backgrounds and dividers
- Warm, inviting illustrations (if used)
- Soft shadows that feel like cushions

### Content Layer (Adult)

- **Standard kanji usage** — no excessive hiragana simplification (e.g. use 確認する not かくにんする)
- **Polite, professional language** — です/ます form, no excessive casual speech in UI labels
- **Clean typography** — no handwritten or novelty fonts for body text
- **Structured information hierarchy** — clear headings, proper semantic HTML
- **Restrained emoji usage** — at most one per section title, never in form labels or error messages
- **Professional interactions** — confirmation dialogs, proper error handling, clear feedback

### The Rule

> If a design element would feel at home in a children's educational app, it has gone too far.
> If a design element would feel at home in a corporate SaaS dashboard, it has gone too far.
> The sweet spot is: **a well-designed café menu, an indie bookstore website, a warm community bulletin board.**

---

## 5. VRChat Community Differentiation

### The Problem

The vast majority of VRChat community websites follow one of two patterns:

1. **Cyber-dark** — dark backgrounds, neon accents, futuristic fonts, glitch effects
2. **Discord-clone** — dark gray panels, bright accent colors, chat-centric layouts

These patterns are:
- Visually fatiguing for extended reading
- Indistinguishable from each other
- Optimized for "cool factor" over usability
- Inaccessible (low contrast, tiny text, animation-heavy)

### Our Differentiation

The Autumn Soft design says: **"This community is warm, welcoming, and comfortable."**

| Typical VRChat Site | This Project |
|---|---|
| Dark background | Warm ivory background |
| Neon accent colors | Muted autumn palette |
| Sharp corners, hard edges | Generous rounded corners |
| Aggressive animations | Gentle spring animations |
| Dense information layout | Breathable, spacious layout |
| Tech-forward aesthetic | Handcrafted, organic aesthetic |
| Optimized for "looking cool" | Optimized for "feeling welcome" |

A visitor should immediately feel: *"This is different. This feels nice."*

---

## 6. Inspiration Sources

| Source | What We Take From It |
|---|---|
| Japanese café websites (e.g. % Arabica, Blue Bottle JP) | Typography balance, warm photography, generous whitespace |
| Notion (warm mode) | Clean layout, simple iconography, soft shadows |
| Linear (structure) | Component consistency, transition polish — but warmed up |
| Dribbble "cozy UI" collections | Rounded cards, warm palettes, soft illustration style |
| Autumn photography (紅葉) | Color palette extraction, mood reference |
| Studio Ghibli poster design | The "adult whimsy" balance — beautiful, detailed, but never childish |
| Indie bookstore websites | Warm → inviting → "I want to spend time here" feeling |

---

## 7. Admin Panel Tone

The admin panel shares the Autumn Soft DNA but with professional restraint:

| Attribute | Public Site | Admin Panel |
|---|---|---|
| Color palette | Full autumn palette with all accents | Same palette, reduced saturation (10–15% less) |
| Animations | Spring physics, leaf motifs, playful enter/exit | Minimal — subtle fades only, no spring overshoot |
| Corner radius | 12–20 px (generous) | 8–12 px (slightly tighter, more efficient) |
| Spacing | Generous, breathable | Comfortable but compact — more content per viewport |
| Decorative elements | Autumn leaf dividers, subtle grain textures | None — clean and functional |
| Shadows | Warm-tinted, soft | Same tint, lower intensity |
| Typography | Expressive weight contrast | Uniform weights, higher information density |
| Hover states | Gentle color shift + subtle scale | Color shift only, no scale |

### Rationale

Staff members interact with the admin panel repeatedly and at high frequency. The reduced decoration:
- Minimizes visual fatigue during long sessions
- Improves scan speed for information-dense screens
- Reduces cognitive load during moderation tasks
- Maintains brand identity without compromising efficiency

---

## 8. Validation Checklist

Before any component or page design is finalized, check:

- [ ] Does the warm ivory base dominate the background? (Not white, not gray)
- [ ] Are corners rounded to at least 8px on interactive elements?
- [ ] Are shadows warm-tinted, not neutral gray?
- [ ] Do animations use spring/ease-out curves, not linear?
- [ ] Is the spacing generous enough to "breathe"?
- [ ] Would this feel at home on a café website? (Not a dashboard, not a game launcher)
- [ ] Is the text professionally written? (Not overly casual, not corporate)
- [ ] Does the dark mode variant maintain warmth? (Warm dark, not cold dark)
- [ ] Is the component accessible at WCAG AA? (Contrast, focus, screen reader)
- [ ] Does the admin variant reduce decoration without losing brand identity?
