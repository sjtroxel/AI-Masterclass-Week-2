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

## Verification

```bash
cd FE-Mighty_Mileage_Meetup

# 1. Confirm packages installed
node -e "require('leaflet'); require('@bluehalo/ngx-leaflet'); console.log('OK')"

# 2. Run the geocoding spec
npm test -- --reporter=verbose 2>&1 | grep -E "(geocoding|PASS|FAIL)"

# 3. Full suite green
npm test
```
