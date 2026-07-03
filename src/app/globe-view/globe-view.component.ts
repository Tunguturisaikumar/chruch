import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { HttpClient } from '@angular/common/http';
import { countryCoordinates } from '../coordinates';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { LoginComponent } from '../login/login.component';
import { MatDialog } from '@angular/material/dialog';
import { RealtimeService } from '../services/realtime.service';
import { WebsocketService } from '../services/websocket.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

interface ChurchData {
  gender: string;
  country: string;
  language: string;
  activity: string;
  latitude: number;
  longitude: number;

  imageIndex?: number;
  imageKey?: string;
  groupCount?: number;
}

interface CityData {
  city: string;
  lat: number;
  lng: number;
  country: string;
  population: number;
}

const translatedQuotes: { [lang: string]: string } = {
  Afrikaans:
    "(Afrikaans) “Want so lief het God die wêreld gehad, dat Hy sy eniggebore Seun gegee het, sodat elkeen wat in Hom glo, nie verlore mag gaan nie, maar ewige lewe kan hê.” — Johannes 3:16",
  Albanian:
    "(Albanian) “Sepse Perëndia e ka dashur shumë botën, sa që ia dha Birin e vet të vetmuar, që kushdo që beson te Ai të mos humbasë, por të ketë jetë të përjetshme.” — Gjoni 3:16",
  Amharic:
    "(Amharic) “በእኔ እግዚአብሔር ዓለምን እንደዚህ አፍቅሮ የነበረ፣ ብቻውን የሆነውን ልጁን ሰጠ፤ ያም እርሱን የሚመከር ሁሉ እንዳይጠፋ፣ ነገር ግን ለዘላለም ሕይወት እንዲኖረው ነው።” — ዮሐንስ 3:16",
  Arabic:
    '(Arabic) "لأَنَّ اللهَ أَحَبَّ الْعَالَمَ حَتَّى بَذَلَ ابْنَهُ الْوَحِيدَ، لِكَيْ لا يَهْلِكَ كُلُّ مَنْ يُؤْمِنُ بِهِ، بَلْ تَكُونُ لَهُ الْحَيَاةُ الأَبَدِيَّةُ.» — يوحنا 3:16"',
  Bengali:
    '(Bengali) "কারণ ঈশ্বর জগৎকে এমন প্রেম করিলেন যে, তাঁর একমাত্র পুত্রকে দান করিলেন, যেন, যারা তাঁকে বিশ্বাস করে, তারা বিনষ্ট না হয়, কিন্তু অনন্ত জীবন পায়।" — যোহন 3:16',
  Burmese:
    "(Burmese) “ဘုရားသခင်ကကမ္ဘာကြီးကိုဒီနည်းနည်းချစ်၍သူ၏တစ်ဦးတည်းသောကလေးကိုပေးလိုက်သည်၊သူ့ကိုယုံကြည်သူတိုင်းမပျောက်ကွယ်ပါနှင့်၊အသက်အမြဲ ရေပါစေ။” — ယော်ဟန ၃:၁၆",
  Dari:
    "(Dari) “زیرا خدا جهان را چنان دوست داشت که پسر یگانه خویش را داد، تا هر که به او ایمان آورد هلاک نشود بلکه حیات ابدی یابد.” — یوحنا ۳:۱۶",
  Dutch:
    "(Dutch) “Want God had de wereld zo lief dat hij zijn eniggeboren Zoon gaf, opdat iedereen die in hem gelooft niet verloren gaat, maar eeuwig leven heeft.” — Johannes 3:16",
  French:
    '(French) "Car Dieu a tant aimé le monde qu’il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu’il ait la vie éternelle." — Jean 3:16',
  German:
    '(German) "Denn also hat Gott die Welt geliebt, dass er seinen eingeborenen Sohn gab, damit alle, die an ihn glauben, nicht verloren werden, sondern ewiges Leben haben." — Johannes 3,16',
  Hausa:
    "(Hausa) “Gama Allah ya so duniya ƙwarai, har ya ba da Ɗansa ɗaya tilo, domin duk wanda ya gaskata da shi kada ya ɓace, amma ya samu rai na har abada.” — Yohanna 3:16",
  Hindi:
    "(Hindi) “क्योंकि परमेश्‍वर ने जगत से ऐसा प्रेम रखा कि उसने अपना एकलौता पुत्र दे दिया, ताकि जो कोई उस पर विश्वास करे वह नष्ट न हो, परन्तु अनन्त जीवन पाए।” — योहन 3:16",
  Japanese:
    '(Japanese) "神はそのひとり子をお与えになったほどに、世を愛された。それは、彼を信じる者が、一人として滅びることなく、永遠の命を持つためである。" — ヨハネ 3:16',
  Kannada:
    "(Kannada) “ದೇವರು ಪ್ರಪಂಚವನ್ನು ಇಷ್ಟು ಪ್ರೀತಿಸಿದನೇಕೆಂದರೆ, ತನ್ನ ಏಕೈಕ ಪುತ್ರನನ್ನು ಕೊಟ್ಟನು; ಆತನಿಗೆ ನಂಬಿಕೆ ಇಡುವವನು ಹಾನಿಗೊಳ್ಳದಿದ್ದಾನೆ, ಆದರೆ ಎಂದಿಗೂ ನಲ್ಲೇ ಇರುವ ಜೀವವನ್ನು ಹೊಂದುವನು।” — ಯೋಹಾನ 3:16",
  Korean:
    "(Korean) “하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망치 않고 영생을 얻게 하려 하심이라.” — 요한복음 3:16",
  Lao:
    "(Lao) “ເພາະພຣະເຈົ້າໄດ້ຮັກໂລກໃນພາບນີ້ຫຼາຍກວ່າສິ່ງໃດ ເຖິງຂຶ້ນຊ້າວໃຫ້ລູກຜູ້ໜຶ່ງຂອງພຣະອົງ ເພື່ອວ່າໃຜເຊື່ອມິດຕົວເຂົາຈະບໍ່ສູນເສຍ ແຕ່ຈະໄດ້ຊີວິດຊົ່ວຄາວ.” — ຢູດຍ 3:16",
  Nepali:
    "(Nepali) “किनभने परमेश्वरले संसारलाई यति माया गर्नुभयो कि उहाँले आफ्ना एकमात्र पुत्रलाई दिनुभयो, ताकि जो कुनै उहाँमाथि विश्वास गर्छ, त्यहाँ नाश नहोस्, तर अनन्त जीवन पाओस्।” — युहन्ना 3:16",
  Odia:
    "(Odia) “କାରଣ ଭଲିରେ, ପରମେଶ୍ୱର ଲୋକକୁ ଏତେ ଭଲ ପାଏଛନ୍ତି ଯେ, ସେ ତାଙ୍କର ଏକମାତ୍ର ପୁଆକୁ ଦେଇଛନ୍ତି, ଯାହାର ଉପରେ ଯେ କେହି ଆସ୍ଥା କରେ, ସେ ନଷ୍ଟ ହେବ ନାହିଁ, ଅନନ୍ତ ଜୀବନ ପାଇବ।” — ଯୋହନ 3:16",
  Pashto:
    "(Pashto) “ځکه چې خدای دنیا دومره مینه کړه چې خپل یوازینی زوی یې ورکړ، ترڅو هر هغه څوک چې په هغه باور وکړي هلاک نه شي بلکه د تل لپاره ژوند ولري.” — یوحنا ۳:۱۶",
  Portuguese:
    "(Portuguese) “Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.” — João 3:16",
  Romanian:
    '(Romanian) "Căci Dumnezeu a iubit lumea atât de mult, încât L-a dat pe Fiul Său Unul-Născut, pentru ca oricine crede în El să nu piară, ci să aibă viață veșnică." — Ioan 3:16',
  Russian:
    '(Russian) "Ибо так возлюбил Бог мир, что отдал Сына Своего Единородного, дабы всякий, верующий в Него, не погиб, но имел жизнь вечную." — Иоанн 3:16',
  Spanish:
    '(Spanish) "Porque de tal manera amó Dios al mundo, que dio a su Hijo unigénito, para que todo aquel que en él cree no se pierda, mas tenga vida eterna." — Juan 3:16',
  Swahili:
    "(Swahili) “Maana Mungu aliupenda ulimwengu hivi, hata akamtoa Mwanawe pekee, ili kila mtu amwaminiye asipoteee, bali awe na uzima wa milele.” — Yohana 3:16",
  Tagalog:
    "(Tagalog) “Sapagkat gayon na lamang ang pag-ibig ng Diyos sa sanlibutan, na ibinigay Niya ang Kaniyang bugtong na Anak, upang ang sinumang sumampalataya sa Kanya ay hindi mapahamak, kundi magkaroon ng buhay na walang hanggan.” — Juan 3:16",
  Tamil:
    "(Tamil) “ஏனென்றால், கடவுள் உலகத்தை இப்படித்தான் நேசித்தார்: தன் ஒரே மகனைக் கொடுத்தார்; அவரைப் பயில்பவனாகுகிற யாவரும் அழிந்து போகவில்லை; சீற்ற வாழ்க்கையைப் பெறுவர்.” — யோவான் 3:16",
  Telugu:
    "(Telugu) “దేవుడు ప్రపంచాన్ని ఈ విధంగా ప్రేమించెను: తన ఏకైక కుమారుని ఇచ్చెను, అతనిని నమ్మునందుకు ఎవరైనా ఓడిపోవక, నిత్యజీవితం పొందాలని।” — యోహాను 3:16",
  Thai:
    "(Thai) “เพราะพระเจ้าทรงรักโลกเช่นนี้ จึงทรงประทานพระบุตรองค์เดียวของพระองค์ เพื่อทุกคนที่เชื่อในพระองค์ จะไม่พินาศ แต่จักมีชีวิตนิรันดร์.” — ยอห์น 3:16",
  Ukrainian:
    '(Ukrainian) "Бо так полюбив Бог світ, що віддав Сина Сво­го Єдинородного, щоб кожен, хто вірує в Нього, не загинув, але мав життя вічне." — Іван 3:16',
  Urdu:
    "(Urdu) “کیونکہ خدا نے دنیا سے ایسی محبت رکھی کہ اُس نے اپنا اکلوتا بیٹا دے دیا، تاکہ جو کوئی اُس پر ایمان لائے ہلاک نہ ہو بلکہ ہمیشہ کی زندگی پائے۔” — یوحنا 3:16",
  Uzbek:
    "(Uzbek) “Chunki Xudo dunyoni shunday sevdi: U yagona O‘g‘lini berdi, shunda Unga ishonadigan har kishi yo‘qolib ketmasin, balki abadiy hayotga ega bo‘lsin.” — Yuhanno 3:16",
  Vietnamese:
    "(Vietnamese) “Vì Đức Chúa Trời đã yêu thương thế gian đến nỗi ban Con Một của Ngài, hầu cho hễ ai tin Con ấy không bị hư mất mà được sự sống đời đời.” — Giăng 3:16",
};



