import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { HttpClient } from '@angular/common/http';
import { countryCoordinates } from '../coordinates';

// Interface for the church data
interface ChurchData {
  gender: string;
  country: string;
  language: string;
  activity: string;
  latitude: number;
  longitude: number;
}

// Map of language to quote
const translatedQuotes: { [lang: string]: string } = {
  English:
    "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life",
  French:
    "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse pas, mais qu'il ait la vie éternelle",
  Spanish:
    "Porque tanto amó Dios al mundo que dio a su Hijo unigénito, para que todo el que cree en él no perezca, sino que tenga vida eterna",
  Tagalog:
    "Sapagkat gayon na lamang ang pag-ibig ng Diyos sa sanlibutan kaya ibinigay niya ang kanyang bugtong na Anak, upang ang sinumang sumampalataya sa kanya ay hindi mapahamak kundi magkaroon ng buhay na walang hanggan",
  Hindi:
    "क्योंकि परमेश्वर ने संसार से ऐसा प्रेम रखा कि उसने अपना एकलौता पुत्र दे दिया, ताकि जो कोई उस पर विश्वास करे वह नाश न हो परन्तु अनन्त जीवन पाए",
  Yoruba:
    "Nítorí pé Ọlọrun fẹ́ ayé tó bẹ́ẹ̀ tí ó fi fúnni ní Ọmọ rẹ̀ kan ṣoṣo, kí ẹnikẹ́ni tí ó bá gbàgbọ́ sí i má bàjẹ́, ṣùgbọ́n kó ní ìyè àìnípẹ̀kun",
  Zulu:
    "Ngoba uNkulunkulu wathanda izwe kangaka waze wanikela ngeNdodana yakhe ezelwe yodwa, ukuze yilowo nalowo okholwayo kuye angabhubhi kodwa abe nokuphila okuphakade"
};

@Component({
  selector: 'app-globe-view',
  templateUrl: './globe-view.component.html',
  styleUrls: ['./globe-view.component.css']
})
export class GlobeViewComponent implements OnInit, OnDestroy {
  map!: mapboxgl.Map;
  churches: ChurchData[] = [];
  churchMarkers: mapboxgl.Marker[] = [];

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

  // Fallback data
  churches_new: ChurchData[] = [];

  isMenuOpen = false;

toggleMenu(event: MouseEvent) {
  event.stopPropagation();
  this.isMenuOpen = !this.isMenuOpen;
}

  constructor(private ngZone: NgZone, private http: HttpClient) {}

  ngOnInit(): void {
    this.startQuoteRotation();
    document.addEventListener('click', this.handleOutsideClick.bind(this));
    const apiUrl = 'https://server-486354915183.europe-west1.run.app';
    this.http.get<ChurchData[]>(apiUrl).subscribe({
      next: (data: ChurchData[]) => {
        if (data && data.length > 0) {
          // Fill latitude & longitude using country map
          this.churches = data.map(church => {
            const coords = countryCoordinates[church.country];
            if (coords) {
              // Add small random offset (jitter) to spread markers within the country region
              const latOffset = (Math.random() - 1) * 2; // between -1 and +1 degree
              const lngOffset = (Math.random() - 1) * 2;
              return {
                ...church,
                latitude: coords.lat + latOffset,
                longitude: coords.lng + lngOffset
              };
            } else {
              console.warn(`No coordinates found for ${church.country}`);
              return { ...church, latitude: 0, longitude: 0 };
            }
          });
        } else {
          console.warn('API returned empty data, using fallback.');
          this.churches = this.churches_new;
        }
        this.initializeMap();
      },
      error: (err) => {
        console.error('API error:', err, 'Using fallback data.');
        this.churches = this.churches_new;
        this.initializeMap();
      }
    });
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
      center: [0, 20],
      zoom: 1.5,
      projection: 'globe'
    });

    this.map.on('style.load', () => this.map.setFog({}));

    this.map.on('load', async () => {
      this.showChurches();
      await this.startInitialRotation();
      this.startChurchSlideshow();
       this.loading = false;
    });

    this.map.on('zoom', () => {
      const zoom = this.map.getZoom();
      zoom >= 5 ? this.showChurches() : this.hideChurches();
    });
  }

  private startInitialRotation(): Promise<void> {
    return new Promise((resolve) => {
      const start = performance.now();
      const rotate = (time: number) => {
        const elapsed = time - start;
        if (elapsed < 1000) {
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

  private startChurchSlideshow(): void {
    let index = 0;

    const showNextChurch = () => {
      if (!this.map || this.isFlying) return;
      this.isFlying = true;

      const church = this.churches[index];

      this.map.flyTo({
        center: [church.longitude, church.latitude],
        zoom: 5,
        speed: 1.5,
        curve: 1,
        essential: true
      });

      const popup = new mapboxgl.Popup({ offset: 25, closeOnClick: false })
        .setHTML(this.buildPopupCard(church))
        .setLngLat([church.longitude, church.latitude])
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

  private buildPopupCard(church: ChurchData): string {
    const personImg =
      church.gender.toLowerCase() === 'male'
        ? 'assets/Personicon.jpg'
        : 'assets/Personicon.jpg';
    const quote = translatedQuotes[church.language] || translatedQuotes['English'];

    return `
      <div style="width:220px; padding:10px; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,0.2); font-family:sans-serif; background:#fff;">
        <img src="${personImg}" alt="${church.gender}" style="width:100%; height:140px; object-fit:cover; border-radius:8px;"/>
        <h2 style="margin:8px 0 4px; font-size:16px; color:#333;">Country: ${church.country}</h2>
        <h3 style="margin:0; font-size:14px;">Language: ${church.language}</h3>
        <h3 style="margin:0; font-size:14px;">Activity: ${church.activity}</h3>
      </div>
    `;
  }

  addMarkerWithHover(church: ChurchData, iconPath: string): mapboxgl.Marker {
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundImage = `url(${iconPath})`;
    el.style.width = '30px';
    el.style.height = '30px';
    el.style.backgroundSize = 'cover';
    el.style.cursor = 'pointer';

    const popup = new mapboxgl.Popup({ offset: 25, closeButton: false, closeOnClick: false })
      .setHTML(this.buildPopupCard(church));

    const marker = new mapboxgl.Marker(el)
      .setLngLat([church.longitude, church.latitude])
      .addTo(this.map);

    el.addEventListener('mouseenter', () =>
      popup.addTo(this.map).setLngLat([church.longitude, church.latitude])
    );
    el.addEventListener('mouseleave', () => popup.remove());

    return marker;
  }

  showChurches() {
    if (this.churchMarkers.length === 0 && this.churches.length > 0) {
      this.churchMarkers = this.churches.map(church =>
        this.addMarkerWithHover(church, 'assets/marker.png')
      );
    }
  }

  hideChurches() {
    this.churchMarkers.forEach(marker => marker.remove());
    this.churchMarkers = [];
  }

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

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.quoteInterval) clearInterval(this.quoteInterval);
    document.removeEventListener('click', this.handleOutsideClick.bind(this));
  }
  private handleOutsideClick() {
  if (this.isMenuOpen) {
    this.isMenuOpen = false;
  }
}
}
