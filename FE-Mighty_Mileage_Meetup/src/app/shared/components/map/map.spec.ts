import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, EMPTY } from 'rxjs';
import { MapComponent } from './map';
import { GeocodingService } from '../../../core/services/geocoding';
import { ToastService } from '../../../core/services/toast';
import { Location } from '../../models/location';

const mockLocation: Location = {
  address: '123 Trail Ave',
  city: 'Portland',
  state: 'OR',
  zip_code: '97201',
  country: 'US',
};

const mockGeocodedResult = { lat: 45.52, lng: -122.67, displayName: 'Portland, OR' };

describe('MapComponent', () => {
  let fixture: ComponentFixture<MapComponent>;
  let component: MapComponent;
  let mockGeocode: ReturnType<typeof vi.fn>;

  describe('after geocoding resolves', () => {
    beforeEach(() => {
      mockGeocode = vi.fn(() => of(mockGeocodedResult));

      TestBed.configureTestingModule({
        imports: [MapComponent],
        providers: [{ provide: GeocodingService, useValue: { geocode: mockGeocode } }],
        schemas: [NO_ERRORS_SCHEMA],
      });

      fixture = TestBed.createComponent(MapComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('location', mockLocation);
      fixture.detectChanges();
    });

    it('should be created', () => {
      expect(component).toBeTruthy();
    });

    it('calls geocodingService.geocode() with the provided location', () => {
      expect(mockGeocode).toHaveBeenCalledWith(mockLocation);
    });

    it('leafletOptions() has center matching the resolved lat/lng', () => {
      const opts = (component as any).leafletOptions();
      expect(opts).not.toBeNull();
      expect(opts.center.lat).toBeCloseTo(mockGeocodedResult.lat);
      expect(opts.center.lng).toBeCloseTo(mockGeocodedResult.lng);
    });

    it('leafletOptions() has zoom set to 14', () => {
      const opts = (component as any).leafletOptions();
      expect(opts.zoom).toBe(14);
    });

    it('leafletLayers() returns a single marker after geocoding resolves', () => {
      const layers = (component as any).leafletLayers();
      expect(layers.length).toBe(1);
    });

    it('the marker is positioned at the resolved lat/lng', () => {
      const layers = (component as any).leafletLayers();
      const markerLatLng = layers[0].getLatLng();
      expect(markerLatLng.lat).toBeCloseTo(mockGeocodedResult.lat);
      expect(markerLatLng.lng).toBeCloseTo(mockGeocodedResult.lng);
    });
  });

  describe('before geocoding resolves', () => {
    beforeEach(() => {
      mockGeocode = vi.fn(() => EMPTY);

      TestBed.configureTestingModule({
        imports: [MapComponent],
        providers: [{ provide: GeocodingService, useValue: { geocode: mockGeocode } }],
        schemas: [NO_ERRORS_SCHEMA],
      });

      fixture = TestBed.createComponent(MapComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('location', mockLocation);
      fixture.detectChanges();
    });

    it('leafletOptions() is null before geocoding resolves', () => {
      expect((component as any).leafletOptions()).toBeNull();
    });

    it('leafletLayers() is an empty array before geocoding resolves', () => {
      expect((component as any).leafletLayers()).toEqual([]);
    });
  });

  describe('when location is null (no address provided)', () => {
    beforeEach(() => {
      mockGeocode = vi.fn(() => EMPTY);

      TestBed.configureTestingModule({
        imports: [MapComponent],
        providers: [{ provide: GeocodingService, useValue: { geocode: mockGeocode } }],
        schemas: [NO_ERRORS_SCHEMA],
      });

      fixture = TestBed.createComponent(MapComponent);
      component = fixture.componentInstance;
      // location defaults to null — no setInput needed
      fixture.detectChanges();
    });

    it('leafletOptions() returns US default center and zoom 4', () => {
      const opts = (component as any).leafletOptions();
      expect(opts).not.toBeNull();
      expect(opts.center.lat).toBeCloseTo(39.5);
      expect(opts.center.lng).toBeCloseTo(-98.35);
      expect(opts.zoom).toBe(4);
    });
  });

  describe('interactive mode', () => {
    beforeEach(() => {
      mockGeocode = vi.fn(() => EMPTY);

      TestBed.configureTestingModule({
        imports: [MapComponent],
        providers: [{ provide: GeocodingService, useValue: { geocode: mockGeocode } }],
        schemas: [NO_ERRORS_SCHEMA],
      });

      fixture = TestBed.createComponent(MapComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('coordinatesSelected emits when interactive=true and map is clicked', () => {
      fixture.componentRef.setInput('interactive', true);
      fixture.detectChanges();

      const emitSpy = vi.spyOn(component.coordinatesSelected, 'emit');
      (component as any).onMapClick({ latlng: { lat: 45.52, lng: -122.67 } });

      expect(emitSpy).toHaveBeenCalledWith({ lat: 45.52, lng: -122.67 });
    });

    it('onMapClick is a no-op when interactive=false', () => {
      fixture.componentRef.setInput('interactive', false);
      fixture.detectChanges();

      const emitSpy = vi.spyOn(component.coordinatesSelected, 'emit');
      (component as any).onMapClick({ latlng: { lat: 45.52, lng: -122.67 } });

      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('locateMe()', () => {
    let toast: ToastService;

    beforeEach(() => {
      mockGeocode = vi.fn(() => EMPTY);

      TestBed.configureTestingModule({
        imports: [MapComponent],
        providers: [{ provide: GeocodingService, useValue: { geocode: mockGeocode } }],
        schemas: [NO_ERRORS_SCHEMA],
      });

      fixture = TestBed.createComponent(MapComponent);
      component = fixture.componentInstance;
      toast = TestBed.inject(ToastService);
      fixture.componentRef.setInput('interactive', true);
      fixture.detectChanges();
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('emits coordinatesSelected with the position on geolocation success', () => {
      const mockPosition = { coords: { latitude: 45.52, longitude: -122.67 } };
      vi.stubGlobal('navigator', {
        geolocation: {
          getCurrentPosition: vi.fn((success: (p: unknown) => void) => success(mockPosition)),
        },
      });

      const emitSpy = vi.spyOn(component.coordinatesSelected, 'emit');
      (component as any).locateMe();

      expect(emitSpy).toHaveBeenCalledWith({ lat: 45.52, lng: -122.67 });
    });

    it('calls toast.error when geolocation permission is denied', () => {
      vi.stubGlobal('navigator', {
        geolocation: {
          getCurrentPosition: vi.fn(
            (_success: unknown, error: (e: unknown) => void) =>
              error({ code: 1, message: 'Permission denied' }),
          ),
        },
      });

      const toastSpy = vi.spyOn(toast, 'error');
      (component as any).locateMe();

      expect(toastSpy).toHaveBeenCalledWith('Location permission denied.');
    });

    it('calls toast.error when geolocation is not supported by the browser', () => {
      vi.stubGlobal('navigator', { geolocation: undefined });

      const toastSpy = vi.spyOn(toast, 'error');
      (component as any).locateMe();

      expect(toastSpy).toHaveBeenCalledWith('Geolocation is not supported by your browser.');
    });
  });
});
