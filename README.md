# Mighty Mileage Meetup

A full-stack web application for organizing running and cycling meetups. Built as part of a 6-week-long AI-assisted development class, this project demonstrates modern full-stack patterns with an Angular 20 frontend and a Rails 8 API backend — connected by JWT authentication, interactive maps, and end-to-end test coverage.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Backend (Rails API)](#backend-rails-api)
  - [Frontend (Angular SPA)](#frontend-angular-spa)
- [Running Tests](#running-tests)
  - [Frontend Unit Tests](#frontend-unit-tests)
  - [Backend Tests](#backend-tests)
  - [End-to-End Tests (Playwright)](#end-to-end-tests-playwright)
- [Architecture](#architecture)
  - [Frontend Architecture](#frontend-architecture)
  - [Backend Architecture](#backend-architecture)
- [Project Specifications](#project-specifications)
- [Deployment](#deployment)
- [Critical Build Notes](#critical-build-notes)

---

## Overview

Mighty Mileage Meetup lets users create and join running or cycling events. Each meetup has a location, a time window, a guest limit, and a comments section. The app features interactive Leaflet maps backed by OpenStreetMap Nominatim geocoding, so users can either enter a ZIP code to auto-fill an address or drop a pin directly on the map.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Angular 20.1, TypeScript 5.8, RxJS 7.8 |
| **Styles** | Tailwind CSS v4, SCSS, CSS custom properties (light + dark mode) |
| **Maps** | Leaflet 1.9.4, @bluehalo/ngx-leaflet, OpenStreetMap Nominatim |
| **Frontend Tests** | Vitest 3.2, @analogjs/vitest-angular, happy-dom |
| **E2E Tests** | Playwright 1.58 |
| **Backend** | Rails 8.0.2 (API-only), Ruby 3.4.4 |
| **Auth** | JWT (stateless), bcrypt (passwords) |
| **Serialization** | Blueprinter |
| **Pagination** | Kaminari |
| **Database** | SQLite3 (dev/test), PostgreSQL (production) |
| **Linting** | RuboCop (Omakase preset), Brakeman (security) |
| **Deployment** | Vercel (frontend), Kamal / Docker (backend) |

---

## Repository Structure

```
ai-class-week-2/
├── FE-Mighty_Mileage_Meetup/       # Angular 20.1 SPA
│   ├── src/app/
│   │   ├── core/                   # Guards, interceptors, services
│   │   ├── features/               # Domain components (meetup, comment)
│   │   ├── pages/                  # Routed page views
│   │   └── shared/                 # Models, shared components
│   ├── e2e/                        # Playwright end-to-end tests
│   ├── .postcssrc.json             # Tailwind v4 PostCSS (Angular-required format)
│   ├── playwright.config.ts
│   └── vitest.config.ts
│
├── Mighty_Mileage_Meetup-api/      # Rails 8 API-only backend
│   ├── app/
│   │   ├── controllers/            # REST controllers
│   │   ├── models/                 # ActiveRecord models + validations
│   │   └── blueprints/             # Blueprinter JSON serializers
│   ├── db/migrate/                 # 9 database migrations
│   └── test/                       # Minitest suites
│
├── project-specs/                  # Feature specifications & design docs
├── mcp-route-scout/                # MCP server: exposes Rails routes to Claude
├── mcp-theme-scout/                # MCP server: exposes Tailwind theme to Claude
├── .mcp.json                       # MCP configuration
└── CLAUDE.md                       # AI assistant project instructions
```

---

## Features

- **User accounts** — Signup, login, logout with JWT authentication
- **User profiles** — Bio (up to 2000 characters)
- **Meetups** — Create, list (paginated), view, update, and delete running or cycling events
- **Smart location input** — Enter a ZIP code and the address auto-fills via Nominatim geocoding
- **Interactive maps** — View meetup locations on a Leaflet map; use the interactive picker to drop a pin anywhere and reverse-geocode the address
- **Locate Me** — One-click browser geolocation to center the map on the user's current position
- **Join & Leave** — Participate in meetups with uniqueness enforcement (no double-joining)
- **Comments** — Threaded comments on meetups with a 2000-character limit and live counter
- **Toast notifications** — Non-blocking feedback for user actions
- **Dark mode** — Full light/dark theme via CSS custom properties, toggled with `body.dark-mode`
- **Responsive design** — Tailwind v4 utility classes with a consistent design token system

---

## Getting Started

### Backend (Rails API)

```sh
cd Mighty_Mileage_Meetup-api

# Install Ruby dependencies
bundle install

# Create and migrate the database
bin/rails db:prepare

# Start the development server (http://localhost:3000)
bin/dev

# Alternative: start Puma directly
bin/rails server

# Full setup (install + db + clean logs)
./bin/setup
```

### Frontend (Angular SPA)

```sh
cd FE-Mighty_Mileage_Meetup

# Install Node dependencies
npm install

# Start the development server (http://localhost:4200)
npm start

# Production build
npm run build

# Dev build with watch mode
npm run watch
```

Both servers must be running concurrently for the full application to work.

---

## Running Tests

### Frontend Unit Tests

```sh
cd FE-Mighty_Mileage_Meetup

npm test                  # Run all unit tests once (Vitest)
npm run test:watch        # Watch mode
npm run test:coverage     # Generate coverage report
```

The test suite uses **Vitest** with `@analogjs/vitest-angular` and `happy-dom`. All services, guards, interceptors, and components have corresponding `*.spec.ts` files.

### Backend Tests

```sh
cd Mighty_Mileage_Meetup-api

# Run the full Minitest suite
bin/rails test

# Run a single test file
bin/rails test test/models/user_test.rb

# Run a single test by name
bin/rails test test/models/user_test.rb -n test_some_method

# Linting
bin/rubocop

# Security scan
bin/brakeman --no-pager
```

CI runs rubocop, minitest, and brakeman on every push and pull request to `main`.

### End-to-End Tests (Playwright)

Both the Angular dev server `:4200` and the Rails server `:3000` must be running before executing E2E tests.

```sh
cd FE-Mighty_Mileage_Meetup
npx playwright test
```

**WSL2 note:** Chromium requires additional system libraries:

```sh
sudo apt-get install libnspr4 libnss3 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libdrm2 libgbm1 libasound2
```

**Seven happy-path scenarios are covered:**

1. User A registration
2. User B registration
3. Login / logout round-trip
4. Create a meetup (with ZIP auto-lookup)
5. Join and leave a meetup
6. Post a comment
7. Full multi-user interaction flow

---

## Architecture

### Frontend Architecture

```
src/app/
├── core/
│   ├── guards/              # authGuard (protected routes), noAuthGuard (login/signup)
│   ├── auth-token-interceptor.ts   # Injects JWT on every request; SKIP_AUTH token
│   │                               # prevents forwarding to external APIs (Nominatim)
│   └── services/
│       ├── authentication.ts       # Login, signup, logout, token storage
│       ├── meetup.ts               # Meetup CRUD + pagination
│       ├── comment.ts              # Comment retrieval + creation
│       ├── geocoding.ts            # Forward geocoding (ZIP/address → lat/lng)
│       ├── reverse-geocoding.ts    # Reverse geocoding (lat/lng → address)
│       └── toast.ts                # Toast notification state
│
├── features/
│   ├── meetup/
│   │   ├── meetup-card/            # Dumb card: displays meetup summary
│   │   └── meetup-form/            # Reactive form: create/edit meetup,
│   │                               #   ZIP auto-lookup, interactive map picker,
│   │                               #   reverse geocoding loading spinner
│   └── comment/
│       ├── comment-list/           # Dumb list: renders Comment[] input
│       └── comment-form/           # Reactive form: post comment, char counter
│
├── pages/
│   ├── dashboard/                  # Meetup list with pagination + create button
│   ├── login/                      # Email/password auth form
│   ├── signup/                     # Registration form
│   └── meetup-detail/              # Full meetup view:
│                                   #   Leaflet map, join/leave, comments
│
└── shared/
    ├── models/                     # TypeScript interfaces: Location, Meetup, Comment
    └── components/
        ├── navbar/                 # App header with user menu + logout
        ├── toast/                  # Toast notification display
        └── map/                    # Leaflet map component
                                    #   Inputs: location, interactive
                                    #   Output: coordinatesSelected
                                    #   Features: animated click marker, Locate Me
```

**Key patterns:**

- **Standalone components** — No NgModules anywhere
- **Lazy-loaded routes** — Pages loaded on-demand via `app.routes.ts`
- **Signals** — Angular 20 signals (`input<>()`, `signal()`, `effect()`) for reactive state
- **Reactive forms** — `FormGroup` with typed controls and live validation
- **Global JWT interceptor** — `authTokenInterceptor` in `app.config.ts`; uses `HttpContextToken` (`SKIP_AUTH`) to bypass auth headers for third-party API calls
- **Observable services** — All HTTP calls return `Observable<T>`, subscribed in components

### Backend Architecture

**Models and associations:**

| Model | Key Associations |
|---|---|
| `User` | `has_many :meetups`, `has_many :comments`, `has_one :profile`, `has_one :location` (polymorphic), `has_many :meetup_participants` |
| `Meetup` | `belongs_to :user`, `has_one :location` (polymorphic), `has_many :comments` (polymorphic), `has_many :meetup_participants` |
| `Location` | Polymorphic — belongs to `User` or `Meetup` |
| `Comment` | Polymorphic — belongs to `User` or `Meetup`; `belongs_to :user` (author) |
| `MeetupParticipant` | Join table: `belongs_to :user`, `belongs_to :meetup` (unique index on both) |
| `Profile` | `belongs_to :user` |

**REST routes:**

```
POST   /signup                      → users#create
POST   /login                       → sessions#create
DELETE /logout                      → sessions#destroy
GET    /me                          → sessions#me (current user)

GET    /users                       → users#index
GET    /users/:id                   → users#show
PATCH  /users/:id                   → users#update
DELETE /users/:id                   → users#destroy
GET    /users/:user_id/profile      → profiles#show
PATCH  /users/:user_id/profile      → profiles#update
GET    /users/:user_id/comments     → comments#index

GET    /meetups                     → meetups#index (paginated, 10/page)
POST   /meetups                     → meetups#create
GET    /meetups/:id                 → meetups#show (extended view with comments)
PATCH  /meetups/:id                 → meetups#update
DELETE /meetups/:id                 → meetups#destroy
POST   /meetups/:id/join            → meetup_participants#create
DELETE /meetups/:id/leave           → meetup_participants#destroy
GET    /meetups/:meetup_id/comments → comments#index
POST   /meetups/:meetup_id/comments → comments#create

GET    /locations/:id               → locations#show
PATCH  /locations/:id               → locations#update
```

**Key validation rules:**

- Meetup start time must be in the future
- Meetup end time must be after start time
- Meetup duration cannot exceed 48 hours
- Guest count: 1–50
- ZIP code: 5-digit or ZIP+4 format (`12345` or `12345-6789`)
- Comment content: max 2000 characters
- Username: 3–30 characters, alphanumeric + underscore, unique
- Password: minimum 6 characters, at least one letter and one number
- Participants: unique per meetup (no duplicate joins)

---

## Project Specifications

All feature specifications live in [`project-specs/`](project-specs/):

| File | Description |
|---|---|
| [`MIGHTY_MAPS.md`](project-specs/MIGHTY_MAPS.md) | Leaflet + Nominatim integration — GeocodingService, ReverseGeocodingService, interactive map picker, Locate Me button |
| [`MEETUP_DETAIL_SPEC.md`](project-specs/MEETUP_DETAIL_SPEC.md) | Meetup detail page — map display, join/leave, comments section |
| [`JOIN_LEAVE_SPEC.md`](project-specs/JOIN_LEAVE_SPEC.md) | Join/leave feature — MeetupParticipant model, uniqueness constraints, participant count |
| [`PHASE_3_COMMENTS_SPEC.md`](project-specs/PHASE_3_COMMENTS_SPEC.md) | Comments feature — polymorphic model, nested routes, form with char counter |
| [`UI_UX_AGENT_TEAMS.md`](project-specs/UI_UX_AGENT_TEAMS.md) | Tailwind v4 design guidelines, component padding rules, button styles, dark mode |
| [`GAP_ANALYSIS.md`](project-specs/GAP_ANALYSIS.md) | Gap analysis tracking features completed vs. target |
| [`TEST_AUDIT.md`](project-specs/TEST_AUDIT.md) | Test coverage audit across unit and E2E layers |

---

## Deployment

| Target | Platform | Config |
|---|---|---|
| Frontend | Vercel | [`vercel.json`](FE-Mighty_Mileage_Meetup/vercel.json) |
| Backend | Kamal (Docker) | `config/deploy.yml` |
| DB (prod) | PostgreSQL | `DATABASE_URL` environment variable |
| DB (dev) | SQLite3 | `db/development.sqlite3` |

---

## Critical Build Notes

**Tailwind v4 + Angular esbuild**

Angular's `@angular/build:application` (esbuild) ignores `postcss.config.js`. It only reads `.postcssrc.json` (or `postcss.config.json`). The frontend uses `.postcssrc.json`:

```json
{ "plugins": { "@tailwindcss/postcss": {} } }
```

Without this, `@import "tailwindcss"` resolves to the static Tailwind index file — you get the `@layer`/`@theme` scaffolding but zero utility class generation. If styles stop appearing after a dependency update, verify `.postcssrc.json` is intact and run `npm run build` to confirm.

**JWT and external APIs**

The `authTokenInterceptor` attaches the app's JWT to every outgoing HTTP request. Sending app tokens to `nominatim.openstreetmap.org` would be a security leak. The `GeocodingService` and `ReverseGeocodingService` both opt out using the `SKIP_AUTH` context token:

```ts
// Exported from auth-token-interceptor.ts
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

// Used in geocoding services
context: new HttpContext().set(SKIP_AUTH, true)
```

**Leaflet in unit tests**

Leaflet requires a real DOM and fails in `happy-dom`. Any component that imports `MapComponent` must override it in tests:

```ts
overrideComponent(MapComponent, {
  set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
})
```

**Geolocation in unit tests**

Stub the global navigator before tests that exercise the Locate Me feature:

```ts
vi.stubGlobal('navigator', { geolocation: { getCurrentPosition: ... } });
afterEach(() => vi.unstubAllGlobals());
```
