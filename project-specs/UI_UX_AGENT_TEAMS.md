# Phase 4: UI Polish — Agent Teams Tracker

## Current State (Research Complete)

**Styling approach:** Pure SCSS with CSS custom properties (light + dark mode). No Tailwind installed.
**Font:** Nunito (Google Fonts) — weights 400, 600, 700.
**Theme:** Minty green / dark blue palette with full dark-mode variable set.
**Layout:** Flexbox + CSS Grid. Responsive breakpoints at 600px.
**Buttons:** Inconsistent — global styles use solid navy `--button-bg`, but most components use transparent + 2px accent border pattern instead.

### Component Inventory

| Component | Template | SCSS | Notes |
|-----------|----------|------|-------|
| `navbar` | `shared/components/navbar/` | Has styles | Fixed top, theme toggle, auth links |
| `meetup-card` | `features/meetup/meetup-card/` | **Empty** — uses global `.meetup-card` | Title, activity, location, date, actions |
| `meetup-form` | `features/meetup/meetup-form/` | Has styles | 3-section layout, radio buttons |
| `comment-list` | `features/comment/comment-list/` | Has styles | Cards with left accent border |
| `comment-form` | `features/comment/comment-form/` | Has styles | Textarea + char counter |
| `dashboard` | `pages/dashboard/` | Has styles | Grid of meetup-cards, modal |
| `meetup-detail` | `pages/meetup-detail/` | Has styles | Detail card, info grid, comments |
| `login` | `pages/login/` | Has styles | Centered form |
| `signup` | `pages/signup/` | Has styles | Centered form |

---

## Team Structure

| Role | Agent | Status |
|------|-------|--------|
| **Lead** | Main conversation | Active |
| **Styling Agent** | CSS/SCSS + Tailwind specialist | Active — Step 2 complete |
| **Architecture Agent** | Angular template / build specialist | Active — Step 2 complete |

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

### Step 3: Meetup Card Overhaul
- Redesign `meetup-card` with Tailwind utilities + SCSS refinements
- Add hover elevation (shadow transition), rounded corners, subtle border
- Activity badge with icon/color coding (run vs bicycle)
- Better spacing and typography hierarchy
- **Agent:** Styling + Architecture

### Step 4: Comment Card Overhaul
- Restyle `comment-list` items with card-like appearance
- User avatar placeholder (colored circle with initials)
- Improved timestamp formatting and layout
- Hover state for comment cards
- **Agent:** Styling + Architecture

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
| 2 | Button system | **Done** | `standardize button system with btn-primary/secondary/danger utilities` |
| 3 | Meetup card overhaul | Pending | — |
| 4 | Comment card overhaul | Pending | — |
| 5 | User avatar placeholders | Pending | — |
| 6 | Form & page polish | Pending | — |
| 7 | Final QA & dark mode | Pending | — |

---

## Approval Log

| Step | Approved By | Date | Notes |
|------|-------------|------|-------|
| 1 | sjtroxel | 2026-02-16 | Committed manually |
