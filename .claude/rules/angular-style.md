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
