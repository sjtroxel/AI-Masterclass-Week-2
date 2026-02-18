import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ReverseGeocodingService } from './reverse-geocoding';
import { ToastService } from './toast';

const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

const mockReverseResult = {
  address: {
    road: 'SW Yamhill St',
    city: 'Portland',
    state: 'Oregon',
    postcode: '97204',
    country_code: 'us',
  },
};

const mockReverseResultTownFallback = {
  address: {
    hamlet: 'Old Town',
    town: 'Lake Oswego',
    state: 'Oregon',
    postcode: '97034',
    country_code: 'us',
  },
};

describe('ReverseGeocodingService', () => {
  let service: ReverseGeocodingService;
  let httpMock: HttpTestingController;
  let toast: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ReverseGeocodingService);
    httpMock = TestBed.inject(HttpTestingController);
    toast = TestBed.inject(ToastService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('reverseGeocode()', () => {
    it('GETs the Nominatim reverse URL with correct lat, lon, and format=json params', () => {
      service.reverseGeocode(45.52, -122.67).subscribe();

      const req = httpMock.expectOne(
        (r) =>
          r.url === NOMINATIM_REVERSE_URL &&
          r.params.get('lat') === '45.52' &&
          r.params.get('lon') === '-122.67' &&
          r.params.get('format') === 'json',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockReverseResult);
    });

    it('maps address fields to Partial<Location> using road and city', () => {
      let result: Partial<{ address: string; city: string; state: string; zip_code: string; country: string }> | undefined;
      service.reverseGeocode(45.52, -122.67).subscribe((r) => (result = r));

      httpMock.expectOne((r) => r.url === NOMINATIM_REVERSE_URL).flush(mockReverseResult);

      expect(result).toEqual({
        address: 'SW Yamhill St',
        city: 'Portland',
        state: 'Oregon',
        zip_code: '97204',
        country: 'US',
      });
    });

    it('falls back to hamlet for address and town for city when road/city are absent', () => {
      let result: Partial<{ address: string; city: string }> | undefined;
      service.reverseGeocode(45.42, -122.7).subscribe((r) => (result = r));

      httpMock.expectOne((r) => r.url === NOMINATIM_REVERSE_URL).flush(mockReverseResultTownFallback);

      expect(result?.address).toBe('Old Town');
      expect(result?.city).toBe('Lake Oswego');
    });

    it('calls toast.error and emits nothing on HTTP 500', () => {
      const errorSpy = vi.spyOn(toast, 'error');
      let emitted = false;
      service.reverseGeocode(45.52, -122.67).subscribe({ next: () => (emitted = true) });

      httpMock
        .expectOne((r) => r.url === NOMINATIM_REVERSE_URL)
        .flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      expect(errorSpy).toHaveBeenCalledWith('Reverse geocoding failed.');
      expect(emitted).toBe(false);
    });
  });
});
