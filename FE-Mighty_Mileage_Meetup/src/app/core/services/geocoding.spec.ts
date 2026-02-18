import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { GeocodingService } from './geocoding';
import { ToastService } from './toast';
import { Location } from '../../shared/models/location';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

const mockLocation: Location = {
  address: '1600 Amphitheatre Pkwy',
  city: 'Mountain View',
  state: 'CA',
  zip_code: '94043',
  country: 'USA',
};

const mockNominatimResult = [
  {
    lat: '37.4224764',
    lon: '-122.0842499',
    display_name: '1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA',
  },
];

describe('GeocodingService', () => {
  let service: GeocodingService;
  let httpMock: HttpTestingController;
  let toast: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(GeocodingService);
    httpMock = TestBed.inject(HttpTestingController);
    toast = TestBed.inject(ToastService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('geocode()', () => {
    it('GETs the Nominatim URL with correct q, format, and limit params', () => {
      service.geocode(mockLocation).subscribe();

      const req = httpMock.expectOne(
        (r) =>
          r.url === NOMINATIM_URL &&
          r.params.get('q') === '1600 Amphitheatre Pkwy, Mountain View, CA, 94043, USA' &&
          r.params.get('format') === 'json' &&
          r.params.get('limit') === '1',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockNominatimResult);
    });

    it('maps lat/lon/display_name to a GeocodedLocation', () => {
      let result: { lat: number; lng: number; displayName: string } | undefined;
      service.geocode(mockLocation).subscribe((r) => (result = r));

      httpMock
        .expectOne((r) => r.url === NOMINATIM_URL)
        .flush(mockNominatimResult);

      expect(result).toEqual({
        lat: 37.4224764,
        lng: -122.0842499,
        displayName: '1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA',
      });
    });

    it('calls toast.error and emits nothing when Nominatim returns empty array', () => {
      const errorSpy = vi.spyOn(toast, 'error');
      let emitted = false;
      service.geocode(mockLocation).subscribe({ next: () => (emitted = true) });

      httpMock.expectOne((r) => r.url === NOMINATIM_URL).flush([]);

      expect(errorSpy).toHaveBeenCalledWith('Address not found.');
      expect(emitted).toBe(false);
    });

    it('calls toast.error and emits nothing on HTTP 500', () => {
      const errorSpy = vi.spyOn(toast, 'error');
      let emitted = false;
      service.geocode(mockLocation).subscribe({ next: () => (emitted = true) });

      httpMock
        .expectOne((r) => r.url === NOMINATIM_URL)
        .flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      expect(errorSpy).toHaveBeenCalledWith('Geocoding failed.');
      expect(emitted).toBe(false);
    });
  });
});
