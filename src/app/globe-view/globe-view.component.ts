import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

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

  churches: Location[] = [
    {
      name: 'St. Patrick’s Cathedral',
      description: 'Famous church in New York',
      coordinates: [-73.975, 40.758],
      personName: 'Father John Doe',
      personPhoto: 'assets/person.jpg'
    },
    {
      name: 'Westminster Abbey',
      description: 'Historic church in London',
      coordinates: [-0.1273, 51.4993],
      personName: 'Bishop Richard Roe',
      personPhoto: 'assets/person1.jpg'
    },
    {
      name: 'St. Mary’s Cathedral',
      description: 'Famous church in Tokyo',
      coordinates: [139.715, 35.693],
      personName: 'Archbishop Kenji Tanaka',
      personPhoto: 'assets/person.jpg'
    },
    {
      name: 'Notre Dame Cathedral',
      description: 'Iconic Gothic cathedral in Paris',
      coordinates: [2.3499, 48.853],
      personName: 'Father Pierre Dubois',
      personPhoto: 'assets/person1.jpg'
    },
    {
      name: 'St. Peter’s Basilica',
      description: 'Major basilica in Vatican City',
      coordinates: [12.4534, 41.9029],
      personName: 'Pope Francis',
      personPhoto: 'assets/person.jpg'
    },
    {
      name: 'Sagrada Familia',
      description: 'World-famous church in Barcelona',
      coordinates: [2.1744, 41.4036],
      personName: 'Father Miguel Sánchez',
      personPhoto: 'assets/person1.jpg'
    },
    {
      name: 'St. Basil’s Cathedral',
      description: 'Colorful cathedral in Moscow',
      coordinates: [37.6208, 55.7525],
      personName: 'Father Ivan Petrov',
      personPhoto: 'assets/person.jpg'
    },
    {
      name: 'Christ the Saviour Cathedral',
      description: 'Largest Orthodox cathedral in Moscow',
      coordinates: [37.6056, 55.7447],
      personName: 'Metropolitan Alexei',
      personPhoto: 'assets/person1.jpg'
    },
    {
      name: 'Basilica of Our Lady of Guadalupe',
      description: 'Famous pilgrimage site in Mexico City',
      coordinates: [-99.1187, 19.4843],
      personName: 'Cardinal Juan Carlos',
      personPhoto: 'assets/person.jpg'
    },
    {
      name: 'St. Mark’s Basilica',
      description: 'Famous cathedral in Venice',
      coordinates: [12.3403, 45.4342],
      personName: 'Father Lorenzo Rossi',
      personPhoto: 'assets/person1.jpg'
    }
  ];

  rotationSpeed: number = 0.5;      // controlled by slider
  rotationDuration: number = 2000;
  churchMarkers: mapboxgl.Marker[] = [];
  private animationId: number | null = null;
  private isFlying = false;
  private bearing = 0;
  private zoomStep = 1;   // step size for zoom buttons
  private slideshowTimeout: any = null;


  constructor(private ngZone: NgZone) { }

  // ➕ Zoom controls
  zoomIn() {
    if (this.map) {
      this.map.zoomTo(this.map.getZoom() + this.zoomStep, { duration: 800 });
    }
  }

  zoomOut() {
    if (this.map) {
      this.map.zoomTo(this.map.getZoom() - this.zoomStep, { duration: 800 });
    }
  }

  ngOnInit(): void {
    this.initializeMap();
  }

