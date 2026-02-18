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