@Component({
  selector: 'app-globe-view',
  templateUrl: './globe-view.component.html',
  styleUrls: ['./globe-view.component.css']
})
export class GlobeViewComponent implements OnInit, OnDestroy {
  map!: mapboxgl.Map;
  churches: ChurchData[] = [];
  cities: CityData[] = [];
  churchMarkers: mapboxgl.Marker[] = [];
  private websocketSubscription?: Subscription;
  private outsideClickHandler = this.handleOutsideClick.bind(this);

  private animationId: number | null = null;
  private isFlying = false;
  private bearing = 0;
  loading = true;
  private imageCache: { [key: string]: string } = {};

  currentEnglishQuote: string = translatedQuotes['English'];
  currentTranslatedQuote: string = translatedQuotes['French'];
  private quoteIndex = 1;
  private quoteInterval: any;
  fade = true;

  churches_new: ChurchData[] = [];

  isMenuOpen = false;
  private previousCountryPopups: mapboxgl.Popup[] = [];
  private lastCountry: string | null = null;
  private isMainPopupActive = false;

  slideshowDelaySeconds: number = 17;
  tempSlideshowInput: number = 17;

  private currentDelayTimer: any = null;
  private currentDelayResolve: (() => void) | null = null;

  private readonly IMAGE_POOL_SIZE = 10;
  private readonly BRAZIL_POOL_SIZE = 14;
  private readonly IMAGE_COOLDOWN = 5;

