# Mighty Maps — Integration Spec

## Context
The app has a `Location` model (Rails) and a matching `Location` interface (Angular) with fields
`address, city, state, zip_code, country`. The Mighty Maps integration adds:
1. Leaflet + `@bluehalo/ngx-leaflet` map libraries
2. A `GeocodingService` that converts a `Location` object into `{ lat, lng, displayName }` via
   the OpenStreetMap Nominatim API

The auth interceptor attaches the JWT token to every HTTP request, including external ones.
Sending the app JWT to `nominatim.openstreetmap.org` is a security concern — the interceptor is
refactored with an opt-out `SKIP_AUTH` context token.

---

## Rails Data Model (source of truth)

Location is a **polymorphic** model (`belongs_to :locationable`) used by both `Meetup` and `User`.

**Fields:** `address`, `city`, `state`, `zip_code`, `country` (all strings, all required)

**JSON shape (embedded in meetup responses):**
```json
{
  "location": {
    "id": 2,
    "address": "456 Park Ave",
    "city": "Portland",
    "state": "OR",
    "zip_code": "97215",
    "country": "USA"
  }
}
```

**Angular `Location` interface** (already exists at `src/app/shared/models/location.ts`):
```typescript
export interface Location {
  id?: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}
```

---

## Files Touched

| Action  | Path |
|---------|------|
| install | `FE-Mighty_Mileage_Meetup/package.json` (via npm) |
| modify  | `src/styles.scss` — add `@import "leaflet/dist/leaflet.css"` |
| modify  | `src/app/core/auth-token-interceptor.ts` — add `SKIP_AUTH` context token |
| create  | `src/app/core/services/geocoding.ts` |
| create  | `src/app/core/services/geocoding.spec.ts` |

---

## Step 1 — Install packages

Run inside `FE-Mighty_Mileage_Meetup/`:

```bash
npm install leaflet @bluehalo/ngx-leaflet
npm install -D @types/leaflet
```

Then add to the top of `src/styles.scss`:
```scss
@import "leaflet/dist/leaflet.css";
```

---

## Step 2 — Auth Interceptor: `SKIP_AUTH` context token

**File:** `src/app/core/auth-token-interceptor.ts`

Adds a `HttpContextToken` export so any service can opt out of JWT attachment.

```typescript
import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthenticationService } from './services/authentication';

export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_AUTH)) return next(req);

  const authService = inject(AuthenticationService);
  const authToken = authService.getToken();

  const authReq = authToken
    ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${authToken}`) })
    : req;
  return next(authReq);
};
```

All existing requests continue to work identically (default is `false`).

---

## Step 3 — `GeocodingService`

**File:** `src/app/core/services/geocoding.ts`

### `GeocodedLocation` interface
```typescript
export interface GeocodedLocation {
  lat: number;
  lng: number;
  displayName: string;
}
```

### Service behaviour
- `inject(HttpClient)` + `inject(ToastService)` — project convention
- `geocode(location: Location): Observable<GeocodedLocation>`
  - Builds query: `"${address}, ${city}, ${state}, ${zip_code}, ${country}"`
  - Calls Nominatim with `SKIP_AUTH` context so JWT is never forwarded:
    ```
    GET https://nominatim.openstreetmap.org/search?q=<query>&format=json&limit=1
    ```
  - Maps Nominatim `lat`/`lon`/`display_name` to `GeocodedLocation` (parse floats)
  - Empty array → `toast.error('Address not found.')` + `EMPTY`
  - HTTP error → `toast.error('Geocoding failed.')` + `EMPTY`
- No signals — this is a pure query service with no cached state

### Nominatim response shape
```json
[{ "lat": "45.52", "lon": "-122.67", "display_name": "Portland, OR..." }]
```

---

## Step 4 — Vitest unit test

**File:** `src/app/core/services/geocoding.spec.ts`

Follows `comment.spec.ts` pattern:
- `TestBed` with `provideHttpClient()` + `provideHttpClientTesting()`
- `vi.spyOn(toastService, 'error')` to assert error toasts
- `HttpTestingController.expectOne()` to assert correct Nominatim URL + params
- `httpMock.verify()` in `afterEach`

Test cases:
1. `should be created`
2. GETs Nominatim URL with correct `q` and `format=json` params
3. Maps `lat`/`lon`/`display_name` → `GeocodedLocation` correctly
4. Calls `toast.error()` + completes without emitting when Nominatim returns `[]`
5. Calls `toast.error()` + returns EMPTY on HTTP 500

---

## Key Reuse

| Reused from      | Path |
|------------------|------|
| `Location` interface | `src/app/shared/models/location.ts` |
| `ToastService`   | `src/app/core/services/toast.ts` |
| `EMPTY` + `catchError` pattern | `src/app/core/services/meetup.ts` |
| `HttpTestingController` pattern | `src/app/core/services/comment.spec.ts` |

---

## Verification — Phase 1

```bash
cd FE-Mighty_Mileage_Meetup

