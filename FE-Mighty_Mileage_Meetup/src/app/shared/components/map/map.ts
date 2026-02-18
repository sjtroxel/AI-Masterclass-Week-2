import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import {
  DivIcon,
  Icon,
  LatLng,
  Layer,
  LeafletMouseEvent,
  MapOptions,
  divIcon,
  latLng,
  marker,
  tileLayer,
} from 'leaflet';
import { LeafletDirective, LeafletLayersDirective } from '@bluehalo/ngx-leaflet';
import { Location } from '../../models/location';
import { GeocodedLocation, GeocodingService } from '../../../core/services/geocoding';
import { ToastService } from '../../../core/services/toast';

// Fix for Leaflet's default marker icon paths broken by esbuild
Icon.Default.mergeOptions({
  iconUrl: 'assets/leaflet/marker-icon.png',
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
});

// Animated drop icon for user-placed markers
const CLICK_MARKER_ICON: DivIcon = divIcon({
  html: '<div class="locate-pin"></div>',
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 16],
});

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [LeafletDirective, LeafletLayersDirective],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class MapComponent {
  private readonly geocodingService = inject(GeocodingService);
  private readonly toast = inject(ToastService);

  location    = input<Location | null>(null);
  interactive = input<boolean>(false);

  coordinatesSelected = output<{ lat: number; lng: number }>();

  private readonly DEFAULT_CENTER = latLng(39.5, -98.35);
  private readonly DEFAULT_ZOOM   = 4;

  private readonly geocoded      = signal<GeocodedLocation | null>(null);
  private readonly clickedMarker = signal<LatLng | null>(null);

  protected readonly leafletOptions = computed<MapOptions | null>(() => {
    const location = this.location();
    const g = this.geocoded();

    if (g) {
      return {
        layers: [
          tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© OpenStreetMap contributors',
          }),
        ],
        zoom: 14,
        center: latLng(g.lat, g.lng),
      };
    }

    if (location === null) {
      return {
        layers: [
          tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© OpenStreetMap contributors',
          }),
        ],
        zoom: this.DEFAULT_ZOOM,
        center: this.DEFAULT_CENTER,
      };
    }

    return null;
  });

  protected readonly leafletLayers = computed<Layer[]>(() => {
    const g = this.geocoded();
    const cm = this.clickedMarker();
    const layers: Layer[] = [];
    if (g) layers.push(marker(latLng(g.lat, g.lng)));
    if (cm) layers.push(marker(cm, { icon: CLICK_MARKER_ICON }));
    return layers;
  });

  constructor() {
    effect(() => {
      const loc = this.location();
      if (loc === null) return;
      this.geocodingService.geocode(loc).subscribe((result) => {
        this.geocoded.set(result);
      });
    });
  }

  protected onMapClick(event: LeafletMouseEvent): void {
    if (!this.interactive()) return;
    this.clickedMarker.set(event.latlng);
    this.coordinatesSelected.emit({ lat: event.latlng.lat, lng: event.latlng.lng });
  }

  protected locateMe(): void {
    if (!navigator.geolocation) {
      this.toast.error('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.clickedMarker.set(latLng(lat, lng));
        this.coordinatesSelected.emit({ lat, lng });
      },
      () => {
        this.toast.error('Location permission denied.');
      },
    );
  }
}
