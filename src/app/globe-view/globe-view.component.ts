import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { HttpClient } from '@angular/common/http';
import { countryCoordinates } from '../coordinates';
import { LoginComponent } from '../login/login.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { MapService } from '../services/map.service';
import { PopupService } from '../services/popup.service';
import { ImageService } from '../services/image.service';
import { RealtimeService } from '../services/realtime.service';
import { WebsocketService } from '../services/websocket.service';

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
  churches: ChurchData[] = [];
  cities: CityData[] = [];
  churchMarkers: mapboxgl.Marker[] = [];
  private outsideClickHandler = this.handleOutsideClick.bind(this);
  private animationId: number | null = null;
  private isFlying = false;
  loading = true;
  currentEnglishQuote: string = translatedQuotes['English'];
  currentTranslatedQuote: string = translatedQuotes['French'];
  private quoteIndex = 1;
  private quoteInterval: any;
  fade = true;
  isMenuOpen = false;
  private isMainPopupActive = false;
  slideshowDelaySeconds: number = 17;
  tempSlideshowInput: number = 17;
  private currentDelayTimer: any;
  private currentDelayResolve: (() => void) | null = null;
  showPastRecords: number = 20;
  tempMaxSmallPopups: number = 20;
  groupBatchSize: number = 4;
  tempGroupBatchSize: number = 4;
  private isSlideshowRunning = false;
  private latestPopupSubscription?: Subscription;
  private websocketSubscription?: Subscription;

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  zoomIn() {
    this.mapService.zoomIn();
  }

  zoomOut() {
    this.mapService.zoomOut();
  }

  private get map(): mapboxgl.Map {
    return this.mapService.getMap();
  }

  private get interactionState() {
    return {
      slideshowRunning: this.isSlideshowRunning,
      flying: this.isFlying,
      mainPopupActive: this.isMainPopupActive
    };
  }

  constructor(private ngZone: NgZone,

    private realtimeService: RealtimeService,

    private websocketService: WebsocketService,

    private popupService: PopupService,

    private imageService: ImageService,

    private mapService: MapService,

    private auth: AuthService,

    private dialog: MatDialog,

    private http: HttpClient,

  ) { }


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

    const clamped = Math.max(1, Math.min(100, Math.floor(v)));

    this.groupBatchSize = clamped;

    this.tempGroupBatchSize = clamped;

    // Update RealtimeService
    this.realtimeService.setGroupBatchSize(clamped);

    this.restartSlideshow();

  }

  private restartSlideshow(): void {

    this.stopSlideshow();

    this.popupService.clearAll();

    this.showChurches();

    setTimeout(() => {

      this.startChurchSlideshow();

    }, 100);

  }

  private loadChurchData(): void {

    this.realtimeService.getHistory().subscribe({

      next: async (data) => {

        const history = this.assignCityCoordinates(data);

        this.imageService.assignImagesToChurches(history);

        await this.imageService.preloadImages(history);

        // Keep ALL history
        this.realtimeService.setHistory(history);

        // Component copy (optional)
        this.churches = this.realtimeService.churches;

        this.initializeMap();

        this.initializeRealtime();

      },

      error: (err) => {

        console.error(err);

      }

    });

  }

  private initializeRealtime(): void {

    this.websocketSubscription =
      this.websocketService.events$
        .subscribe(async event => {

          const updated =
            this.assignCityCoordinates([event])[0];

          // Assign image index
          this.imageService.assignImagesToChurches([updated]);

          // Wait until bucket image is loaded
          await this.imageService.preloadImages([updated]);

          console.log(
            "Image before queue:",
            this.imageService.getImageForChurch(updated)
          );
          this.realtimeService.addLiveEvent(updated);

        });

    this.websocketService.connect();

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

    return updated;
  }

  initializeMap(): void {

    this.mapService.initializeMap(

      () => {

        this.showChurches();
        this.initializeSmallPopupListener();
        this.realtimeService.smallPopupChurches.forEach(church => {

          this.addSmallPopup(church);

        });
        this.startChurchSlideshow();

        this.loading = false;

      },

      (zoom) => {

        if (zoom >= 5) {

          this.showChurches();

        }
        else {

          this.hideChurches();

        }

      }

    );

  }

  private transitionBetweenCards(
    fromLngLat: [number, number],
    toLngLat: [number, number],
    transitionDurationMs: number = 2000
  ): Promise<void> {

    const map = this.mapService.getMap();

    if (!map) {
      return Promise.resolve();
    }

    return new Promise(resolve => {

      this.isMainPopupActive = false;
      const hadMarkers = this.mapService.markers && this.mapService.markers.length > 0;
      if (hadMarkers) this.hideChurches();

      try { (map as any).stop && (map as any).stop(); } catch (e) { }

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

          map.jumpTo({
            center: [currentLng, currentLat],
            zoom: currentZoom,
            bearing: 0,
            pitch: 0
          });

          if (progress < 1) {
            this.animationId = requestAnimationFrame(transitionFrame);
          } else {
            if (this.animationId) cancelAnimationFrame(this.animationId);

            const finalZoom = map.getZoom();
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

    this.popupService.enforcePopupLimit(
      this.showPastRecords
    );
  }

  private buildPopupHtml(
    church: ChurchData
  ): string {

    if (
      church.groupCount &&
      church.groupCount > 0
    ) {

      return this.popupService.buildPopupCardGrouped(
        church,
        church.groupCount
      );

    }

    return this.popupService.buildPopupCard(
      church
    );

  }

  private showMainPopup(
    map: mapboxgl.Map,
    church: ChurchData
  ): mapboxgl.Popup {

    const popup = new mapboxgl.Popup({

      offset: 25,

      closeOnClick: false,

      className: 'main-popup'

    })
      .setHTML(this.buildPopupHtml(church))
      .setLngLat([

        church.longitude,

        church.latitude

      ])
      .addTo(map);

    this.isMainPopupActive = true;

    return popup;

  }

  private waitForCurrentCard(): Promise<void> {

    return new Promise<void>((resolve) => {

      this.currentDelayResolve = resolve;

      this.currentDelayTimer = setTimeout(

        resolve,

        this.slideshowDelaySeconds * 1000

      );

    });

  }

  private closeMainPopup(

    popup: mapboxgl.Popup | null

  ): void {

    if (!popup) {

      return;

    }

    popup.remove();

    this.isMainPopupActive = false;

  }

  private flyToChurch(

    church: ChurchData

  ): void {

    this.mapService.flyTo(

      church.longitude,

      church.latitude,

      5

    );

  }

  private async transitionToNextChurch(

    current: ChurchData

  ): Promise<void> {

    const next =

      this.realtimeService.liveQueue[0];

    if (!next) {

      return;

    }

    await this.transitionBetweenCards(

      [

        current.longitude,

        current.latitude

      ],

      [

        next.longitude,

        next.latitude

      ],

      2500

    );

  }

  private waitForLiveEvent(): Promise<void> {

    return new Promise(resolve =>

      setTimeout(resolve, 1000)

    );

  }

  private async startChurchSlideshow(): Promise<void> {
    console.log("========== SLIDESHOW ==========");
    console.log("History:", this.realtimeService.churches.length);
    console.log("Live Queue:", this.realtimeService.getLiveQueueCount());
    console.log("Small:", this.realtimeService.smallPopupChurches.length);
    console.log("===============================");
    if (this.isSlideshowRunning) {
      this.stopSlideshow();
    }
    this.isSlideshowRunning = true;
    let currentMainPopup: mapboxgl.Popup | null = null;


    const showNextChurch = async () => {
      if (!this.isSlideshowRunning) {

        return;

      }

      if (this.isFlying) {

        return;

      }

      const map = this.mapService.getMap();

      if (!map) {

        return;

      }


      const church = this.realtimeService.getNextLiveEvent();

      if (!church) {

        console.log("Waiting for live events...");

        this.isFlying = false;

        await this.waitForLiveEvent();

        await showNextChurch();

        return;

      }

      if (
        church.latitude === 0 ||
        church.longitude === 0
      ) {

        this.isFlying = false;

        await showNextChurch();

        return;

      }

      this.closeMainPopup(currentMainPopup);
      currentMainPopup = null;

      this.isFlying = true;

      // ✅ smooth animation (no jump)
      // this.map.flyTo({
      //   center: [church.longitude, church.latitude],
      //   zoom: 5,
      //   speed: 1.2,
      //   curve: 1.2,
      //   essential: true
      // });
      this.flyToChurch(church);

      currentMainPopup = this.showMainPopup(

        map,

        church

      );

      await this.waitForCurrentCard();

      this.closeMainPopup(

        currentMainPopup

      );

      currentMainPopup = null;
      console.log("MAIN POPUP IMAGE");
      console.log(church.imageKey);
      console.log(church.imageIndex);

      this.realtimeService.moveMainPopupToSmallPopup(
        church
      );

      await this.transitionToNextChurch(

        church

      );

      this.isFlying = false;

      await showNextChurch();
      return;

    };

    await showNextChurch();
    return;
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

    this.isFlying = false;

    this.isMainPopupActive = false;
  }



  showChurches(): void {

    this.mapService.showChurches(

      this.churches,

      this.interactionState

    );

  }

  hideChurches(): void {

    this.mapService.hideChurches();

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
      .setHTML(this.popupService.buildPopupCard(church));


    const map = this.mapService.getMap();

    if (!map) {
      throw new Error('Map not initialized');
    }

    const marker = new mapboxgl.Marker(el)
      .setLngLat([church.longitude, church.latitude])
      .addTo(map);

    el.addEventListener('mouseenter', () => {

      // ✅ block hover popup during slideshow rotation
      if (this.isSlideshowRunning || this.isFlying || this.isMainPopupActive) {
        return;
      }

      popup.addTo(map).setLngLat([
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

  private initializeSmallPopupListener(): void {

    this.latestPopupSubscription =
      this.realtimeService.latestSmallPopup$
        .subscribe(church => {

          if (!church) {
            return;
          }

          this.addSmallPopup(church);

        });

  }

  private addSmallPopup(
    church: ChurchData
  ): void {

    const map =
      this.mapService.getMap();

    if (!map) {
      return;
    }

    const key =
      `${church.latitude}_${church.longitude}_${church.country}`;

    if (
      this.popupService.hasPopup(key)
    ) {
      return;
    }

    const popup =
      new mapboxgl.Popup({

        offset: 10,

        closeButton: false,

        className: 'small-popup'

      })

        .setHTML(

          this.popupService
            .buildSmallPopup(church)

        )

        .setLngLat([

          church.longitude + 0.3,

          church.latitude + 0.3

        ])

        .addTo(map);

    this.popupService.registerPopup(
      popup,
      key
    );

    this.popupService.enforcePopupLimit(
      this.showPastRecords
    );

  }

  ngOnDestroy(): void {

    // ----------------------------------
    // Stop WebSocket
    // ----------------------------------

    if (this.websocketSubscription) {

      this.websocketSubscription.unsubscribe();

    }
    this.websocketService.disconnect();
    this.stopSlideshow();



    this.popupService.destroy();
    if (this.latestPopupSubscription) {
      this.latestPopupSubscription.unsubscribe();
    }
    // ----------------------------------
    // Remove Map
    // ----------------------------------

    const map = this.mapService.getMap();

    if (map) {
      map.remove();
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