applyChanges() {
  // ✅ Stop old animations
  if (this.animationId) cancelAnimationFrame(this.animationId);
  if (this.slideshowTimeout) clearTimeout(this.slideshowTimeout);

  // ✅ Remove old map
  if (this.map) {
    this.map.remove();
  }

  // ✅ Reinitialize
  this.initializeMap();
}




  initializeMap(): void {
    (mapboxgl as any).accessToken = 'pk.eyJ1Ijoic2Fpa3VtYXJ0dW5ndXR1cmkiLCJhIjoiY21laDkzMGR0MDUycjJrcDZqN2xleXc3biJ9.73urhh9weHk5tslJYZ0vhQ';

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
      center: [0, 20],
      zoom: 1.5,
      projection: 'globe'
    });

    this.map.on('style.load', () => {
      this.map.setFog({});
    });

    this.map.on('load', async () => {
      // Add markers
      this.churches.forEach(church => this.addMarkerWithClick(church, 'assets/marker.png'));

      // Show/hide churches on zoom
      this.map.on('zoom', () => {
        const zoom = this.map.getZoom();
        if (zoom >= 5) {
          this.showChurches();
        } else {
          this.hideChurches();
        }
      });

      // Fly to clicked point
      this.map.on('click', (e) => {
        this.map.flyTo({
          center: [e.lngLat.lng, e.lngLat.lat],
          zoom: 5,
          essential: true
        });
      });

      // 🌍 Initial 1s rotation
      await this.startInitialRotation();

      // ⛪ Start slideshow
      this.startChurchSlideshow();
    });
  }

  // 🔄 Rotate only for 1s
  private startInitialRotation(): Promise<void> {
    return new Promise((resolve) => {
      const start = performance.now();

      const rotate = (time: number) => {
        const elapsed = time - start;

        if (elapsed < this.rotationDuration) {
           this.bearing -= 0.5;
          this.map.easeTo({ bearing: this.bearing, duration: 50, easing: (t) => t });
          this.animationId = requestAnimationFrame(rotate);
        } else {
          if (this.animationId) cancelAnimationFrame(this.animationId);
          resolve();
        }
      };

      this.ngZone.runOutsideAngular(() => requestAnimationFrame(rotate));
    });
  }

private startChurchSlideshow(): void {
  let index = 0;

  const showNextChurch = () => {
    if (!this.map) return;

    this.isFlying = true;
    const church = this.churches[index];

    // Fly to church
    this.map.flyTo({
      center: church.coordinates,
      zoom: 5,
      speed: 2,
      curve: 1,
      essential: true
    });

    // Popup
    const popup = new mapboxgl.Popup({ offset: 25, closeOnClick: false })
      .setHTML(this.buildPopupCard(church))
      .setLngLat(church.coordinates)
      .addTo(this.map);

    this.slideshowTimeout = setTimeout(() => {
      popup.remove();
      this.isFlying = false;
      index = (index + 1) % this.churches.length;

      // Schedule next
      this.slideshowTimeout = setTimeout(showNextChurch, 1000);
    }, 5000);
  };

  showNextChurch();
}


  // ➕ Popup Card Builder
  private buildPopupCard(church: Location): string {
    return `
      <div style="width:220px; padding:10px; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,0.2); font-family:sans-serif; background:#fff;">
        <img src="${church.personPhoto}" alt="${church.personName}" 
             style="width:100%; height:150px; object-fit:cover; border-radius:8px;"/>
        <h3 style="margin:8px 0 4px; font-size:16px; color:#333;">${church.name}</h3>
        <p style="margin:0; font-size:13px; color:#555;">${church.description}</p>
        <p style="margin:6px 0 0; font-size:14px; font-weight:bold; color:#222;">
          👤 ${church.personName}
        </p>
      </div>
    `;
  }

  // ➕ Marker with popup on click
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

  // ➕ Marker with hover popup
  addMarkerWithHover(location: Location, iconPath: string): mapboxgl.Marker {
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundImage = `url(${iconPath})`;
    el.style.width = '30px';
    el.style.height = '30px';
    el.style.backgroundSize = 'cover';
    el.style.cursor = 'pointer';

    const popup = new mapboxgl.Popup({
      offset: 25,
      closeButton: false,
      closeOnClick: false
    }).setHTML(this.buildPopupCard(location));

    const marker = new mapboxgl.Marker(el)
      .setLngLat(location.coordinates)
      .addTo(this.map);

    el.addEventListener('mouseenter', () => {
      popup.addTo(this.map).setLngLat(location.coordinates);
    });

    el.addEventListener('mouseleave', () => {
      popup.remove();
    });

    return marker;
  }

  showChurches() {
    if (this.churchMarkers.length === 0) {
      this.churchMarkers = this.churches.map(church =>
        this.addMarkerWithHover(church, 'assets/marker.png')
      );
    }
  }

  hideChurches() {
    this.churchMarkers.forEach(marker => marker.remove());
    this.churchMarkers = [];
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }
}