# Phase 4: UI Polish — Agent Teams Tracker

## Current State (Research Complete)

**Styling approach:** Tailwind CSS v4 + SCSS with CSS custom properties (light + dark mode).
**Font:** Nunito (Google Fonts) — weights 400, 600, 700.
**Theme:** Minty green / dark blue palette with full dark-mode variable set.
**Layout:** Flexbox + CSS Grid. Responsive breakpoints at 600px.
**Buttons:** Standardized system — `btn-primary`, `btn-secondary`, `btn-danger` in `tailwind.css`.

### Component Inventory

| Component | Template | SCSS | Notes |
|-----------|----------|------|-------|
| `navbar` | `shared/components/navbar/` | Has styles | Fixed top, theme toggle, auth links |
| `meetup-card` | `features/meetup/meetup-card/` | **Empty** — uses Tailwind utilities | Card layout, activity badge, `viewDetails` output event |
| `meetup-form` | `features/meetup/meetup-form/` | Has styles | 3-section layout, radio buttons |
| `comment-list` | `features/comment/comment-list/` | **Empty** — uses Tailwind utilities | Cards matching meetup-card pattern |
| `comment-form` | `features/comment/comment-form/` | **Empty** — uses Tailwind utilities | Embedded textarea with focus ring |
| `dashboard` | `pages/dashboard/` | Has styles | Grid of meetup-cards, create/edit modal, **detail modal overlay** |
| `meetup-detail` | `pages/meetup-detail/` | Has styles | Dual-mode: full page (direct URL) or modal (from dashboard) |
| `login` | `pages/login/` | Has styles | Centered form |
| `signup` | `pages/signup/` | Has styles | Centered form |

---

## Team Structure

| Role | Agent | Status |
|------|-------|--------|
| **Lead** | Main conversation | Active |
| **Styling Agent** | CSS/SCSS + Tailwind specialist | Active — Step 4.5 complete |
| **Architecture Agent** | Angular template / build specialist | Active — Step 4.5 complete |

---

## Plan (7 Steps)

### Step 1: Install & Configure Tailwind CSS
- Install `tailwindcss`, `@tailwindcss/postcss`, `postcss`
- Create `postcss.config.js` and `tailwind.config.js`
- Add `@import "tailwindcss"` to `styles.scss`
- Verify dev server starts cleanly with Tailwind active
- **Agent:** Styling Agent

### Step 2: Standardize Button System
- Define 3 button variants: **Primary** (solid accent), **Secondary** (outlined), **Danger** (red)
- Each gets: default, hover, focus, disabled states
- Apply across all components (navbar, forms, cards, dashboard)
- Migrate from inconsistent mix of global + inline button styles
- **Agent:** Styling + Architecture (template class changes)

### Step 3: Button Polish & Meetup Card Overhaul
- **Button refinements:** Reduced padding (0.4rem 1rem), font-size (0.9rem), dark-mode contrast fix (Option A — dark text on bright accent via `body.dark-mode .btn-primary { color: var(--background) }`)
- **Meetup card redesign:** Tailwind utility classes for card layout (`rounded-xl`, `shadow-md`, `hover:shadow-lg`, `border-border`, `bg-card`)
- Activity badge with dual-encoding icons (🏃 run, 🚲 bicycle, 📍 default)
- Info rows with emoji icons, pluralized participant count
- Action bar separated with `border-t`, shortened button labels
- **Agent:** Styling + Architecture

### Step 3.5: Dark Mode Fix & Design Polish
- Fixed theme variable scoping: Tailwind v4 `@theme` resolves `var()` at build time, so dark-mode overrides from `styles.scss` were invisible to utility classes
- Solution: Universal `.dark-mode` selector in `tailwind.css` with `!important` overrides + explicit `--color-*` redefinitions
- Increased shadow-glow intensity (`0 0 20px 3px`) for dark mode
- Pro typography: `text-xl font-bold tracking-tight` titles, `text-text-secondary/80 leading-relaxed` descriptions
- Fixed dark-mode readability: comment author switched from `text-accent` to `text-text-primary`
- Comment form fully migrated to Tailwind: embedded textarea with `focus-within:ring-2 focus-within:ring-accent/50`
- Gutted dead BEM SCSS from `comment-list.scss` and `comment-form.scss`
- **Agent:** Styling + Architecture

### Step 4: Comment Card Overhaul
- Restyle `comment-list` items with card-like appearance (same pattern as meetup cards)
- Tailwind utility classes: `rounded-xl border border-border bg-card shadow-glow transition-all duration-300 p-4`
- **Agent:** Styling + Architecture