  private createdPopupKeys = new Set<string>();
  showPastRecords: number = 20;        // active value
  tempMaxSmallPopups: number = 20;    // input value

  private readonly ARGENTINA_POOL_SIZE = 10; // adjust if needed
  groupBatchSize: number = 4;       // active value
  tempGroupBatchSize: number = 4;   // input value
  private isSlideshowRunning = false;

  private argentinaFallbackHistory: {
    [gender: string]: number[];
  } = {};

  private getActivityKey(church: ChurchData): string {
    return `${church.country}_${church.activity}`;
  }

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  zoomIn() {
    if (this.map) {
      const currentZoom = this.map.getZoom();
      this.map.easeTo({
        zoom: currentZoom + 1,
        duration: 1000,
        easing: t => t * (2 - t)
      });
    }
  }

  zoomOut() {
    if (this.map) {
      const currentZoom = this.map.getZoom();
      this.map.easeTo({
        zoom: currentZoom - 1,
        duration: 1000,
        easing: t => t * (2 - t)
      });
    }
  }

  constructor(private ngZone: NgZone, private http: HttpClient, private dialog: MatDialog, private realtime: RealtimeService, private websocket: WebsocketService, private auth: AuthService) { }

  openLoginPopup() {

    this.dialog.open(LoginComponent, {
      width: '400px',
      disableClose: true
    });

  }

  ngOnInit(): void {
    this.loadSettings();
    this.startQuoteRotation();
    document.addEventListener('click', this.outsideClickHandler);

    this.http.get<CityData[]>('assets/worldcities.json').subscribe({
      next: (citiesData) => {
        this.cities = citiesData;
        this.loadChurchData();
      },
      error: (err) => {
        // console.error('Failed to load cities.json', err);
        this.loadChurchData();
      }
    });
  }

  loadSettings(): void {
    this.auth.getSettings().subscribe({
      next: (settings) => {
        this.showPastRecords = settings.showPastRecords;
        this.slideshowDelaySeconds = settings.cardDuration;
        this.groupBatchSize = settings.groupCount;

        console.log('Settings Loaded:', settings);
      },
      error: (err) => {
        console.error('Failed to load settings', err);
      }
    });
  }

  applySlideshowDelay(): void {
    const v = Number(this.tempSlideshowInput) || 17;
    const clamped = Math.max(1, Math.min(60, Math.floor(v)));
    this.slideshowDelaySeconds = clamped;
    this.tempSlideshowInput = clamped;

    if (this.currentDelayTimer && this.currentDelayResolve) {
      clearTimeout(this.currentDelayTimer);

      this.currentDelayTimer = setTimeout(() => {
        const resolve = this.currentDelayResolve;
        this.currentDelayTimer = null;
        this.currentDelayResolve = null;
        if (resolve) resolve();
      }, this.slideshowDelaySeconds * 1000);
    }
  }

  applyGroupBatchSize(): void {
    const v = Number(this.tempGroupBatchSize) || 4;

    // clamp between 4 and 10
    const clamped = Math.max(1, Math.min(100, Math.floor(v)));

    this.groupBatchSize = clamped;
    this.tempGroupBatchSize = clamped;

    // console.log('✅ New Batch Size:', this.groupBatchSize);

    this.restartSlideshow();
  }

