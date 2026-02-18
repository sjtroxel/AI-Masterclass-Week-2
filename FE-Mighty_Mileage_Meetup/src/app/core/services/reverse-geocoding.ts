import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Location } from '../../shared/models/location';
import { SKIP_AUTH } from '../auth-token-interceptor';
import { ToastService } from './toast';

interface NominatimReverseResult {
  address: {
    road?: string;
    hamlet?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    country_code?: string;
  };
}

const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

@Injectable({
  providedIn: 'root',
})
export class ReverseGeocodingService {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);

  reverseGeocode(lat: number, lon: number): Observable<Partial<Location>> {
    const params = new HttpParams()
      .set('lat', lat.toString())
      .set('lon', lon.toString())
      .set('format', 'json');

    const context = new HttpContext().set(SKIP_AUTH, true);

    return this.http
      .get<NominatimReverseResult>(NOMINATIM_REVERSE_URL, { params, context })
      .pipe(
        map((result) => ({
          address: result.address.road ?? result.address.hamlet ?? '',
          city:
            result.address.city ??
            result.address.town ??
            result.address.village ??
            '',
          state: result.address.state ?? '',
          zip_code: result.address.postcode ?? '',
          country: result.address.country_code?.toUpperCase() ?? '',
        })),
        catchError(() => {
          this.toast.error('Reverse geocoding failed.');
          return EMPTY;
        }),
      );
  }
}
