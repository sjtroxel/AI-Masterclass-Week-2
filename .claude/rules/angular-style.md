---
description: Enforces Angular 20 conventions for the FE-Mighty_Mileage_Meetup frontend
paths: ["FE-Mighty_Mileage_Meetup/**"]
---

# Angular 20 Style Rules

## Components

- Use **standalone components** exclusively. Never create or reference NgModules.
- Generate components with the Angular CLI (`ng generate component`) to ensure consistent file scaffolding.
- Component files: `name.ts`, `name.html`, `name.scss`, `name.spec.ts` — all co-located.
- Use **SCSS** for all styles (configured in angular.json schematics). Never use plain CSS or inline styles.

## TypeScript

- **Strict mode is on** — do not loosen `tsconfig.json` strictness settings.
- Target ES2022. Use modern syntax: optional chaining, nullish coalescing, `using` declarations where appropriate.
- Use **single quotes** for strings (enforced by `.editorconfig`).
- Use **2-space indentation** (enforced by `.editorconfig`).
- Prefer `readonly` for properties that should not be reassigned.
- Prefer interfaces over type aliases for object shapes.

## Templates

- **Strict template type checking is on** (`strictTemplates: true`). Do not use `$any()` to bypass type errors — fix the types instead.
- Use Angular control flow (`@if`, `@for`, `@switch`) instead of structural directives (`*ngIf`, `*ngFor`).

## Project Structure

- `core/` — Singleton services, guards, and HTTP interceptors. Imported once at the app level.
- `features/` — Domain-specific components grouped by feature (e.g., `meetup/`).
- `pages/` — Routed page components (dashboard, login, signup).
- `shared/` — Reusable components, models, and pipes used across features.
- Do not put business logic in page components — delegate to services in `core/`.

## Routing

- Define routes in `app.routes.ts` as a flat array of `Route` objects.
- Use lazy loading (`loadComponent`) for page-level routes.
- Use auth guards (`authGuard`, `noAuthGuard`) to protect routes.

## Services & HTTP

- Use the `HttpClient` via Angular's `provideHttpClient()`.
- Use the auth token interceptor (`authTokenInterceptor`) for attaching JWT headers — do not manually set auth headers in individual services.
- Return `Observable` types from service methods. Let components subscribe or use `async` pipe.

## Testing

- Write unit tests in co-located `*.spec.ts` files using **Jasmine** with **Karma**.
- Run tests with `npm test`.
- Use `TestBed` for component and service tests.

## Formatting

- **Prettier** handles formatting. Do not add manual formatting rules that conflict.
- HTML templates use the `angular` Prettier parser.

## Styling & Tailwind v4

- **Tailwind v4 Utilities:** Use Tailwind for layout (flex, grid), colors, and typography.
- **The Padding Rule (Nuclear Reset):** NEVER use Tailwind `p-` classes for the outermost container of a component (where the border/background is). 
- **Internal Gutter Pattern:** 1. Add an `.inner-container` class to the main `div` or `form` in the HTML template.
  2. In the component's `.scss` file, apply internal padding:
     ```scss
     .inner-container { padding: 1.5rem !important; } // 2rem for forms
     ```
- **Component Host:** Set `:host { display: block; }` in every component SCSS to ensure proper layout.
- **Buttons:** Use the global button classes (`btn-primary`, `btn-secondary`, `btn-danger`). Do not reinvent button styles with utility classes.