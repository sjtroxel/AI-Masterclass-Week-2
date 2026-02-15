# Gap Analysis & Feature Suggestions

## 1. Backend Models & Endpoints

| Model | Key Endpoints |
|-------|--------------|
| **User** | `POST /signup`, `POST /login`, `DELETE /logout`, `GET /me`, `GET /users`, `GET /users/:id`, `PATCH /users/:id`, `DELETE /users/:id` |
| **Profile** | `GET /users/:user_id/profile`, `PATCH /users/:user_id/profile` |
| **Location** | `GET /locations/:id`, `PATCH /locations/:id` (polymorphic — belongs to User or Meetup) |
| **Meetup** | Full CRUD: `GET /meetups`, `POST /meetups`, `GET /meetups/:id`, `PATCH /meetups/:id`, `DELETE /meetups/:id` |
| **MeetupParticipant** | `POST /meetups/:meetup_id/join`, `DELETE /meetups/:meetup_id/leave` |
| **Comment** | `GET /meetups/:meetup_id/comments`, `POST /meetups/:meetup_id/comments`, `GET /users/:user_id/comments`, `POST /users/:user_id/comments` |

## 2. Frontend Components & Services

| Component / Service | Covers |
|---------------------|--------|
| **LoginComponent** | `POST /login` |
| **SignupComponent** | `POST /signup` |
| **DashboardComponent** | `GET /meetups` (list) |
| **MeetupFormComponent** | `POST /meetups`, `PATCH /meetups/:id` (create/edit modal) |
| **MeetupCardComponent** | `DELETE /meetups/:id`, `POST /meetups/:id/join`, `DELETE /meetups/:id/leave` |
| **NavbarComponent** | `DELETE /logout` |
| **AuthenticationService** | login, signup, token management |
| **MeetupService** | meetup CRUD, join/leave |

## 3. Gaps — Backend features with NO frontend UI

| Gap | Backend Ready? | Frontend Exists? | Notes |
|-----|:-:|:-:|-------|
| **User Profile (view & edit bio)** | YES — `GET/PATCH /users/:user_id/profile` | NO | Profile model has `bio` field; ProfileBlueprint serializes it. No profile page or service in Angular. |
| **Comments on Meetups** | YES — `GET/POST /meetups/:id/comments` | NO | Comment model + controller + blueprint all exist. MeetupBlueprint `:extended` view includes comments. No comment UI or service in Angular. |
| **Comments on Users** | YES — `GET/POST /users/:id/comments` | NO | Same polymorphic Comment system, but for user walls. No UI. |
| **User Location (view & edit)** | YES — `PATCH /locations/:id`, nested in user update | NO | Users can have a location. No UI to set or display it. |
| **Meetup Detail Page** | YES — `GET /meetups/:id` (extended view with comments) | NO | Backend serves single-meetup detail with comments. Frontend only has a card list — no dedicated detail/show route. |
| **User List / User Profiles** | YES — `GET /users`, `GET /users/:id` | NO | Backend can list and show users. No user directory or public profile page in Angular. |

## 4. Suggested Feature Goals

Below are three features ranked by impact and learning value. Each builds on an existing backend API with zero backend changes needed.

---

### Feature 1: Meetup Detail Page with Comments
**Build a `/meetups/:id` detail page that shows full meetup info and a live comment thread.**

- **New route**: `/meetups/:id` → `MeetupDetailComponent`
- **New service**: `CommentService` — calls `GET /meetups/:id/comments` and `POST /meetups/:id/comments`
- **New components**: `MeetupDetailComponent` (page), `CommentListComponent`, `CommentFormComponent`
- **Skills practiced**: Angular routing with params, reactive forms, new service creation, nested API calls
- **Scope**: Medium — 1 new service, 1 new route, 2–3 new components

---

### Feature 2: User Profile Page
**Build a `/profile` page where the logged-in user can view and edit their bio and location.**

- **New route**: `/profile` → `ProfileComponent`
- **New service**: `ProfileService` — calls `GET /users/:id/profile`, `PATCH /users/:id/profile`, and `PATCH /users/:id` (for location)
- **New components**: `ProfileComponent` (page), optionally a `ProfileFormComponent`
- **Skills practiced**: Reactive forms with nested data (location_attributes), PATCH requests, signal-based state
- **Scope**: Small-to-medium — 1 new service, 1 new route, 1–2 new components

---

### Feature 3: User Directory with Public Profiles
**Build a `/users` listing page and a `/users/:id` public profile showing user info, their meetups, and a comment wall.**

- **New routes**: `/users` → `UserListComponent`, `/users/:id` → `UserDetailComponent`
- **New service**: `UserService` — calls `GET /users`, `GET /users/:id`, plus comment endpoints
- **New components**: `UserListComponent`, `UserDetailComponent`, `UserCommentWallComponent`
- **Skills practiced**: Pagination (Kaminari-backed), multiple new routes, reading/writing polymorphic comments
- **Scope**: Large — 1 new service, 2 new routes, 3+ new components
