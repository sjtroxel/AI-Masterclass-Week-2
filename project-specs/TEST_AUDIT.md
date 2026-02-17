# Test Audit — Mighty Mileage Meetup Monorepo

**Date:** 2026-02-17
**Status:** Baseline snapshot — no fixes applied yet

---

## 1. The Zombie Files

Files that exist but contain **zero real test logic** — just auto-generated boilerplate from `ng generate` or `rails generate`.

### Angular (.spec.ts) — 11 files, ALL zombies

Every single spec file is a scaffold stub. They contain only a `should create` / `should be created` assertion that checks `toBeTruthy()`. None test actual behavior.

| File | What it "tests" | Verdict |
|------|----------------|---------|
| `app.spec.ts` | `expect(app).toBeTruthy()` + checks for an `<h1>` that no longer exists | Zombie (also broken) |
| `core/services/authentication.spec.ts` | `expect(service).toBeTruthy()` | Zombie |
| `core/services/meetup.spec.ts` | `expect(service).toBeTruthy()` | Zombie |
| `core/auth-guard.spec.ts` | `expect(executeGuard).toBeTruthy()` | Zombie |
| `core/no-auth-guard.spec.ts` | `expect(executeGuard).toBeTruthy()` | Zombie |
| `core/auth-token-interceptor.spec.ts` | `expect(interceptor).toBeTruthy()` | Zombie |
| `pages/login/login.spec.ts` | `expect(component).toBeTruthy()` | Zombie |
| `pages/signup/signup.spec.ts` | `expect(component).toBeTruthy()` | Zombie |
| `pages/dashboard/dashboard.spec.ts` | Entirely commented out | Zombie (dead dead) |
| `features/meetup/meetup-form/meetup-form.spec.ts` | `expect(component).toBeTruthy()` | Zombie |
| `features/meetup/meetup-card/meetup-card.spec.ts` | `expect(component).toBeTruthy()` | Zombie |

**Missing spec files entirely** (no `.spec.ts` at all):
- `core/services/comment.ts` (CommentService)
- `features/comment/comment-list/comment-list.ts`
- `features/comment/comment-form/comment-form.ts`
- `pages/meetup-detail/meetup-detail.ts`

### Rails (_test.rb) — 13 files, ALL zombies

Every model test has only the commented-out `# test "the truth"` placeholder. The two controller tests that aren't commented out (`UsersControllerTest`, `SessionsControllerTest`) use incorrect route helpers and wrong HTTP methods — they would fail immediately.

| File | What it "tests" | Verdict |
|------|----------------|---------|
| `test/models/user_test.rb` | Commented-out placeholder | Zombie |
| `test/models/meetup_test.rb` | Commented-out placeholder | Zombie |
| `test/models/comment_test.rb` | Commented-out placeholder | Zombie |
| `test/models/profile_test.rb` | Commented-out placeholder | Zombie |
| `test/models/location_test.rb` | Commented-out placeholder | Zombie |
| `test/models/meetup_participant_test.rb` | Commented-out placeholder | Zombie |
| `test/controllers/users_controller_test.rb` | `get users_index_url` — wrong route helper | Zombie (broken) |
| `test/controllers/sessions_controller_test.rb` | `get sessions_create_url` — should be POST, wrong route | Zombie (broken) |
| `test/controllers/meetups_controller_test.rb` | Commented-out placeholder | Zombie |
| `test/controllers/meetup_participants_controller_test.rb` | Commented-out placeholder | Zombie |
| `test/controllers/comments_controller_test.rb` | Commented-out placeholder | Zombie |
| `test/controllers/locations_controller_test.rb` | Commented-out placeholder | Zombie |
| `test/controllers/profiles_controller_test.rb` | Commented-out placeholder | Zombie |

**Additional Rails infrastructure issue:** `test/test_helper.rb` is **missing entirely**. This means `bin/rails test` crashes with `LoadError: cannot load such file -- test_helper` before any test can run.

**Fixtures are also broken:** `test/fixtures/users.yml` uses raw `password_digest: MyString` and non-unique emails/usernames — these won't pass model validations.

---

## 2. Critical Gaps

These are the areas that handle **authentication, authorization, data mutation, or sensitive user data** and have absolutely zero test coverage.

### Severity: CRITICAL (auth & security)

| Layer | File | What it does | Test coverage |
|-------|------|-------------|---------------|
| **Rails** | `application_controller.rb` | JWT encode/decode, `authenticate_request` — the entire auth backbone | **None** |
| **Rails** | `sessions_controller.rb` | Login (`POST /login`), logout, `/me` endpoint | **None** (broken stub only) |
| **Rails** | `users_controller.rb` | User registration (`POST /signup`), returns JWT on create | **None** (broken stub only) |
| **Rails** | `user.rb` | `has_secure_password`, email/username uniqueness, password format validation | **None** |
| **Angular** | `authentication.ts` | Token storage (localStorage), login/signup HTTP calls, `isLoggedIn()`, `logout()` | **None** |
| **Angular** | `auth-guard.ts` | Route protection — redirects unauthenticated users to `/login` | **None** |
| **Angular** | `no-auth-guard.ts` | Prevents logged-in users from accessing login/signup | **None** |
| **Angular** | `auth-token-interceptor.ts` | Injects `Authorization: Bearer` header on every request | **None** |

### Severity: HIGH (data integrity)