  private buildDisplayList(): ChurchData[] {

    const result: ChurchData[] = [...this.churches];
    const groupedActivities = [
      'Bible Reading Plan',
      'Website Visitor'
    ];

    const activityMap: { [key: string]: number[] } = {};
    // ✅ STEP 1: collect indexes of each activity
    this.churches.forEach((church, index) => {
      if (groupedActivities.includes(church.activity)) {
        if (!activityMap[church.activity]) {
          activityMap[church.activity] = [];
        }
        activityMap[church.activity].push(index);
      }
    });

    // ✅ STEP 2: process each activity
    Object.keys(activityMap).forEach(activity => {
      const indexes = activityMap[activity];

      for (let i = 0; i < indexes.length; i += this.groupBatchSize) {
        const batchIndexes = indexes.slice(i, i + this.groupBatchSize);

        if (batchIndexes.length === this.groupBatchSize) {
          const firstIndex = batchIndexes[0];

          // ✅ replace first item with grouped
          result[firstIndex] = {
            ...this.churches[firstIndex],
            groupCount: this.groupBatchSize - 1
          };

          // ❌ remove rest of batch
          for (let k = 1; k < batchIndexes.length; k++) {
            result[batchIndexes[k]] = null as any;
          }
        }
      }
    });

    // ✅ STEP 3: remove nulls
    return result.filter(x => x !== null);

  }


  private restartSlideshow(): void {
    // console.log('🔁 Restarting slideshow...');

    // ✅ HARD STOP
    this.stopSlideshow();

    // ✅ clear popups
    this.previousCountryPopups.forEach(p => {
      try { p.remove(); } catch { }
    });
    this.previousCountryPopups = [];
    this.createdPopupKeys.clear();

    // ✅ IMPORTANT: allow restart
    this.isSlideshowRunning = false;

    setTimeout(() => {
      this.startChurchSlideshow();
    }, 200);
  }

  private loadChurchData(): void {

    this.realtime.getHistory().subscribe({

      next: (data) => {

        // console.log("================================");
        // console.log("History API Response");
        // console.log("Total Records :", data.length);
        // console.table(data);
        // console.log("================================");

        // Load initial history
        const history = this.assignCityCoordinates(data);
        // console.log("Churches After Coordinates :", this.churches.length);
        this.assignImagesToChurches(history);

        // Keep all history
        this.churches = history;

        // Only use latest 20 for the initial display
        this.churches = history.slice(0, 20);

        this.preloadImages(this.churches);

        // Existing map initialization
        this.initializeMap();

        // Start listening for live events
        this.initializeRealtime();

      },

      error: (err) => {

        console.error(err);

      }

    });

  }

  private initializeRealtime(): void {

    this.websocket.connect();

    this.websocketSubscription = this.websocket.events$.subscribe(event => {
      // console.log("===============================");
      // console.log("Received in Globe");
      // console.table(event);

      const church = this.assignCityCoordinates([event])[0];
      // console.log("After Coordinates");
      // console.table(church);

      this.assignImagesToChurches([church]);

      // Add to complete history
      this.churches.push(church);

      // Keep only latest 100
      if (this.churches.length > 100) {
        this.churches.shift();
      }


      // console.log("Current Churches :", this.churches.length);

    });

  }

  private assignCityCoordinates(data: ChurchData[]): ChurchData[] {
    const updated: ChurchData[] = [];

    data.forEach(church => {
      const citiesInCountry = this.cities.filter(
        c =>
          c?.country?.toLowerCase?.() &&
          church?.country?.toLowerCase?.() &&
          c.country.toLowerCase() === church.country.toLowerCase()
      );


      if (citiesInCountry.length > 0) {
        const randomCity = citiesInCountry[Math.floor(Math.random() * citiesInCountry.length)];
        updated.push({
          ...church,
          latitude: randomCity.lat,
          longitude: randomCity.lng
        });
      } else {
        const countryMatch = countryCoordinates.find(c => {
          const countryName = c?.name?.toLowerCase?.();
          const churchCountry = church?.country?.toLowerCase?.();
          return countryName && churchCountry && countryName === churchCountry;
        });

        if (countryMatch) {
          updated.push({
            ...church,
            latitude: countryMatch.latitude,
            longitude: countryMatch.longitude
          });
        } else {
          updated.push({ ...church, latitude: 0, longitude: 0 });
        }
      }
    });

    // console.log(updated);

    return updated;
  }