# 1. Confirm packages installed
node -e "require('leaflet'); require('@bluehalo/ngx-leaflet'); console.log('OK')"

# 2. Run the geocoding spec
npm test -- --reporter=verbose 2>&1 | grep -E "(geocoding|PASS|FAIL)"

# 3. Full suite green
npm test
```

---

## Phase 2: Reusable MapComponent

### Context
A standalone `MapComponent` that accepts a `Location` signal input, internally geocodes it via
`GeocodingService`, and renders a Leaflet tile map with a marker. Integrated into
`MeetupDetailComponent` so users can see where a meetup is happening.

### Design System Alignment (theme-scout)
The map container uses existing theme tokens — no hardcoded values:
- `rounded-xl border border-border overflow-hidden` — matches the info panels in `meetup-detail.html`
- `bg-card` — white in light, `#0a2b1f` in dark, via `--card-bg`
- Leaflet's own tile layer is untouched; only the container chrome is themed

### Files Touched

| Action  | Path |
|---------|------|
| modify  | `angular.json` — add Leaflet marker images to `assets` array |
| create  | `src/app/shared/components/map/map.ts` |
| create  | `src/app/shared/components/map/map.html` |
| create  | `src/app/shared/components/map/map.scss` |
| create  | `src/app/shared/components/map/map.spec.ts` |
| modify  | `src/app/pages/meetup-detail/meetup-detail.ts` — import `MapComponent` |
| modify  | `src/app/pages/meetup-detail/meetup-detail.html` — add `<app-map>` |

---

### Step A — Leaflet Marker Asset Fix

Leaflet's default marker PNGs use runtime URL detection that breaks under esbuild (Angular 20's
default builder). The fix has two parts:

**1. Copy images via `angular.json` assets:**
```json
{
  "glob": "**/*",
  "input": "./node_modules/leaflet/dist/images",
  "output": "assets/leaflet/"
}
```

**2. Override `Icon.Default` in the component class body (static, runs once):**
```typescript
import { Icon } from 'leaflet';

Icon.Default.mergeOptions({
  iconUrl: 'assets/leaflet/marker-icon.png',
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
});
```

This is a well-known standard pattern and must run before any `marker()` call.

---

### Step B — `MapComponent`

**File:** `src/app/shared/components/map/map.ts`

```typescript
// Inputs
location = input.required<Location>();

// Internal state
private readonly geocoded = signal<GeocodedLocation | null>(null);

// Derived Leaflet config (computed signals)
protected readonly leafletOptions = computed<MapOptions | null>(() => { ... });
protected readonly leafletLayers  = computed<Layer[]>(() => { ... });
```

**Signal flow:**
1. `location` input arrives (required — parent guards with `@if (m.location)`)
2. `effect()` in constructor watches `location()`, calls `geocodingService.geocode(location())`
3. On success, `.subscribe(r => this.geocoded.set(r))`
4. `leafletOptions` computed returns `null` until `geocoded()` resolves; then returns
   `{ layers: [OSM tile layer], zoom: 14, center: latLng(lat, lng) }`
5. `leafletLayers` computed returns `[]` until resolved; then `[marker(latLng(lat, lng))]`

**Template pattern:**
```html
@if (leafletOptions(); as opts) {
  <div class="map-wrapper rounded-xl border border-border overflow-hidden"
       leaflet
       [leafletOptions]="opts"
       [leafletLayers]="leafletLayers()">
  </div>
} @else {
  <p class="loading-text text-text-secondary text-sm">Locating on map…</p>
}
```

