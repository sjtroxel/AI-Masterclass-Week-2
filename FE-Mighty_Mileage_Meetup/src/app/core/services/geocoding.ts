import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Location } from '../../shared/models/location';
import { SKIP_AUTH } from '../auth-token-interceptor';
import { ToastService } from './toast';

export interface GeocodedLocation {
  lat: number;
  lng: number;
  displayName: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

@Injectable({
  providedIn: 'root',
})
export class GeocodingService {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);

  geocode(location: Location): Observable<GeocodedLocation> {
    const query = [
      location.address,
      location.city,
      location.state,
      location.zip_code,
      location.country,
    ].join(', ');

    const params = new HttpParams()
      .set('q', query)
      .set('format', 'json')
      .set('limit', '1');

    const context = new HttpContext().set(SKIP_AUTH, true);

    return this.http.get<NominatimResult[]>(NOMINATIM_URL, { params, context }).pipe(
      map((results) => {
        if (results.length === 0) {
          this.toast.error('Address not found.');
          throw new Error('empty');
        }
        const { lat, lon, display_name } = results[0];
        return { lat: parseFloat(lat), lng: parseFloat(lon), displayName: display_name };
      }),
      catchError((err) => {
        if (err.message !== 'empty') {
          this.toast.error('Geocoding failed.');
        }
        return EMPTY;
      }),
    );
  }
}