### Step 4.5: Detail Modal Overlay
- Comment section constrained to `max-width: 700px` (matches `.detail-card`)
- `MeetupDetailComponent` now dual-mode: accepts optional `[meetupId]` input for modal usage, falls back to route param for direct URL
- `isModal` computed hides "Back to Dashboard" link when rendered in modal
- Dashboard hosts detail modal: `showDetailModal` / `detailMeetupId` signals, Escape key handler (`@HostListener('document:keydown.escape')`)
- Meetup card emits `viewDetails` output instead of using `routerLink` — parent decides behavior
- `.detail-modal` CSS: fixed height `75vh`, `overflow-y: auto` (scrollbar appears as comments grow, modal doesn't resize)
- Frosted-glass effect: `color-mix(in srgb, var(--card-bg) 92%, transparent)` + `backdrop-filter: blur(12px)` on both modals
- Meetup card: removed horizontal divider above buttons, clean card layout with `p-6`
- Direct URL `/meetups/:id` still works as full-page view (bookmarkable)
- **Agent:** Architecture + Styling

### Step 5: User Avatar Placeholders
- Create reusable avatar component (initials in colored circle)
- Integrate into: navbar (current user), comment list, meetup detail (organizer)
- Deterministic color from username hash
- **Agent:** Architecture (new component) + Styling

### Step 6: Form & Page Polish
- Unify login/signup form styling
- Polish meetup-form sections
- Improve meetup-detail layout and info grid
- Dashboard grid spacing and empty states
- **Agent:** Styling

### Step 7: Final QA & Dark Mode Verification
- Verify all changes work in both light and dark themes
- Check responsive behavior at mobile breakpoints
- Ensure no regressions in functionality
- **Agent:** Lead (manual review)

---

## Progress Tracker

| Step | Description | Status | Commit Message (Proposed) |
|------|-------------|--------|---------------------------|
| 1 | Install Tailwind CSS | **Complete** | `install and configure Tailwind CSS v4 with PostCSS for Angular 20` |
| 2 | Button system | **Complete** | `standardize button system, and cleanup redundant SCSS` |
| 3 | Button polish & meetup card | **Complete** | `polish buttons and overhaul meetup card with activity badges` |
| 3.5 | Dark mode fix & design polish | **Complete** | Theme variable scoping fix, shadow-glow, pro typography, comment Tailwind migration |
| 4 | Comment card overhaul | **Complete** | Comment list + form fully migrated to Tailwind utilities, dead BEM SCSS gutted |
| 4.5 | Detail modal overlay | **Complete** | `implement dual-mode meetup details with frosted-glass modal` |
| 5 | User avatar placeholders | Pending | — |
| 6 | Form & page polish | Pending | — |
| 7 | Final QA & dark mode | Pending | — |

---

## Tailwind v4 + Angular PostCSS Fix (Step 3 Blocker)

**Problem:** After Step 3, Tailwind utility classes (`shadow-md`, `rounded-xl`, `bg-card`, `border-border`, etc.) appeared in HTML but had no effect in the browser. The `@theme` block and button styles worked, but zero utility classes were generated.

**Root cause:** Angular's `@angular/build:application` builder (esbuild-based) **ignores `postcss.config.js`**. It only reads JSON-format config files: `postcss.config.json` or `.postcssrc.json`. Our JavaScript config was never loaded.

Without PostCSS running, esbuild resolved `@import "tailwindcss"` to the static `node_modules/tailwindcss/index.css` (via the package's `"style"` export field). That file contains the `@layer`/`@theme` skeleton and preflight reset — enough to make it look like Tailwind was working — but no dynamic utility class generation ever happened.

**Diagnosis steps:**
1. Confirmed `ng build` output CSS contained `@layer theme` and `.btn-primary` but zero utilities (`.flex`, `.p-5`, `.shadow-md` all absent).
2. Ran PostCSS manually via Node — utilities generated correctly when `from: path.resolve('src/tailwind.css')` was passed. Proved Tailwind + `@source "./app"` work fine.
3. Added debug wrapper to `postcss.config.js` — discovered the file was **never loaded** (debug log file never created during `ng build`).
4. Read Angular source (`node_modules/@angular/build/src/utils/postcss-configuration.js`) — found line 15: `const postcssConfigurationFiles = ['postcss.config.json', '.postcssrc.json']`. No `.js` support.

**Fix:** Created `.postcssrc.json` in the Angular project root:
```json
{ "plugins": { "@tailwindcss/postcss": {} } }
```

Angular reads this, loads `@tailwindcss/postcss` (which has `postcss: true` flag), and runs it with `from: <actual file path>`. The `@source "./app"` directive in `tailwind.css` then correctly resolves to `src/app/` and scans all templates.

**Cleanup:** Removed stale `src/tailwind-generated.css` (artifact from a manual PostCSS test run). Kept `postcss.config.js` for non-Angular tooling compatibility.

**Verified:** Both `ng build` and `ng serve` now generate all utility classes.

---

## Approval Log

| Step | Approved By | Date | Notes |
|------|-------------|------|-------|
| 1 | sjtroxel | 2026-02-16 | Committed manually |
| 2 | sjtroxel | 2026-02-16 | Committed manually; auth verified after logout/login |
| 3 | sjtroxel | 2026-02-16 | Dark-mode contrast Option A approved; activity badge icons added |
| 3-fix | sjtroxel | 2026-02-16 | `resolve Tailwind v4 build pipeline and define core theme variables` — .postcssrc.json fix |
| 3.5–4.5 | sjtroxel | 2026-02-16 | `implement dual-mode meetup details with frosted-glass modal` — dark mode fix, comment overhaul, detail modal, card polish |