| Layer | File | What it does | Test coverage |
|-------|------|-------------|---------------|
| **Rails** | `meetups_controller.rb` | CRUD + ownership authorization (only creator can edit/delete) | **None** |
| **Rails** | `meetup.rb` | Validations: future start date, end > start, 48hr duration cap, activity enum | **None** |
| **Rails** | `comments_controller.rb` | Polymorphic comment creation, auth-gated | **None** |
| **Rails** | `meetup_participants_controller.rb` | Join/leave meetup, duplicate prevention | **None** |
| **Rails** | `meetup_participant.rb` | Uniqueness validation (user can't join twice) | **None** |
| **Angular** | `meetup.ts` (MeetupService) | All meetup CRUD, signal state management, join/leave | **None** |
| **Angular** | `comment.ts` (CommentService) | Comment CRUD, pagination signals | **None** (no spec file) |

### Severity: MEDIUM (UI components)

| Layer | File | What it does | Test coverage |
|-------|------|-------------|---------------|
| **Angular** | `meetup-form.ts` | Reactive form with validation, edit mode detection | **None** |
| **Angular** | `meetup-card.ts` | Display component with join/leave/edit/delete actions | **None** |
| **Angular** | `comment-form.ts` | Character counter, submit handler | **None** (no spec file) |
| **Angular** | `comment-list.ts` | Input-bound display component | **None** (no spec file) |
| **Angular** | `meetup-detail.ts` | Route-driven detail page, seeds comments via effect() | **None** (no spec file) |
| **Angular** | `dashboard.ts` | Main page, loads meetups | **None** (spec commented out) |

---

## 3. The Low-Hanging Fruit

These 3 files would give you the **most testing momentum with the least effort**:

### 1. `Mighty_Mileage_Meetup-api/app/models/user.rb` → `test/models/user_test.rb`
**Why it's easy:** Pure model validations — no HTTP, no mocking, no controller setup. The `User` model has 8+ validation rules (presence, uniqueness, format, length) that map 1:1 to simple assertions. Each test is ~3 lines.

**Example tests to write:**
- Valid user saves successfully
- Missing `first_name` fails validation
- Duplicate `username` fails validation
- Password without a number fails format validation
- Username with special characters fails custom validator
- Email with invalid format fails validation

**Estimated effort:** ~30 minutes for 10+ meaningful tests

### 2. `Mighty_Mileage_Meetup-api/app/models/meetup.rb` → `test/models/meetup_test.rb`
**Why it's easy:** Also pure model validations, but with more interesting custom validators (`start_in_future`, `end_after_start`, `duration_within_limit`). Testing time-based logic is a great learning exercise and these are self-contained private methods.

**Example tests to write:**
- Valid meetup saves successfully
- Start date in the past fails validation
- End date before start date fails
- Duration > 48 hours fails
- Invalid activity type fails inclusion validation
- Guests > 50 or < 1 fails numericality

**Estimated effort:** ~30 minutes for 8+ meaningful tests

### 3. `Mighty_Mileage_Meetup-api/app/models/meetup_participant.rb` → `test/models/meetup_participant_test.rb`
**Why it's easy:** Only one validation rule (uniqueness scoped to meetup), plus two `belongs_to` associations. This is the simplest model in the entire app — a confidence-building "quick win" that also covers an important data integrity constraint (no duplicate joins).

**Example tests to write:**
- Valid participant saves successfully
- Same user joining same meetup twice fails uniqueness
- Participant must belong to a user
- Participant must belong to a meetup

**Estimated effort:** ~15 minutes for 4 meaningful tests

---

## 4. The Red Report — Baseline Run

### Rails: `bin/rails test`

```
RESULT: CRASH — cannot run at all

LoadError: cannot load such file -- test_helper
```

**Root cause:** `test/test_helper.rb` does not exist. This file is required by every test file and bootstraps the Rails test environment. Without it, the test runner crashes before executing a single test.

**Fixture issues (will surface after test_helper is created):**
- `users.yml` has `password_digest: MyString` — not a valid bcrypt hash
- `users.yml` has duplicate `email: MyString` / `username: MyString` — will fail uniqueness constraints
- `meetups.yml` has `activity: MyString` — not in the `%w[run bicycle]` inclusion list
- `meetups.yml` has `start_date_time: 2025-08-25` — in the past, will fail `start_in_future` validation
- `meetups.yml` is missing `title` — will fail presence validation

**Tests that would run:** 0 passing, 0 failing — **total crash**

### Angular: `npx ng test --watch=false`

```
RESULT: BUILD FAILURE — 7 TypeScript compilation errors

TS2305: Module '"./authentication"' has no exported member 'Authentication'
TS2459: Module '"./meetup"' declares 'Meetup' locally, but it is not exported
TS2305: Module '"./meetup-card"' has no exported member 'MeetupCard'
TS2305: Module '"./meetup-form"' has no exported member 'MeetupForm'
TS2305: Module '"./login"' has no exported member 'Login'
TS2305: Module '"./signup"' has no exported member 'Signup'
TS2305: Module '"./navbar"' has no exported member 'Navbar'
```

**Root cause:** The spec files were generated when classes used different export names. The actual classes are now named `AuthenticationService`, `MeetupService`, `MeetupCardComponent`, etc., but the specs still import the old names (`Authentication`, `Meetup`, `MeetupCard`, etc.). The specs have never been updated to match refactored class names.

**Tests that would run:** 0 passing, 0 failing — **build crash, no tests execute**

---

## 5. Summary Scorecard

| Metric | Angular | Rails | Total |
|--------|---------|-------|-------|
| Test files that exist | 11 | 13 | 24 |
| Files with real test logic | 0 | 0 | **0** |
| Source files missing a test file entirely | 4 | 0 | 4 |
| Test suite runnable? | No (build errors) | No (missing test_helper) | **Neither** |
| Effective test coverage | 0% | 0% | **0%** |

### Before writing any new tests, two blockers must be fixed:
1. **Rails:** Create `test/test_helper.rb` and fix all fixtures
2. **Angular:** Fix import names in all existing spec files (or delete and regenerate them)
