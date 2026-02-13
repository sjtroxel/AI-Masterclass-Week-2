---
description: Enforces Rails 8 conventions for the Mighty_Mileage_Meetup-api backend
paths: ["Mighty_Mileage_Meetup-api/**"]
---

# Rails 8 Style Rules

## General

- This is a **Rails 8.0.2 API-only** application. Never add view templates, helpers, or asset pipeline code.
- Follow **RuboCop Omakase** conventions. Run `bin/rubocop` before committing and fix all offenses.
- Use Ruby 3.4.4 idioms (pattern matching, endless methods where appropriate, frozen string literals).

## Models

- Use `has_secure_password` for password fields (bcrypt). Never store plaintext passwords.
- Use Active Record validations (`validates`, `validate`) — not manual checks in controllers.
- Use `scope` for reusable query logic instead of class methods returning queries.
- Use polymorphic associations where a model belongs to multiple parents (this project uses them for Location and Comment).
- Keep models fat and controllers skinny — business logic belongs in models or POROs, not controllers.

## Controllers

- Inherit from `ApplicationController` (which inherits `ActionController::API`).
- Use strong parameters (`params.require(...).permit(...)`) for all create/update actions.
- Use `before_action` for shared logic (authentication, loading records).
- Return JSON via **Blueprinter** (`ModelBlueprint.render_as_hash`). Do not use `render json: model.as_json` or JBuilder.
- Use standard REST actions: `index`, `show`, `create`, `update`, `destroy`. Avoid custom actions when a new resource would be more RESTful.
- Use HTTP status codes correctly: `200` ok, `201` created, `204` no_content for destroy, `401` unauthorized, `404` not_found, `422` unprocessable_entity.

## Routes

- Define routes as RESTful `resources` with `only:` to limit exposed actions.
- Nest related resources (e.g., comments and participants under meetups).
- Keep `config/routes.rb` flat and readable — avoid deep nesting beyond two levels.

## Authentication

- JWT-based auth is handled in `ApplicationController`. Use `before_action :authorize_request` to protect endpoints.
- Token generation and decoding live in the base controller. Do not duplicate this logic.

## Serialization

- Use Blueprinter blueprints in `app/blueprints/`. One blueprint per model.
- Define views (`:normal`, `:extended`, etc.) to control field exposure per endpoint.

## Database

- Use SQLite3 for development and test. Production uses PostgreSQL.
- Write reversible migrations. Prefer `change` over `up`/`down` when possible.
- Add database-level constraints (not null, unique indexes) alongside model validations.
- Use `bin/rails db:prepare` for setup (creates if needed, then migrates).

## Testing

- Use **Minitest** (not RSpec). Test files go in `test/`.
- Model tests in `test/models/`, controller/integration tests in `test/controllers/`.
- Use fixtures in `test/fixtures/` for test data.
- Run tests with `bin/rails test`. Run a single file with `bin/rails test test/path/to_test.rb`.

## Security

- Run `bin/brakeman --no-pager` to check for security vulnerabilities before merging.
- Never disable CSRF protection (already off in API-only mode — keep it that way).
- Never log or expose JWT secrets, passwords, or tokens in responses.
- Use `rack-cors` configuration in `config/initializers/cors.rb` to control allowed origins.

## Code Organization

- `app/blueprints/` — Blueprinter serializers
- `app/controllers/` — API controllers
- `app/models/` — ActiveRecord models
- `app/jobs/` — Background jobs (ActiveJob)
- `config/initializers/` — CORS, inflections, and other boot-time config
- `test/` — Minitest tests and fixtures
