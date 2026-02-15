# Feature Specification: Join / Leave Meetups

## 1. Overview

Users can join meetups created by other users and leave meetups they have previously joined. The dashboard displays a contextual action button on each meetup card:

- **"Join Meetup"** — shown when the logged-in user is NOT a participant
- **"Leave Meetup"** — shown when the logged-in user IS a participant

The participant count updates immediately in the UI after each action, without a full page reload.

The meetup owner (creator) does not see a Join/Leave button on their own meetups — they are the organizer, not a participant.

---

## 2. Requirements

### 2.1 Meetup Interface Update

Add a `meetup_participants` array to the `Meetup` TypeScript interface so the frontend can determine participation status.

**File:** `FE-Mighty_Mileage_Meetup/src/app/shared/models/meetup.ts`

```ts
export interface MeetupParticipant {
  id: number;
  user_id: number;
  meetup_id: number;
  user: MeetupUser;
}

export interface Meetup {
  // ... existing fields ...
  meetup_participants?: MeetupParticipant[];
}
```

### 2.2 Backend Prerequisite — Include Participants in Index Response

The current `MeetupsController#index` uses the default `MeetupBlueprint` view, which excludes `meetup_participants`. To show join status on the card list, include participants in the index response.

**Option A (recommended):** Add `meetup_participants` to the default blueprint view.
**Option B:** Use the `:extended` view in the index action.

**File:** `Mighty_Mileage_Meetup-api/app/blueprints/meetup_blueprint.rb`

### 2.3 Service Methods

Add `joinMeetup(meetupId)` and `leaveMeetup(meetupId)` to the existing `MeetupService`.

**File:** `FE-Mighty_Mileage_Meetup/src/app/core/services/meetup.ts`

| Method | HTTP | Endpoint | On Success |
|--------|------|----------|------------|
| `joinMeetup(id: number)` | `POST` | `/meetups/:id/join` | Add the returned participant to the meetup's `meetup_participants` array in the signal |
| `leaveMeetup(id: number)` | `DELETE` | `/meetups/:id/leave` | Remove the current user's participant entry from the meetup's `meetup_participants` array in the signal |

Both methods update `meetupsSignal` in-place so the UI reacts immediately via Angular's signal reactivity.

### 2.4 MeetupCardComponent — Join/Leave Button

Add a conditional Join or Leave button to the `MeetupCardComponent`.

**File:** `FE-Mighty_Mileage_Meetup/src/app/features/meetup/meetup-card/meetup-card.ts`
**File:** `FE-Mighty_Mileage_Meetup/src/app/features/meetup/meetup-card/meetup-card.html`

**Display logic:**

| Condition | Button Shown |
|-----------|-------------|
| User is the meetup **owner** (`meetup.user.id === currentUserId`) | No Join/Leave button (show Edit/Delete instead) |
| User is **not** a participant | "Join Meetup" button |
| User **is** a participant | "Leave Meetup" button |

**Participant count:** Display the number of participants on the card (e.g., "Participants: 3").

### 2.5 Dashboard Refactor — Use MeetupCardComponent

The dashboard currently renders meetup cards inline. Refactor it to use `<app-meetup-card>` so the join/leave buttons live in the reusable component.

**File:** `FE-Mighty_Mileage_Meetup/src/app/pages/dashboard/dashboard.html`
**File:** `FE-Mighty_Mileage_Meetup/src/app/pages/dashboard/dashboard.ts`

---

## 3. Edge Cases

### 3.1 User tries to join a meetup they already joined

- **Backend behavior:** The `MeetupParticipantsController#create` will attempt to save a duplicate `MeetupParticipant`. If there is a database uniqueness constraint, it returns HTTP 422 with validation errors. If not, a duplicate record is created.
- **Frontend mitigation:** The "Join Meetup" button is only visible when the user is NOT in the `meetup_participants` array. This prevents the action from being triggered in normal usage.
- **Recommendation:** Add a database-level unique index on `[meetup_id, user_id]` and a model validation (`validates :user_id, uniqueness: { scope: :meetup_id }`) if not already present. Display the 422 error as a toast/alert if it somehow occurs.

### 3.2 User tries to join when not logged in

- **Backend behavior:** The `authenticate_request` before_action returns HTTP 401 Unauthorized.
- **Frontend mitigation:** The dashboard route is protected by `authGuard`, which redirects unauthenticated users to `/login`. A non-logged-in user cannot reach the dashboard at all.
- **Defense in depth:** If the auth token expires mid-session, the 401 response from the API should be handled gracefully — show a message and redirect to login.

### 3.3 User tries to leave a meetup they haven't joined

- **Backend behavior:** Returns HTTP 404 with `{ errors: ['You are not a participant of this meetup'] }`.
- **Frontend mitigation:** The "Leave Meetup" button only appears when the user IS in the `meetup_participants` array.

### 3.4 Meetup owner tries to join their own meetup

- **Frontend mitigation:** The Join/Leave button is hidden for the meetup owner. They see Edit/Delete instead.
- **Decision:** The owner is the organizer, not a participant. This is a UX choice — if the owner should also be able to "participate," this can be revisited.

### 3.5 Network failure during join/leave

- Show an error message (console.error at minimum, toast notification preferred).
- Do NOT update the local signal on failure — only update on success.

---

## 4. Constraints

1. **Use the existing `meetup.service.ts`** — add `joinMeetup` and `leaveMeetup` methods there; do not create a separate service.
2. **Do not create a new page** — add the Join/Leave buttons to the existing `MeetupCardComponent`.
3. **The `Meetup` interface must include a `meetup_participants` array** to track who has joined.
4. **Use Angular signals** for state management, consistent with the existing pattern in `MeetupService`.
5. **Use `AuthenticationService.getUserId()`** to determine the current user for participation checks.
6. **The `MeetupCardComponent` must be used by the dashboard** — refactor the inline card rendering to use the component.