**SCSS:**
```scss
:host { display: block; }
.inner-container { padding: 1.5rem !important; }
.map-wrapper { height: 300px; }
```

**Imports array:** `[LeafletDirective]` from `@bluehalo/ngx-leaflet`

---

### Step C — Integration in `MeetupDetailComponent`

**meetup-detail.ts:** Add `MapComponent` to the `imports` array.

**meetup-detail.html:** Insert after the existing location text panel:
```html
@if (m.location) {
  <app-map [location]="m.location" />
}
```
The existing `@if (m.location)` block already wraps the text panel — `<app-map>` lives just below
it, with its own guard (defensive: `location` is `input.required`, so the guard must stay).

---

### Step D — Vitest Spec

**File:** `src/app/shared/components/map/map.spec.ts`

**Strategy:** Leaflet doesn't render in happy-dom (no real canvas/tiles), so we:
1. Use `NO_ERRORS_SCHEMA` to suppress unknown `leaflet` attribute errors
2. Mock `GeocodingService` with `vi.fn()` returning a controlled `Observable`
3. Test the **signal state**, not DOM output

**Test cases:**
1. `should be created`
2. Calls `geocodingService.geocode()` with the provided `Location` on init
3. `leafletOptions()` is `null` before geocoding resolves
4. `leafletOptions()` has `center` matching the resolved lat/lng after geocoding
5. `leafletLayers()` returns an empty array before geocoding resolves
6. `leafletLayers()` returns a single `Marker` at the correct position after geocoding

**Key setup:**
```typescript
const mockGeocode = vi.fn(() => of({ lat: 45.52, lng: -122.67, displayName: 'Portland, OR' }));
{ provide: GeocodingService, useValue: { geocode: mockGeocode } }
```
Use `fixture.componentRef.setInput('location', mockLocation)` to pass the required input.

---

### Verification — Phase 2

```bash
cd FE-Mighty_Mileage_Meetup

# MapComponent spec only
npm test -- src/app/shared/components/map/map.spec.ts

# Full suite — all 212+ tests green
npm test

# Visual check (requires both servers running)
npm start  # Angular :4200
# Navigate to a meetup detail page — map renders below location panel
```

---

## Phase 3: Coordinate Selection (Interactive Map)

### Goal
Allow `MapComponent` to be used in `MeetupFormComponent` as a **location picker**: the user
clicks anywhere on the map, coordinates are emitted, and a `ReverseGeocodingService` translates
them back into address fields that auto-populate the form.

### Design Decisions
- `location` input becomes **optional** (`input<Location | null>(null)`) so the map can render
  without a pre-existing address (new meetup creation). The `@if (m.location)` guard in
  `meetup-detail.html` still prevents rendering without data in the detail view.
- A new `interactive` input (`input<boolean>(false)`) enables click handling. When `false` (default),
  the map is purely decorative — no changes to Phase 2 behaviour.
- A new `coordinatesSelected` output emits `{ lat: number; lng: number }` on map click.
- `ReverseGeocodingService` is a dedicated pure-query service (same pattern as `GeocodingService`).

---

### Files Touched

| Action  | Path |
|---------|------|
| modify  | `src/app/shared/components/map/map.ts` — optional location, interactive input, output |
| modify  | `src/app/shared/components/map/map.html` — `(leafletClick)` binding |
| modify  | `src/app/shared/components/map/map.spec.ts` — new tests for interactive mode |
| create  | `src/app/core/services/reverse-geocoding.ts` |
| create  | `src/app/core/services/reverse-geocoding.spec.ts` |
| modify  | `src/app/features/meetup/meetup-form/meetup-form.ts` — import MapComponent, handle output |
| modify  | `src/app/features/meetup/meetup-form/meetup-form.html` — add `<app-map>` picker |
| modify  | `src/app/features/meetup/meetup-form/meetup-form.spec.ts` — mock new services |

---

### Step A — Extend `MapComponent`

