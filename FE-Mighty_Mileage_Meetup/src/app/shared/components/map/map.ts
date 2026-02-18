import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Icon, Layer, MapOptions, latLng, marker, tileLayer } from 'leaflet';
import { LeafletDirective, LeafletLayersDirective } from '@bluehalo/ngx-leaflet';
import { Location } from '../../models/location';
import { GeocodedLocation, GeocodingService } from '../../../core/services/geocoding';

// Fix for Leaflet's default marker icon paths broken by esbuild
Icon.Default.mergeOptions({
  iconUrl: 'assets/leaflet/marker-icon.png',
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
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

  location = input.required<Location>();

  private readonly geocoded = signal<GeocodedLocation | null>(null);

  protected readonly leafletOptions = computed<MapOptions | null>(() => {
    const g = this.geocoded();
    if (!g) return null;
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
  });

  protected readonly leafletLayers = computed<Layer[]>(() => {
    const g = this.geocoded();
    if (!g) return [];
    return [marker(latLng(g.lat, g.lng))];
  });

  constructor() {
    effect(() => {
      this.geocodingService.geocode(this.location()).subscribe((result) => {
        this.geocoded.set(result);
      });
    });
  }
}
