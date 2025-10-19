import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { HttpClient } from '@angular/common/http';
import { countryCoordinates } from '../coordinates';
import { Feature, FeatureCollection, Point } from 'geojson';

// Interface for the church data
interface ChurchData {
  gender: string;
  country: string;
  language: string;
  activity: string;
  latitude?: number;
  longitude?: number;
}

// Map of language to quote
const translatedQuotes: { [lang: string]: string } = {
  English: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life",
  French: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse pas, mais qu'il ait la vie éternelle",
  Spanish: "Porque tanto amó Dios al mundo que dio a su Hijo unigénito, para que todo el que cree en él no perezca, sino que tenga vida eterna",
  Tagalog: "Sapagkat gayon na lamang ang pag-ibig ng Diyos sa sanlibutan kaya ibinigay niya ang kanyang bugtong na Anak, upang ang sinumang sumampalataya sa kanya ay hindi mapahamak kundi magkaroon ng buhay na walang hanggan",
  Hindi: "क्योंकि परमेश्वर ने संसार से ऐसा प्रेम रखा कि उसने अपना एकलौता पुत्र दे दिया, ताकि जो कोई उस पर विश्वास करे वह नाश न हो परन्तु अनन्त जीवन पाए",
  Yoruba: "Nítorí pé Ọlọrun fẹ́ ayé tó bẹ́ẹ̀ tí ó fi fúnni ní Ọmọ rẹ̀ kan ṣoṣo, kí ẹnikẹ́ni tí ó bá gbàgbọ́ sí i má bàjẹ́, ṣùgbọ́n kó ní ìyè àìnípẹ̀kun",
  Zulu: "Ngoba uNkulunkulu wathanda izwe kangaka waze wanikela ngeNdodana yakhe ezelwe yodwa, ukuze yilowo nalowo okholwayo kuye angabhubhi kodwa abe nokuphila okuphakade"
};

@Component({
  selector: 'app-globe-view',
  templateUrl: './globe-view.component.html',
  styleUrls: ['./globe-view.component.css']
})
export class GlobeViewComponent implements OnInit, OnDestroy {
  map!: mapboxgl.Map;
  churches: ChurchData[] = [];
  private animationId: number | null = null;
  private isFlying = false;
  private bearing = 0;
  loading = true;

  // Quote variables
  currentEnglishQuote: string = translatedQuotes['English'];
  currentTranslatedQuote: string = translatedQuotes['French'];
  private quoteIndex = 1;
  private quoteInterval: any;
  fade = true;

  private geojsonSourceId = 'churches';

  constructor(private ngZone: NgZone, private http: HttpClient) {}

  ngOnInit(): void {
    this.startQuoteRotation();
    this.loadInitialData();
    this.subscribeToRealtimeUpdates();
  }

  // Load initial API data
  loadInitialData() {
    const apiUrl = 'https://server-486354915183.europe-west1.run.app';
    this.http.get<ChurchData[]>(apiUrl).subscribe({
      next: (data) => {
        this.churches = data.map(ch => {
          const coords = countryCoordinates[ch.country] || { lat: 0, lng: 0 };
          // Add jitter to spread markers within country
          const latOffset = (Math.random() - 0.5) * 2;
          const lngOffset = (Math.random() - 0.5) * 2;
          return { ...ch, latitude: coords.lat + latOffset, longitude: coords.lng + lngOffset };
        });
        this.initializeMap();
      },
      error: (err) => {
        console.error('API error:', err);
        // Fallback empty array
        this.churches = [];
        this.initializeMap();
      }
    });
  }

  // Initialize Mapbox
  initializeMap(): void {
    (mapboxgl as any).accessToken = 'pk.eyJ1Ijoic2Fpa3VtYXJ0dW5ndXR1cmkiLCJhIjoiY21laDkzMGR0MDUycjJrcDZqN2xleXc3biJ9.73urhh9weHk5tslJYZ0vhQ';

    this.map = new mapboxgl.Map({
      container: 'globe-map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [0, 20],
      zoom: 1.5,
      projection: 'globe'
    });

    this.map.on('style.load', () => this.map.setFog({}));

    this.map.on('load', () => {
      this.startInitialRotation();
      this.addMapSourceAndLayers();
      
      this.startChurchSlideshow();

       this.loading = false;
    });
  }