**`map.ts` changes:**
```typescript
// location becomes optional (was input.required)
location    = input<Location | null>(null);
interactive = input<boolean>(false);

coordinatesSelected = output<{ lat: number; lng: number }>();

// Default center — geographic center of contiguous US
private readonly DEFAULT_CENTER = latLng(39.5, -98.35);
private readonly DEFAULT_ZOOM   = 4;

// Separate signal for click-placed marker (does not geocode)
private readonly clickedMarker = signal<LatLng | null>(null);

// Updated leafletLayers: merges geocoded marker + clicked marker
// Updated leafletOptions: falls back to DEFAULT_CENTER/ZOOM when no location

// Click handler (only active when interactive):
protected onMapClick(event: LeafletMouseEvent): void {
  if (!this.interactive()) return;
  this.clickedMarker.set(event.latlng);
  this.coordinatesSelected.emit({ lat: event.latlng.lat, lng: event.latlng.lng });
}
```

**`map.html`:** `(leafletClick)="onMapClick($event)"` added to the map `div`.

---

### Step B — `ReverseGeocodingService`

**File:** `src/app/core/services/reverse-geocoding.ts`

Nominatim reverse endpoint:
```
GET https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json
```

Nominatim reverse response → `Partial<Location>` mapping:
```typescript
{
  address:  result.address.road         ?? result.address.hamlet ?? '',
  city:     result.address.city         ?? result.address.town   ?? result.address.village ?? '',
  state:    result.address.state        ?? '',
  zip_code: result.address.postcode     ?? '',
  country:  result.address.country_code?.toUpperCase() ?? '',
}
```

- Uses `SKIP_AUTH` context (same pattern as `GeocodingService`)
- On HTTP error → `toast.error('Reverse geocoding failed.')` + `EMPTY`
- Returns `Observable<Partial<Location>>`

---

### Step C — Integration in `MeetupFormComponent`

**`meetup-form.ts`:**
- Inject `ReverseGeocodingService`
- Add `MapComponent` to the `imports` array
- Handler: `onCoordinatesSelected({ lat, lng })` → calls `reverseGeocode(lat, lng)` → subscribes →
  `form.patchValue({ location: result })`

**`meetup-form.html`:** Below the zip/city/state fields:
```html
<div class="map-picker-section">
  <span class="label-text">🗺 Or click the map to auto-fill location</span>
  <app-map [interactive]="true" (coordinatesSelected)="onCoordinatesSelected($event)" />
</div>
```
No `[location]` binding — the `null` default shows the US center view.

---

### Step D — Tests

**`map.spec.ts` additions:**
1. `coordinatesSelected` emits when `interactive = true` and map is clicked
2. `onMapClick()` is a no-op when `interactive = false`
3. `leafletOptions()` returns US default center when `location` is null
4. `leafletOptions()` still geocodes and centers when `location` is provided

**`reverse-geocoding.spec.ts`** (mirrors `geocoding.spec.ts`):
1. `should be created`
2. GETs Nominatim reverse URL with correct `lat`, `lon`, `format=json` params
3. Maps `address` fields → `Partial<Location>` (including town/village fallbacks)
4. Calls `toast.error()` + returns EMPTY on HTTP 500

**`meetup-form.spec.ts`:** Add providers:
```typescript
{ provide: GeocodingService,        useValue: { geocode: vi.fn(() => EMPTY) } },
{ provide: ReverseGeocodingService, useValue: { reverseGeocode: vi.fn(() => EMPTY) } },
```

---

### Verification — Phase 3

```bash
cd FE-Mighty_Mileage_Meetup

# New service spec
npm test -- src/app/core/services/reverse-geocoding.spec.ts

# Full suite green (target: ~222+ tests)
npm test

# Visual check
npm start
# Open Create Meetup → map renders at US center
# Click → address fields auto-populate via reverse geocoding
```

---

## Phase 4: UX & Refinement

### Goal
Polishing the interactive map experience with three targeted improvements:
1. **"Locate Me" button** — one-click geolocation centering via the browser Geolocation API
2. **Animated click marker** — a bouncing pin drop animation when the user places a coordinate
3. **Reverse-geocoding loading state** — a spinner in `MeetupFormComponent` while the address is being looked up

---

### Files Touched

