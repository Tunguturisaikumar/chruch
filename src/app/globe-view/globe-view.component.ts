import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { HttpClient } from '@angular/common/http';

interface Location {
  name: string;
  description: string;
  coordinates: [number, number];
  personName?: string;
  personPhoto?: string;
}

@Component({
  selector: 'app-globe-view',
  templateUrl: './globe-view.component.html',
  styleUrls: ['./globe-view.component.css']
})
export class GlobeViewComponent implements OnInit, OnDestroy {
  map!: mapboxgl.Map;
  churches: Location[] = []
  rotationDuration: number = 2000;
  churchMarkers: mapboxgl.Marker[] = [];
  private animationId: number | null = null;
  private bearing = 0;
  private slideshowTimeout: any = null;
  isLoading: boolean = true;
  private readonly INITIAL_CENTER: [number, number] = [0, 20];
  private readonly INITIAL_ZOOM: number = 1.5;

  constructor(private ngZone: NgZone, private http: HttpClient) { }

  ngOnInit(): void {
    this.initializeMap();

    const apiUrl = 'https://server-486354915183.europe-west1.run.app';
    this.http.get<any[]>(apiUrl).subscribe({
      next: (data) => {
        // Map API response to Location interface
        this.churches = data.map(church => ({
          name: church.name,
          description: church.description,
          coordinates: [church.longitude, church.latitude],
          personName: church.personName,
          personPhoto: church.personPhoto
        }));

        console.log('Mapped Churches:', this.churches);

        // Initialize the map AFTER fetching churches
        this.initializeMap();
      },
      error: (err) => console.error('Error:', err)
    });

  }

  applyChanges() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.slideshowTimeout) clearTimeout(this.slideshowTimeout);
    if (this.map) this.map.remove();
    this.initializeMap();
  }

  initializeMap(): void {
    (mapboxgl as any).accessToken =
      'pk.eyJ1Ijoic2Fpa3VtYXJ0dW5ndXR1cmkiLCJhIjoiY21laDkzMGR0MDUycjJrcDZqN2xleXc3biJ9.73urhh9weHk5tslJYZ0vhQ';

    this.map = new mapboxgl.Map({
      container: 'globe-map',
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: this.INITIAL_CENTER,
      zoom: this.INITIAL_ZOOM,
      projection: 'globe'
    });

    this.map.on('style.load', () => {
      this.map.setFog({});
    });

    this.map.on('load', async () => {
      this.churches.forEach((church: any) =>
        this.addMarkerWithClick(church, 'assets/marker.png')
      );
      setTimeout(async () => {
        this.isLoading = false;
        await this.startInitialRotation();
        this.startChurchSlideshow();
      }, 3000);
    });
  }

  private startInitialRotation(): Promise<void> {
    return this.startRotationStep();
  }

  // Reset to full globe view (zoomed out)
  private resetToGlobe(): Promise<void> {
    return new Promise(resolve => {
      this.map.flyTo({
        center: this.INITIAL_CENTER,
        zoom: this.INITIAL_ZOOM,
        bearing: 0,
        speed: 0.6,
        curve: 1,
        essential: true
      });
      setTimeout(resolve, 2000); // wait for flyTo to finish
    });
  }

  private startChurchSlideshow(): void {
    let index = 0;

    const showNextChurch = async () => {
      if (!this.map) return;

      const church = this.churches[index];

      // Step 1: Reset globe to zoomed-out full view
      await this.resetToGlobe();

      // 👉 Skip rotation only for the first slide, since globe already rotated initially
      if (index !== 0) {
        await this.startRotationStep();
      }

      // Step 3: Fly to the church location
      this.map.flyTo({
        center: church.coordinates,
        zoom: 5,
        speed: 2,
        curve: 1,
        essential: true
      });

      // Show popup
      const popup = new mapboxgl.Popup({ offset: 25, closeOnClick: false })
        .setHTML(this.buildPopupCard(church))
        .setLngLat(church.coordinates)
        .addTo(this.map);

      // Wait 5s on card
      this.slideshowTimeout = setTimeout(() => {
        popup.remove();
        index = (index + 1) % this.churches.length;
        this.slideshowTimeout = setTimeout(showNextChurch, 1000);
      }, 5000);
    };

    showNextChurch();
  }

  private startRotationStep(): Promise<void> {
    return new Promise(resolve => {
      const start = performance.now();

      const rotate = (time: number) => {
        const elapsed = time - start;
        if (elapsed < this.rotationDuration) {
          this.bearing -= 0.5;
          this.map.easeTo({ bearing: this.bearing, duration: 50, easing: t => t });
          this.animationId = requestAnimationFrame(rotate);
        } else {
          if (this.animationId) cancelAnimationFrame(this.animationId);
          resolve();
        }
      };

      this.ngZone.runOutsideAngular(() => requestAnimationFrame(rotate));
    });
  }

  private buildPopupCard(church: Location): string {
    return `
      <div style="width:220px; padding:10px; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,0.2); font-family:sans-serif; background:#fff;">
        <img src="./assets/person.jpg" alt="${church.personName}" 
             style="width:100%; height:150px; object-fit:cover; border-radius:8px;"/>
        <h3 style="margin:8px 0 4px; font-size:16px; color:#333;">${church.name}</h3>
        <p style="margin:0; font-size:13px; color:#555;">${church.description}</p>
        <p style="margin:6px 0 0; font-size:14px; font-weight:bold; color:#222;">
          👤 ${church.personName}
        </p>
      </div>
    `;
  }

  addMarkerWithClick(location: Location, iconPath: string): mapboxgl.Marker {
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundImage = `url(${iconPath})`;
    el.style.width = '30px';
    el.style.height = '30px';
    el.style.backgroundSize = 'cover';
    el.style.cursor = 'pointer';

    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(this.buildPopupCard(location));

    return new mapboxgl.Marker(el)
      .setLngLat(location.coordinates)
      .setPopup(popup)
      .addTo(this.map);
  }

  // ✅ Added missing methods for buttons
  zoomIn(): void {
    if (this.map) {
      this.map.zoomIn({ duration: 500 });
    }
  }

  zoomOut(): void {
    if (this.map) {
      this.map.zoomOut({ duration: 500 });
    }
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.slideshowTimeout) clearTimeout(this.slideshowTimeout);
  }
}
