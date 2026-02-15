# Meetup Detail Page with Comments — Technical Spec

## Overview

Add a `/meetups/:id` detail page that displays full meetup information and a comment thread. All backend endpoints already exist — this is a frontend-only feature.

---

## 1. API Endpoints Used

### GET /meetups/:id (public — no auth required)

Returns a single meetup using the `:extended` blueprint view, which includes comments.

**Response shape** (Blueprinter renders as a JSON string):
```json
{
  "id": 1,
  "title": "Morning Run",
  "activity": "run",
  "start_date_time": "2026-03-01T08:00:00.000Z",
  "end_date_time": "2026-03-01T10:00:00.000Z",
  "guests": 10,
  "created_at": "...",
  "updated_at": "...",
  "user": {
    "id": 1,
    "first_name": "Jane",
    "last_name": "Doe",
    "username": "janedoe",
    "email": "jane@example.com"
  },
  "location": {
    "id": 1,
    "address": "123 Main St",
    "city": "Austin",
    "state": "TX",
    "zip_code": "78701",
    "country": "US"
  },
  "meetup_participants": [
    { "id": 1, "user_id": 2, "meetup_id": 1, "user": { ... } }
  ],
  "comments": [
    { "id": 1, "content": "Can't wait!", "created_at": "...", "updated_at": "...", "user": { ... } }
  ]
}
```

### GET /meetups/:meetup_id/comments (auth required)

Paginated comment list (10 per page, Kaminari).

**Response:**
```json
{
  "comments": "<JSON string of Comment[]>",
  "total_pages": 1,
  "current_page": 1
}
```

### POST /meetups/:meetup_id/comments (auth required)

Create a new comment.

**Request:** `{ "comment": { "content": "Great meetup!" } }`

**Response (201):** Single `Comment` object (hash, not string).

---

## 2. New TypeScript Interface

**File:** `FE-Mighty_Mileage_Meetup/src/app/shared/models/comment.ts`

```typescript
import { MeetupUser } from './meetup';

export interface Comment {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user: MeetupUser;
}
```

This matches the `CommentBlueprint` output exactly: `id`, `content`, `created_at`, `updated_at`, plus an associated `user` (via `UserBlueprint`).

---

## 3. Route Structure

**File:** `FE-Mighty_Mileage_Meetup/src/app/app.routes.ts`

Add a new route **before** the wildcard redirect:

```typescript
{
  path: 'meetups/:id',
  loadComponent: () =>
    import('./pages/meetup-detail/meetup-detail').then((c) => c.MeetupDetailComponent),
  canActivate: [authGuard],
},
```

- Protected by `authGuard` (comments require authentication, so the whole page is auth-gated).
- Lazy-loaded, consistent with existing routes.

---

## 4. New Service

**File:** `FE-Mighty_Mileage_Meetup/src/app/core/services/comment.ts`

```
CommentService (providedIn: 'root')
├── getComments(meetupId: number, page?: number)  → calls GET /meetups/:id/comments
├── addComment(meetupId: number, content: string) → calls POST /meetups/:id/comments
│
├── Signals:
│   comments      → Signal<Comment[]>      (read-only)
│   loading       → Signal<boolean>         (read-only)
│   totalPages    → Signal<number>          (read-only)
│   currentPage   → Signal<number>          (read-only)
│
└── clearComments()  → resets state when navigating away
```

Follows the same signal-based pattern as the existing `MeetupService`.

---

## 5. New Components

### MeetupDetailComponent (page)

**Location:** `FE-Mighty_Mileage_Meetup/src/app/pages/meetup-detail/`

**Files:** `meetup-detail.ts`, `meetup-detail.html`, `meetup-detail.scss`

**Responsibilities:**
- Read `:id` from route params via `ActivatedRoute`
- Call `MeetupService` to load the single meetup (`GET /meetups/:id`)
- Display meetup title, activity, dates, location, organizer, participant count
- Embed comment list and comment form
- "Back to Dashboard" link

**Note:** The existing `MeetupService` doesn't have a `getMeetup(id)` method yet. We'll add one that calls `GET /meetups/:id` and returns the extended view (which includes comments inline). This avoids needing a separate comments fetch on initial load.

### CommentListComponent (feature)

**Location:** `FE-Mighty_Mileage_Meetup/src/app/features/comment/comment-list/`

**Responsibilities:**
- Receive comments as an `input()`
- Render each comment: author username, content, timestamp
- Pagination controls (if `totalPages > 1`)

### CommentFormComponent (feature)

**Location:** `FE-Mighty_Mileage_Meetup/src/app/features/comment/comment-form/`

**Responsibilities:**
- Reactive form with a single `content` textarea (max 2000 chars, matching backend validation)
- Submit calls `CommentService.addComment()`
- Emit event on success so parent can refresh the comment list
- Clear form on successful submit

---

## 6. Phase 1 Task Breakdown

| # | Task | Files Created / Modified |
|---|------|--------------------------|
| 1 | Create `Comment` interface | `shared/models/comment.ts` (new) |
| 2 | Create `CommentService` | `core/services/comment.ts` (new) |
| 3 | Add `getMeetup(id)` method to `MeetupService` | `core/services/meetup.ts` (edit) |
| 4 | Add `/meetups/:id` route | `app.routes.ts` (edit) |
| 5 | Create `MeetupDetailComponent` (page) | `pages/meetup-detail/` (new, 3 files) |
| 6 | Create `CommentListComponent` | `features/comment/comment-list/` (new, 3 files) |
| 7 | Create `CommentFormComponent` | `features/comment/comment-form/` (new, 3 files) |
| 8 | Add navigation link from dashboard meetup cards | `features/meetup/meetup-card/` (edit) |

**No backend changes required.**
