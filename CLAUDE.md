# Mighty Mileage Meetup - Monorepo

Monorepo with an Angular 20 frontend and a Rails 8 API backend.

## Project Layout

- `FE-Mighty_Mileage_Meetup/` — Angular 20.1 SPA (TypeScript 5.8, SCSS)
- `Mighty_Mileage_Meetup-api/` — Rails 8.0.2 API-only (Ruby 3.4.4)

## Usage

### Frontend (Angular)

```sh
cd FE-Mighty_Mileage_Meetup
npm install                # install dependencies
npm start                  # dev server on http://localhost:4200
npm run build              # production build
npm run watch              # dev build in watch mode
```

### Frontend Build Rules (CRITICAL)
- **PostCSS:** Never use `postcss.config.js`. Angular's builder only respects `.postcssrc.json`.
- **Tailwind v4:** All utility classes are generated via `@tailwindcss/postcss` through the `.postcssrc.json` bridge.
- **Troubleshooting:** If styles aren't appearing, verify `.postcssrc.json` exists and run `npm run build`.

### Backend (Rails)

```sh
cd Mighty_Mileage_Meetup-api
bundle install             # install dependencies
bin/rails db:prepare       # create + migrate database
bin/dev                    # dev server on http://localhost:3000
bin/rails server           # alternative: start Puma directly
./bin/setup                # full setup (install, db, clean logs)
```

- Dev/test database: SQLite3
- Production database: PostgreSQL (via `DATABASE_URL`)

## Lint / Test

### Frontend

```sh
cd FE-Mighty_Mileage_Meetup
npm test                   # Karma + Jasmine unit tests
```

No dedicated lint command is configured. TypeScript strict mode and Angular strict templates enforce type safety. Prettier handles formatting (Angular HTML parser for templates).

### Backend

```sh
cd Mighty_Mileage_Meetup-api
bin/rubocop                # RuboCop lint (Omakase preset)
bin/rails test             # Minitest suite
bin/brakeman --no-pager    # security vulnerability scan
```

CI runs all three checks (brakeman, rubocop, minitest) on PRs and pushes to main.

### Running a single Rails test file

```sh
bin/rails test test/models/user_test.rb
```

### Running a single Rails test by name

```sh
bin/rails test test/models/user_test.rb -n test_some_method
```

## Git

- **Never** add a `Co-Authored-By` line to commit messages. All commits must show as authored by sjtroxel only.
- **Commit Pattern** - use descriptive lowercase messages (e.g. padding on meetup cards).

## Style Guidelines

### Frontend (Angular / TypeScript)

- **Angular 20 standalone components** — no NgModules
- **Strict TypeScript** — `strict: true`, `noImplicitReturns`, `noFallthroughCasesInSwitch`
- **Strict Angular templates** — `strictTemplates: true`, `strictInjectionParameters: true`
- **SCSS** for all component styles (configured in angular.json schematics)
- **2-space indentation**, single quotes for TypeScript, UTF-8 (`.editorconfig`)
- **Prettier** for formatting; HTML files use the `angular` parser
- Structure: `core/` (services, guards, interceptors), `features/` (domain components), `pages/` (routed views), `shared/` (models, common components)
- Test files live alongside source files as `*.spec.ts`

### Backend (Rails / Ruby)

- **Rails 8 API-only** — `config.api_only = true`
- **RuboCop Omakase** — follow `rubocop-rails-omakase` conventions (see `.rubocop.yml`)
- **Blueprinter** for JSON serialization (not JBuilder or ActiveModel Serializers)
- **JWT** for authentication (handled in `ApplicationController`)
- **bcrypt** (`has_secure_password`) for password hashing
- **Minitest** for testing (not RSpec)
- **Kaminari** for pagination
- Models: User, Meetup, Profile, Location (polymorphic), Comment (polymorphic), MeetupParticipant
- Routes: RESTful resources with nested comments and participants