| Action  | Path |
|---------|------|
| modify  | `src/app/shared/components/map/map.ts` — inject `ToastService`, add `locateMe()`, animated `divIcon` for click marker |
| modify  | `src/app/shared/components/map/map.html` — "Locate Me" button overlay |
| modify  | `src/app/shared/components/map/map.scss` — `.locate-me-btn`, `.locate-pin` keyframe |
| modify  | `src/app/shared/components/map/map.spec.ts` — 3 `locateMe()` tests |
| modify  | `src/app/features/meetup/meetup-form/meetup-form.ts` — `isReverseGeocoding` signal, `finalize` in handler |
| modify  | `src/app/features/meetup/meetup-form/meetup-form.html` — spinner overlay |
| modify  | `src/app/features/meetup/meetup-form/meetup-form.spec.ts` — `isReverseGeocoding` default test |

---

### Step A — "Locate Me" Button (`MapComponent`)

**`map.ts`:**
- Inject `ToastService`
- Add module-level `CLICK_MARKER_ICON` using Leaflet `divIcon` with class `locate-pin`
- Update `leafletLayers` to use `CLICK_MARKER_ICON` for the click-placed marker
- Add `protected locateMe(): void`:
  - Guard: if `!navigator.geolocation` → `toast.error('Geolocation is not supported by your browser.')`
  - `getCurrentPosition` success → `clickedMarker.set(latLng(lat, lng))` + `coordinatesSelected.emit(...)`
  - `getCurrentPosition` error → `toast.error('Location permission denied.')`

**`map.html`:** Wrap map `div` in a `<div class="map-container">`. Inside, after the map div, conditionally render the button when `interactive()`:
```html
@if (interactive()) {
  <button type="button" class="locate-me-btn" (click)="locateMe()">Locate Me</button>
}
```

**`map.scss`:** Add:
- `.map-container { position: relative; }` — enables absolute positioning of the button
- `.locate-me-btn` — absolute bottom-right, `z-index: 1000`, themed with `var(--button-bg)` / `var(--button-hover)`
- `.locate-pin` — 16 × 16 circle using `var(--accent)`, with `pin-drop` keyframe animation
- `@keyframes pin-drop` — scale from 0 + translateY(-12px) → scale 1 + translateY(0), 0.35s ease

---

### Step B — Loading State (`MeetupFormComponent`)

**`meetup-form.ts`:**
```typescript
isReverseGeocoding = signal(false);

onCoordinatesSelected(coords: { lat: number; lng: number }): void {
  this.isReverseGeocoding.set(true);
  this.reverseGeocodingService
    .reverseGeocode(coords.lat, coords.lng)
    .pipe(finalize(() => this.isReverseGeocoding.set(false)))
    .subscribe((result) => {
      this.form.patchValue({ location: result });
    });
}
```

**`meetup-form.html`:** Below `<app-map>`, inside the `map-picker-section` div:
```html
@if (isReverseGeocoding()) {
  <div class="flex items-center gap-2 text-text-secondary text-sm mt-1">
    <span class="spinner" aria-hidden="true"></span>
    Finding address…
  </div>
}
```

---

### Step C — Tests

**`map.spec.ts`** — new `describe('locateMe()')` block (3 tests):
1. Emits `coordinatesSelected` with correct lat/lng on geolocation success
2. Calls `toast.error('Location permission denied.')` when `getCurrentPosition` errors
3. Calls `toast.error('Geolocation is not supported by your browser.')` when `navigator.geolocation` is `undefined`

Use `vi.stubGlobal('navigator', ...)` per test; restore with `vi.unstubAllGlobals()` in `afterEach`.

**`meetup-form.spec.ts`** — add to "form initialisation" describe:
```typescript
it('should have isReverseGeocoding default to false', () => {
  expect(component.isReverseGeocoding()).toBe(false);
});
```

---

### Verification — Phase 4

```bash
cd FE-Mighty_Mileage_Meetup

# Full suite green (target: ~226+ tests)
npm test

# Build clean
npm run build

# Visual check
npm start
# Open Create Meetup
# Click map → spinner appears briefly → address fields auto-fill
# Click "Locate Me" → browser permission prompt → map centers on current position
```
