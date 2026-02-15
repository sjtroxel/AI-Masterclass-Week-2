# Meetup Detail — Phase 3: Comments

## Overview

Wire up the comment thread on the meetup detail page. All backend endpoints are in place.
This is a frontend-only feature implemented in three steps.

---

## API Endpoints

### GET /meetups/:id (public)
Returns the extended meetup view including an inline `comments` array. Used on initial page load — no separate comment fetch needed.

### GET /meetups/:meetup_id/comments (auth required)
Paginated comment list (10/page, Kaminari). Used for page-change navigation.

### POST /meetups/:meetup_id/comments (auth required)
Create a new comment. Request: `{ "comment": { "content": "..." } }`. Returns the created `Comment`.

---

## TypeScript Interface

**`shared/models/comment.ts`** ✅ complete

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

---

## Service

**`core/services/comment.ts`** ✅ complete

```
CommentService (providedIn: 'root')
├── getComments(meetupId, page?)   → GET /meetups/:id/comments
├── addComment(meetupId, content)  → POST /meetups/:id/comments
├── seedComments(comments)         → sets internal signal directly (no HTTP)
├── clearComments()                → resets state on navigation away
│
└── Signals (read-only):
    comments      Signal<Comment[]>
    loading       Signal<boolean>
    totalPages    Signal<number>
    currentPage   Signal<number>
```

`seedComments()` is called by `MeetupDetailComponent` after `getMeetup()` resolves, to populate
the comment list from the inline data without a redundant HTTP call.

---

## Step 1: CommentListComponent ✅ complete

**`features/comment/comment-list/`**

- `comment-list.ts` — standalone, `app-comment-list` selector
- `comment-list.html` — `@for` loop, empty state, `DatePipe` for timestamps
- `comment-list.scss` — left accent border per comment, BEM classes, CSS variables

**Input:** `comments = input.required<Comment[]>()` — pure dumb component, no service injection.

---

## Step 2: CommentFormComponent 🔄 in progress

**`features/comment/comment-form/`**

- `comment-form.ts`
- `comment-form.html`
- `comment-form.scss`

### TypeScript details

- Standalone, `app-comment-form` selector
- `meetupId = input.required<number>()`
- Injects `CommentService` and `DestroyRef` via `inject()`
- Reactive form via `FormBuilder` (constructor injection)
- Single `content` control: `[Validators.required, Validators.maxLength(2000)]`
- **Character counter**: `contentLengthSignal = signal(0)` updated via `valueChanges.pipe(takeUntilDestroyed(this.destroyRef))` — no manual `OnDestroy`
- `onSubmit()`: calls `commentService.addComment(meetupId(), content)`, resets form

### Template details

- `<textarea formControlName="content" rows="3">` with `maxlength="2000"`
- Live counter: `{{ charCount() }} / 2000` with `near-limit` CSS class when > 1800 chars
- Submit button disabled when `form.invalid`

---

## Step 3: Update MeetupDetailComponent 🔄 in progress

**`pages/meetup-detail/meetup-detail.ts`** + `.html`

### TypeScript changes

- New imports: `DestroyRef`, `ElementRef`, `ViewChild`, `effect` from `@angular/core`; `CommentService`, `CommentListComponent`, `CommentFormComponent`
- Inject `CommentService` (protected — accessible in template)
- Inject `DestroyRef`
- Add `@ViewChild('commentBottom') commentBottom?: ElementRef`
- Store `meetupId: number` property (set in `ngOnInit`, bound to `<app-comment-form>`)
- Add `CommentListComponent` and `CommentFormComponent` to the `imports` array

**Constructor (new):**
```typescript
constructor() {
  effect(() => {
    const m = this.meetup();
    if (m) {
      this.commentService.seedComments(m.comments ?? []);
      setTimeout(() =>
        this.commentBottom?.nativeElement?.scrollIntoView({ behavior: 'smooth' })
      );
    }
  });
  this.destroyRef.onDestroy(() => this.commentService.clearComments());
}
```

- `effect()` with `if (m)` guard seeds the comment signal when meetup data arrives
- `setTimeout` defers the auto-scroll one tick so Angular has rendered the DOM first
- `DestroyRef.onDestroy` clears comments on navigation away — no `ngOnDestroy` interface needed
- `clearComments()` prevents stale comments from "ghosting" when navigating between meetups

### Template changes

Add a `<section class="comment-section">` block inside `@if (meetup(); as m)`, after `.detail-card`:

```html
<section class="comment-section">
  <app-comment-list [comments]="commentService.comments()" />
  <div #commentBottom></div>
  <app-comment-form [meetupId]="meetupId" />
</section>
```

**Layout:** Comment list (oldest → newest) → scroll anchor → form below the fold.
On initial load, auto-scroll places the newest comment at the bottom of the viewport.

---

## Key Patterns

| Pattern | Detail |
|---------|--------|
| Service injection | `inject()` for services/`DestroyRef`, constructor for `FormBuilder` |
| Subscription cleanup | `takeUntilDestroyed(this.destroyRef)` from `@angular/core/rxjs-interop` |
| Signal inputs | `input.required<T>()` |
| Control flow | `@if`, `@for` (Angular 17+) |
| Theming | CSS variables: `var(--accent)`, `var(--card-bg)`, `var(--text)` |

---

## Verification

1. Navigate to a meetup detail page → comments from the initial fetch appear in the list immediately
2. Type in the form and submit → new comment appears at the bottom, form clears
3. Navigate away and back → comment list is fresh (no stale data from previous visit)
4. Typing near 1800 chars → counter turns accent-colored as a warning
5. At 2001+ chars → submit button disabled (backend also enforces 2000-char max)
6. Run `npm test` in `FE-Mighty_Mileage_Meetup/` to confirm no spec breakage