  // Add GeoJSON source & clustering
  private addMapSourceAndLayers() {
    const features: Feature<Point, any>[] = this.churches.map(ch => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [ch.longitude!, ch.latitude!] },
      properties: { ...ch }
    }));

    this.map.addSource(this.geojsonSourceId, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features } as FeatureCollection<Point, any>,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    // Cluster circles
    this.map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: this.geojsonSourceId,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#f28cb1',
        'circle-radius': ['step', ['get', 'point_count'], 15, 100, 20, 750, 25]
      }
    });

    // Cluster count
    this.map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: this.geojsonSourceId,
      filter: ['has', 'point_count'],
      layout: { 'text-field': '{point_count_abbreviated}', 'text-size': 12 }
    });

    // Individual points
    this.map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: this.geojsonSourceId,
      filter: ['!', ['has', 'point_count']],
      paint: { 'circle-color': '#11b4da', 'circle-radius': 6 }
    });

    // Popup
    this.map.on('click', 'unclustered-point', (e) => {
      const props = (e.features![0].properties as any);
      new mapboxgl.Popup()
        .setLngLat((e.features![0].geometry as any).coordinates)
        .setHTML(this.buildPopupCard({
          ...props,
          latitude: (e.features![0].geometry as any).coordinates[1],
          longitude: (e.features![0].geometry as any).coordinates[0]
        }))
        .addTo(this.map);
    });
  }

  // Initial rotation animation
  private startInitialRotation(): void {
    const start = performance.now();
    const rotate = (time: number) => {
      const elapsed = time - start;
      if (elapsed < 1000) {
        this.bearing -= 0.5;
        this.map.easeTo({ bearing: this.bearing, duration: 50, easing: t => t });
        this.animationId = requestAnimationFrame(rotate);
      } else if (this.animationId) cancelAnimationFrame(this.animationId);
    };
    this.ngZone.runOutsideAngular(() => requestAnimationFrame(rotate));
  }

  // Slideshow / flyTo
  private startChurchSlideshow(): void {
    let index = 0;
    const showNextChurch = () => {
      if (!this.map || this.isFlying || this.churches.length === 0) return;

      this.isFlying = true;
      const church = this.churches[index];

      this.map.flyTo({
        center: [church.longitude!, church.latitude!],
        zoom: 5,
        speed: 1.5,
        curve: 1,
        essential: true
      });

      const popup = new mapboxgl.Popup({ offset: 25, closeOnClick: false })
        .setHTML(this.buildPopupCard(church))
        .setLngLat([church.longitude!, church.latitude!])
        .addTo(this.map);

      setTimeout(() => {
        popup.remove();
        this.isFlying = false;
        index = (index + 1) % this.churches.length;
        setTimeout(showNextChurch, 1000);
      }, 5000);
    };
    showNextChurch();
  }

  // Build HTML for popup card
  private buildPopupCard(church: ChurchData): string {
    const personImg = church.gender?.toLowerCase() === 'male' ? 'assets/Personicon.jpg' : 'assets/Personicon.jpg';

    return `
      <div style="width:220px; padding:10px; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,0.2); background:#fff;">
        <img src="${personImg}" alt="${church.gender}" style="width:100%; height:150px; object-fit:cover; border-radius:8px;"/>
        <h3>${church.country}</h3>
        <p>${church.language} | ${church.activity}</p>
      </div>`;
  }

  // Quote rotation
  private startQuoteRotation(): void {
    const langs = Object.keys(translatedQuotes);
    this.quoteInterval = setInterval(() => {
      this.fade = false;
      setTimeout(() => {
        this.quoteIndex = (this.quoteIndex + 1) % langs.length;
        const lang = langs[this.quoteIndex];
        this.currentTranslatedQuote = translatedQuotes[lang];
        this.fade = true;
      }, 1500);
    }, 5000);
  }

  // Real-time updates (WebSocket/SSE)
  private subscribeToRealtimeUpdates(): void {
    const ws = new WebSocket('wss://your-server/realtime-church');
    ws.onmessage = (event) => {
      const newChurch = JSON.parse(event.data) as ChurchData;

      const coords = countryCoordinates[newChurch.country] || { lat: 0, lng: 0 };
      newChurch.latitude = coords.lat + (Math.random() - 0.5) * 2;
      newChurch.longitude = coords.lng + (Math.random() - 0.5) * 2;

      this.churches.push(newChurch);

      const source = this.map.getSource(this.geojsonSourceId) as mapboxgl.GeoJSONSource;
      const data = source._data as any;
      data.features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [newChurch.longitude, newChurch.latitude] },
        properties: { ...newChurch }
      });
      source.setData(data);
    };
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.quoteInterval) clearInterval(this.quoteInterval);
  }
}