  initializeMap(): void {
    (mapboxgl as any).accessToken =
      environment.mapboxToken;

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
            attribution: ''
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
      this.startChurchSlideshow();
      this.loading = false;
    });
    this.map.on('zoom', () => {
      const zoom = this.map.getZoom();
      zoom >= 5 ? this.showChurches() : this.hideChurches();
    });
  }

  private startInitialRotation(rotations: number = 1, durationMs: number = 10000): Promise<void> {
    return new Promise(resolve => {
      const start = performance.now();
      const totalDegrees = 360 * rotations;
      // capture starting bearing
      const startBearing = this.bearing;

      const rotateFrame = (time: number) => {
        const elapsed = time - start;
        const t = Math.min(elapsed / durationMs, 1);

        const degreesDone = totalDegrees * t;
        this.bearing = startBearing - degreesDone;

        this.map.jumpTo({ bearing: this.bearing });

        if (t < 1) {
          this.animationId = requestAnimationFrame(rotateFrame);
        } else {
          if (this.animationId) cancelAnimationFrame(this.animationId);
          resolve();
        }
      };

      this.ngZone.runOutsideAngular(() => {
        this.animationId = requestAnimationFrame(rotateFrame);
      });
    });
  }



  private transitionBetweenCards(
    fromLngLat: [number, number],
    toLngLat: [number, number],
    transitionDurationMs: number = 2000
  ): Promise<void> {
    return new Promise(resolve => {

      this.isMainPopupActive = false;
      const hadMarkers = this.churchMarkers && this.churchMarkers.length > 0;
      if (hadMarkers) this.hideChurches();

      try { (this.map as any).stop && (this.map as any).stop(); } catch (e) { }

      this.ngZone.runOutsideAngular(() => {
        const startTime = performance.now();

        const transitionFrame = (time: number) => {
          const elapsed = time - startTime;
          const progress = Math.min(elapsed / transitionDurationMs, 1); // 0 to 1

          let currentLng: number;
          let currentLat: number;
          let currentZoom: number;

          if (progress < 0.33) {
            const phaseProgress = progress / 0.33;
            currentLng = fromLngLat[0];
            currentLat = fromLngLat[1];
            currentZoom = 5 - (5 - 1.5) * phaseProgress;
          } else if (progress < 0.66) {
            const phaseProgress = (progress - 0.33) / 0.33;
            currentLng = fromLngLat[0] + (toLngLat[0] - fromLngLat[0]) * phaseProgress;
            currentLat = fromLngLat[1] + (toLngLat[1] - fromLngLat[1]) * phaseProgress;
            currentZoom = 1.5;
          } else {
            const phaseProgress = (progress - 0.66) / 0.34;
            currentLng = toLngLat[0];
            currentLat = toLngLat[1];
            currentZoom = 1.5 + (5 - 1.5) * phaseProgress;
          }

          this.map.jumpTo({
            center: [currentLng, currentLat],
            zoom: currentZoom,
            bearing: 0,
            pitch: 0
          });

          if (progress < 1) {
            this.animationId = requestAnimationFrame(transitionFrame);
          } else {
            if (this.animationId) cancelAnimationFrame(this.animationId);

            const finalZoom = this.map.getZoom();
            if (hadMarkers && finalZoom >= 5) {
              this.showChurches();
            }

            resolve();
          }
        };

        this.animationId = requestAnimationFrame(transitionFrame);
      });
    });
  }

  applyMaxSmallPopups(): void {
    const v = Number(this.tempMaxSmallPopups);

    const clamped = Number.isFinite(v)
      ? Math.max(5, Math.min(500, Math.floor(v)))
      : 5;

    this.showPastRecords = clamped;
    this.tempMaxSmallPopups = clamped;

    // 🔥 IMPORTANT: enforce immediately
    this.enforcePopupLimit();
  }

  private enforcePopupLimit(): void {
    while (this.previousCountryPopups.length > this.showPastRecords) {
      const oldest = this.previousCountryPopups.shift();

      if (oldest) {
        const el = oldest.getElement();

        if (el) {
          el.classList.add('small-popup-exit');
          setTimeout(() => {
            try { oldest.remove(); } catch { }
          }, 300);
        } else {
          try { oldest.remove(); } catch { }
        }
      }
    }
  }




  private startChurchSlideshow(): void {
    if (this.isSlideshowRunning) {
      // console.log('⚠ Force restarting slideshow...');
      this.stopSlideshow();
    }
    this.isSlideshowRunning = true;

    const shownChurches: ChurchData[] = [];
    let currentMainPopup: mapboxgl.Popup | null = null;
    const displayList = this.buildDisplayList();
    if (displayList.length === 0) {
      console.warn('No churches available for slideshow.');
      return;
    }
    console.log("Display List Length :", displayList.length);
    // console.table(displayList);
    const initialCount = Math.min(
      this.showPastRecords,
      displayList.length
    );

    let index = initialCount;
    if (index >= displayList.length) {
      index = 0;
    }
    console.log("=================================");
    console.log("Initial Small Popup Count :", initialCount);
    console.log("Max Small Popups         :", this.showPastRecords);
    console.log("Main Popup Starts Index  :", index);
    console.log("First Main Popup Record :", displayList[index]);
    console.log("=================================");
    shownChurches.push(
      ...displayList.slice(0, initialCount)
    ); // ✅ IMPORTANT
    // console.table(displayList);
    // console.log("Initial Display List :", displayList.length);

    const showNextChurch = async () => {
      if (!this.map || this.isFlying || !this.isSlideshowRunning) return;


      const church = displayList[index];
      console.log("Display List Length :", displayList.length);
      console.log("Current Index :", index);
      console.log(
        `Main Popup -> Index: ${index}, Church:`,
        church
      );

      if (!church || church.latitude === 0 || church.longitude === 0) {
        index = (index + 1) % displayList.length;
        showNextChurch();
        return;
      }

      if (currentMainPopup) {
        currentMainPopup.remove();
        currentMainPopup = null;
      }

      this.isFlying = true;

      // ✅ smooth animation (no jump)
      this.map.flyTo({
        center: [church.longitude, church.latitude],
        zoom: 5,
        speed: 1.2,
        curve: 1.2,
        essential: true
      });

      // small popups
      const recentChurches = shownChurches;

      recentChurches.forEach(prev => {
        const key = `${prev.latitude}_${prev.longitude}_${prev.country}`;
        if (this.createdPopupKeys.has(key)) return;

        const smallPopup = new mapboxgl.Popup({
          offset: 10,
          closeButton: false,
          className: 'small-popup'
        })
          .setHTML(this.buildSmallPopup(prev))
          .setLngLat([prev.longitude + 0.3, prev.latitude + 0.3])
          .addTo(this.map);

        this.previousCountryPopups.push(smallPopup);
        this.createdPopupKeys.add(key);
        this.enforcePopupLimit();
      });

      // ✅ GROUP LOGIC (CLEAN)
      let popupHtml: string;
      if (church.groupCount && church.groupCount > 0) {

        // console.log('🚀 GROUP DISPLAYED:', {
        //   activity: church.activity,
        //   country: church.country,
        //   selectedBatchSize: this.groupBatchSize,
        //   displayedOthersCount: church.groupCount,
        //   totalRecordsInGroup: church.groupCount + 1
        // });

        popupHtml = this.buildPopupCardGrouped(
          church,
          church.groupCount
        );

      } else {

        // console.log('👤 SINGLE DISPLAYED:', {
        //   activity: church.activity,
        //   country: church.country
        // });

        popupHtml = this.buildPopupCard(church);
      }

      currentMainPopup = new mapboxgl.Popup({
        offset: 25,
        closeOnClick: false,
        className: 'main-popup'
      })
        .setHTML(popupHtml)
        .setLngLat([church.longitude, church.latitude])
        .addTo(this.map);

      this.isMainPopupActive = true;
      shownChurches.push(church);
      console.log('-----------------------------');
      console.log('Configured showPastRecords :', this.showPastRecords);
      console.log('Before trim:', shownChurches.length);

      while (shownChurches.length > this.showPastRecords) {
        console.log('Removing oldest popup...');
        shownChurches.shift();
      }

      console.log('After trim:', shownChurches.length);
      console.log('-----------------------------');

      // delay
      await new Promise<void>((res) => {
        this.currentDelayResolve = res;
        this.currentDelayTimer = setTimeout(res, this.slideshowDelaySeconds * 1000);
      });

      if (currentMainPopup) {
        currentMainPopup.remove();
        currentMainPopup = null;
        this.isMainPopupActive = false;
      }

      // 🔥 find next DIFFERENT location
      let nextIndex = (index + 1) % displayList.length;

      let safety = 0;

      while (
        displayList[nextIndex] &&
        displayList[nextIndex].latitude === church.latitude &&
        displayList[nextIndex].longitude === church.longitude &&
        safety < displayList.length
      ) {
        nextIndex = (nextIndex + 1) % displayList.length;
        safety++;
      }

      const nextChurch = displayList[nextIndex];

      // ✅ animate only if location is different
      await this.transitionBetweenCards(
        [church.longitude, church.latitude],
        [nextChurch.longitude, nextChurch.latitude],
        2500
      );

      index = nextIndex;
      this.isFlying = false;

      showNextChurch();
    };

    showNextChurch();
  }

  private stopSlideshow(): void {
    this.isSlideshowRunning = false;

    if (this.currentDelayTimer) {
      clearTimeout(this.currentDelayTimer);
      this.currentDelayTimer = null;
    }

    if (this.currentDelayResolve) {
      this.currentDelayResolve();
      this.currentDelayResolve = null;
    }
  }

  private buildPopupCardGrouped(
    church: ChurchData,
    count: number
  ): string {
    const personImg = this.getImageForChurch(church);

    let displayActivity = church.activity;

    if (church.activity == 'Youversion') {
      displayActivity = 'Bible Reading Plan';
    } else if (church.activity == 'Bible Word') {
      displayActivity = 'Website Visitor';
    }

    return `
<div style="
  width:160px;
  padding:10px;
  border-radius:12px;
  overflow:hidden;
  background:#fff;
  box-shadow:0 4px 12px rgba(0,0,0,0.2);
  font-family:sans-serif;
">

  <!-- IMAGE -->

  <div style="
  width:100%;
  height:100px;
  // border-radius:10px;
  overflow:hidden;
  margin-bottom:8px;
">
  <img 
    src="${personImg}" 
    alt="${church.gender}" 
    style="
      width:100%;
      height:100%;
      object-fit:cover;
      display:block;
    "
  />
</div>

${count >= 1
        ? `
    <span style="margin-top:6px; font-weight:600;">
      and ${count} ${count === 1 ? 'other' : 'others'}
    </span>
  `
        : ''
      }
  <!-- CONTENT -->
<div style="
  display:grid;
  grid-template-columns: 70px 1fr;
  row-gap:4px;
  align-items:start;
">

  <span style="font-weight:600;">Country:</span>
  <span style="font-weight:700;">${church.country}</span>

  ${church.language &&
        church.language.toString().trim() !== '' &&
        church.language.toString().toLowerCase() !== 'null'
        ? `
    <span style="font-weight:600;">Language:</span>
    <span style="font-weight:700;">${church.language}</span>
  `
        : ''
      }

  <span style="font-weight:600;">Activity:</span>
  <span style="font-weight:700; word-break:break-word;">
    ${displayActivity}
  </span>

</div>

</div>
`;
  }

  private recentImageHistory: {
    [cacheKey: string]: number[];
  } = {};

  private getNonRepeatingRandomIndex(
    cacheKey: string,
    totalImages: number
  ): number {
    if (!this.recentImageHistory[cacheKey]) {
      this.recentImageHistory[cacheKey] = [];
    }

    const history = this.recentImageHistory[cacheKey];

    const allowed: number[] = [];
    for (let i = 1; i <= totalImages; i++) {
      if (!history.includes(i)) {
        allowed.push(i);
      }
    }

    if (allowed.length === 0) {
      history.length = 0;
      for (let i = 1; i <= totalImages; i++) {
        allowed.push(i);
      }
    }

    const index = allowed[Math.floor(Math.random() * allowed.length)];

    history.push(index);
    if (history.length > this.IMAGE_COOLDOWN) {
      history.shift();
    }

    return index;
  }

  private assignImagesToChurches(churches: ChurchData[]): void {
    const history: { [key: string]: number[] } = {};

    churches.forEach(church => {
      // ✅ Skip invalid country records
      if (!church?.country) {
        console.warn('Skipping church because country is missing:', church);
        return;
      }

      const gender = (church.gender || 'male')
        .toLowerCase()
        .trim();

      const country = church.country.trim();

      const countryFolder = this.normalizeCountryForFolder(country || '');
      const genderFolder = gender === 'female' ? 'female' : 'male';

      const historyKey = `${countryFolder}_${genderFolder}`;

      const totalImages =
        country.toLowerCase() === 'brazil'
          ? this.BRAZIL_POOL_SIZE
          : this.IMAGE_POOL_SIZE;

      const imageIndex = this.getNonRepeatingRandomIndex(
        historyKey,
        totalImages
      );

      church.imageIndex = imageIndex;
      church.imageKey = `${historyKey}_${imageIndex}`;
    });
  }



  private preloadImages(churches: ChurchData[]): void {
    const bucketBaseUrl = 'https://storage.googleapis.com/my-chruch-images';
    const uniqueKeys = new Set<string>();

    churches.forEach(church => {
      let gender = (church.gender || '').toLowerCase().trim();
      const country = (church.country || '').trim();
      if (!country) return;

      if (!gender) gender = Math.random() < 0.5 ? 'male' : 'female';

      const countryFolder = this.normalizeCountryForFolder(country);

      const genderFolder = gender === 'female' ? 'female' : 'male';

      const fileCountry = countryFolder;
      const fileGender =
        gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();

      const cacheKey = church.imageKey!;

      if (uniqueKeys.has(cacheKey)) return;

      uniqueKeys.add(cacheKey);

      const totalImages = country.toLowerCase() === 'brazil'
        ? this.BRAZIL_POOL_SIZE
        : this.IMAGE_POOL_SIZE;


      const rawUrl = `${bucketBaseUrl}/${countryFolder}/${genderFolder}/${fileCountry}_${fileGender}_${church.imageIndex}.png`;

      const personImg = encodeURI(rawUrl);

      this.resolveImage(cacheKey, personImg, gender);

    });
  }

  private normalizeCountryForFolder(country: string | null | undefined): string {
    if (!country?.trim()) {
      return 'default';
    }
    return country
      .trim()
      .split(/\s+/)
      .map(
        word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join('');
  }

  private getArgentinaFallbackImage(gender: string): string {
    const genderFolder = gender === 'female' ? 'female' : 'male';
    const historyKey = `argentina_${genderFolder}`;

    const index = this.getNonRepeatingRandomIndex(
      historyKey,
      this.ARGENTINA_POOL_SIZE
    );

    const baseUrl = 'https://storage.googleapis.com/my-chruch-images';

    return encodeURI(
      `${baseUrl}/Argentina/${genderFolder}/Argentina_${genderFolder === 'female' ? 'Female' : 'Male'}_${index}.png`
    );
  }

  private resolveImage(
    cacheKey: string,
    imageUrl: string,
    gender: string
  ): void {
    const img = new Image();

    img.onload = () => {
      this.imageCache[cacheKey] = imageUrl;
    };

    img.onerror = () => {
      const fallback = this.getArgentinaFallbackImage(gender);

      const retryImg = new Image();

      retryImg.onload = () => {
        this.imageCache[cacheKey] = fallback;
      };

      retryImg.onerror = () => {
        // FINAL fallback (only if Argentina also fails)
        this.imageCache[cacheKey] =
          gender === 'female'
            ? 'assets/realwomen.jpg'
            : 'assets/realperson.jpg';
      };

      retryImg.src = fallback;
    };

    img.src = imageUrl;
  }


  private getImageForChurch(church: ChurchData): string {
    const gender = (church.gender || 'male').toLowerCase();
    const countryFolder = this.normalizeCountryForFolder(church.country);
    const genderFolder = gender === 'female' ? 'female' : 'male';

    const cacheKey = church.imageKey!;
    const index = church.imageIndex!;

    if (!this.imageCache[cacheKey]) {
      const bucketBaseUrl = 'https://storage.googleapis.com/my-chruch-images';
      const fileGender = gender.charAt(0).toUpperCase() + gender.slice(1);

      const imgUrl = encodeURI(
        `${bucketBaseUrl}/${countryFolder}/${genderFolder}/${countryFolder}_${fileGender}_${index}.png`
      );

      this.resolveImage(cacheKey, imgUrl, gender);
    }

    return (
      this.imageCache[cacheKey] ||
      (gender === 'female'
        ? 'assets/realwomen.jpg'
        : 'assets/realperson.jpg')
    );
  }

  private buildPopupCardWithLimit(church: ChurchData, count: number): string {
    const personImg = this.getImageForChurch(church);

    let displayActivity = church.activity;

    if (church.activity == 'Bible Study') {
      displayActivity = 'Bible Study Lesson Completed';
    } else if (church.activity == 'Youversion') {
      displayActivity = 'Bible Reading Plan';
    } else if (church.activity == 'Bible Word') {
      displayActivity = 'Website Visitor';
    }

    let extraText = '';

    // ✅ ONLY trigger after 10
    if (count > 10) {
      extraText = `and ${count - 1} others`;
    }

    return `
<div style="
  width:160px;
  padding:10px;
  border-radius:12px;
  overflow:hidden;
  background:#fff;
  box-shadow:0 4px 12px rgba(0,0,0,0.2);
  font-family:sans-serif;
">

  <!-- IMAGE -->

  <div style="
  width:100%;
  height:100px;
  // border-radius:10px;
  overflow:hidden;
  margin-bottom:8px;
">
  <img 
    src="${personImg}" 
    alt="${church.gender}" 
    style="
      width:100%;
      height:100%;
      object-fit:cover;
      display:block;
    "
  />
</div>

  <!-- CONTENT -->
<div style="
  display:grid;
  grid-template-columns: 60px 10px 1fr;
  row-gap:4px;
  align-items:start;
">

  <span style="font-weight:600;">Country</span>
  <span style="text-align:center;">:</span>
  <span style="font-weight:700;">${church.country}</span>

  ${church.language &&
        church.language.toString().trim() !== '' &&
        church.language.toString().toLowerCase() !== 'null'
        ? `
      <span style="font-weight:600;">Language</span>
      <span style="text-align:center;">:</span>
      <span style="font-weight:700;">${church.language}</span>
    `
        : ''
      }

  <span style="font-weight:600;">Activity</span>
  <span style="text-align:center;">:</span>
  <span style="font-weight:700; word-break:break-word;">
    ${displayActivity}
  </span>
      
</div>
 ${extraText
        ? `<span style="font-weight:600;">
           ${extraText}
         </span>`
        : ''
      }
</div>
`;
  }


  private buildPopupCard(church: ChurchData): string {
    const personImg = this.getImageForChurch(church);

    let displayActivity = church.activity;

    if (church.activity == 'Bible Study') {
      displayActivity = 'Bible Study Lesson Completed';
    } else if (church.activity == 'Youversion') {
      displayActivity = 'Bible Reading Plan';
    } else if (church.activity == 'Bible Word') {
      displayActivity = 'Website Visitor';
    }

    return `
<div style="
  width:160px;
  padding:10px;
  border-radius:12px;
  overflow:hidden;
  background:#fff;
  box-shadow:0 4px 12px rgba(0,0,0,0.2);
  font-family:sans-serif;
">

  <!-- IMAGE -->

  <div style="
  width:100%;
  height:100px;
  // border-radius:10px;
  overflow:hidden;
  margin-bottom:8px;
">
  <img 
    src="${personImg}" 
    alt="${church.gender}" 
    style="
      width:100%;
      height:100%;
      object-fit:cover;
      display:block;
    "
  />
</div>

  <!-- CONTENT -->
  <div style="
  display:grid;
  grid-template-columns: 70px 1fr;
  row-gap:4px;
  align-items:start;
">

  <span style="font-weight:600;">Country:</span>
  <span style="font-weight:700;">${church.country}</span>

  ${church.language &&
        church.language.toString().trim() !== '' &&
        church.language.toString().toLowerCase() !== 'null'
        ? `
    <span style="font-weight:600;">Language:</span>
    <span style="font-weight:700;">${church.language}</span>
  `
        : ''
      }

  <span style="font-weight:600;">Activity:</span>
  <span style="font-weight:700; word-break:break-word;">
    ${displayActivity}
  </span>

</div>
</div>
`;
  }




  private buildSmallPopup(church: ChurchData): string {
    const personImg = this.getImageForChurch(church);

    let displayActivity = church.activity;

    if (church.activity == 'Bible Study') {
      displayActivity = 'Bible Study Lesson Finished';
    } else if (church.activity == 'Youversion') {
      displayActivity = 'Bible Reading Plan';
    } else if (church.activity == 'Bible Word') {
      displayActivity = 'Website Visitor';
    }

    return `
<div style="
  width:65px;
  padding:4px;
  border-radius:8px;
  box-shadow:0 2px 6px rgba(0,0,0,0.2);
  background:#fff;
  font-family:sans-serif;
">
  <img 
    src="${personImg}" 
    alt="${church.gender}" 
    style="
      width:100%;
      height:38px;
      object-fit:cover;
      border-radius:6px;
      margin-bottom:3px;
    "
  />

  <div style="
    font-size:6px;
    font-weight:600;
    text-align:center;
    line-height:1.1;
  ">
    <div> ${church.country}</div>
    <div> ${displayActivity}</div>
  </div>
</div>
`;
  }


  showChurches() {
    if (this.churchMarkers.length === 0 && this.churches.length > 0) {
      this.churchMarkers = this.churches.map(church =>
        this.addMarkerWithHover(church, '')
      );
    }
  }

  hideChurches() {
    this.churchMarkers.forEach(marker => marker.remove());
    this.churchMarkers = [];
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

    el.addEventListener('mouseenter', () => {

      // ✅ block hover popup during slideshow rotation
      if (this.isSlideshowRunning || this.isFlying || this.isMainPopupActive) {
        return;
      }

      popup.addTo(this.map).setLngLat([
        church.longitude,
        church.latitude
      ]);

    });

    el.addEventListener('mouseleave', () => {
      if (!this.isMainPopupActive) {
        popup.remove();
      }
    });


    return marker;
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

    // ----------------------------------
    // Stop WebSocket
    // ----------------------------------

    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
    }

    this.websocket.disconnect();

    // ----------------------------------
    // Remove Map
    // ----------------------------------

    if (this.map) {
      this.map.remove();
    }

    // ----------------------------------
    // Stop Animation
    // ----------------------------------

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    // ----------------------------------
    // Stop Timers
    // ----------------------------------

    if (this.quoteInterval) {
      clearInterval(this.quoteInterval);
    }

    // ----------------------------------
    // Remove Event Listeners
    // ----------------------------------

    document.removeEventListener(
      'click',
      this.outsideClickHandler
    );

  }

  private handleOutsideClick() {
    if (this.isMenuOpen) this.isMenuOpen = false;
  }
}
