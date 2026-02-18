import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, EMPTY } from 'rxjs';
import { MapComponent } from './map';
import { GeocodingService } from '../../../core/services/geocoding';
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
});
