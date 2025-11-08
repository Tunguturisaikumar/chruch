import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { HttpClient } from '@angular/common/http';
import { countryCoordinates } from '../coordinates';

interface ChurchData {
  gender: string;
  country: string;
  language: string;
  activity: string;
  latitude: number;
  longitude: number;
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
      easing: t => t * (2 - t) // smooth ease-out animation
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

  constructor(private ngZone: NgZone, private http: HttpClient) { }

  ngOnInit(): void {
    this.startQuoteRotation();
    document.addEventListener('click', this.handleOutsideClick.bind(this));

    this.http.get<CityData[]>('assets/worldcities.json').subscribe({
      next: (citiesData) => {
        this.cities = citiesData;
        this.loadChurchData();
      },
      error: (err) => {
        console.error('Failed to load cities.json', err);
        this.loadChurchData();
      }
    });
  }

  private loadChurchData(): void {
    const apiUrl = 'https://serverold-486354915183.europe-west1.run.app';
    this.http.get<ChurchData[]>(apiUrl).subscribe({
      next: (data: ChurchData[]) => {
        if (data && data.length > 0) {
          this.churches = this.assignCityCoordinates(data);
          this.preloadImages(this.churches);
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

    console.log(updated);

    return updated;
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
    return new Promise(resolve => {
      const start = performance.now();
      const rotate = (time: number) => {
        const elapsed = time - start;
        if (elapsed < 1000) {
          this.bearing -= 0.5;
          this.map.easeTo({ bearing: this.bearing, duration: 50, easing: t => t });
          this.animationId = requestAnimationFrame(rotate);
        } else {
          // stop rotation after 10 seconds
          if (this.animationId) cancelAnimationFrame(this.animationId);
          resolve();
        }
      };

      // Run animation outside Angular’s zone to prevent change detection overhead
      this.ngZone.runOutsideAngular(() => requestAnimationFrame(rotate));
    });
  }




private startChurchSlideshow(): void {
  let index = 0;
  const shownChurches: ChurchData[] = [];
  let currentMainPopup: mapboxgl.Popup | null = null;

  const showNextChurch = () => {
    if (!this.map || this.isFlying) return;
    this.isFlying = true;

    const church = this.churches[index];
    const currentCountry = church.country;

    // Remove old country popups if country changes
    if (this.lastCountry && this.lastCountry !== currentCountry) {
      this.previousCountryPopups.forEach(p => p.remove());
      this.previousCountryPopups = [];
    }
    this.lastCountry = currentCountry;

    // 🚫 Remove previous main popup before creating a new one
    if (currentMainPopup) {
      currentMainPopup.remove();
      currentMainPopup = null;
    }

    // Fly to location
    this.map.flyTo({
      center: [church.longitude, church.latitude],
      zoom: 5,
      speed: 1.5,
      curve: 1,
      essential: true
    });

    // Add small popups for previously shown churches (same country)
    const sameCountryChurches = shownChurches.filter(c => c.country === currentCountry);
    const recentChurches = sameCountryChurches.slice(-25);
    recentChurches.forEach(prev => {
      const smallPopup = new mapboxgl.Popup({
        offset: 10,
        closeButton: false,
        className: 'small-popup'
      })
        .setHTML(this.buildSmallPopup(prev))
        .setLngLat([prev.longitude + 0.3, prev.latitude + 0.3])
        .addTo(this.map);

      this.previousCountryPopups.push(smallPopup);
    });

    // Create new main popup
    currentMainPopup = new mapboxgl.Popup({
      offset: 25,
      closeOnClick: false,
      className: 'main-popup'
    })
      .setHTML(this.buildPopupCard(church))
      .setLngLat([church.longitude, church.latitude])
      .addTo(this.map);
      this.isMainPopupActive = true;

    shownChurches.push(church);

    // Move to next after 17s
    setTimeout(() => {
      if (currentMainPopup) {
        currentMainPopup.remove();
        currentMainPopup = null;
        this.isMainPopupActive = false; 
      }
      index = (index + 1) % this.churches.length;
      this.isFlying = false;
      showNextChurch();
    }, 17000);
  };

  showNextChurch();
}


  private preloadImages(churches: ChurchData[]): void {
    const bucketBaseUrl = 'https://storage.googleapis.com/my-church-images';
    const uniqueKeys = new Set<string>();

    churches.forEach(church => {
      let gender = (church.gender || '').toLowerCase().trim();
      const country = (church.country || '').trim();
      if (!country) return;

      if (!gender) gender = Math.random() < 0.5 ? 'male' : 'female';

      const countryFolder = country.charAt(0).toUpperCase() + country.slice(1).toLowerCase();
      const genderFolder = gender === 'female' ? 'female' : 'male';
      const fileCountry = countryFolder;
      const fileGender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();

      const rawUrl = `${bucketBaseUrl}/${countryFolder}/${genderFolder}/${fileCountry}_${fileGender}_1.jpg`;
      const personImg = encodeURI(rawUrl);

      const cacheKey = `${countryFolder}_${genderFolder}`;
      if (uniqueKeys.has(cacheKey)) return;

      uniqueKeys.add(cacheKey);

      // Try to load the image and check for errors
      const img = new Image();
      img.onload = () => {
        // Only store if successfully loaded
        this.imageCache[cacheKey] = personImg;
      };
      img.onerror = () => {
        // Use local fallback if not found or load fails
        this.imageCache[cacheKey] =
          gender === 'female'
            ? 'assets/realwomen.jpg'
            : 'assets/realperson.jpg';
      };
      img.src = personImg;
    });
  }

private getImageForChurch(church: ChurchData): string {
  const gender = (church.gender || '').toLowerCase().trim();
  const country = (church.country || '').trim();

  const countryFolder = country.charAt(0).toUpperCase() + country.slice(1).toLowerCase();
  const genderFolder = gender === 'female' ? 'female' : 'male';
  const cacheKey = `${countryFolder}_${genderFolder}`;


  if (country.toLowerCase() === 'brazil') {
    const totalImages = 14;
    const randomIndex = Math.floor(Math.random() * totalImages) + 1;

    const bucketBaseUrl = 'https://storage.googleapis.com/my-church-images';
    const fileCountry = countryFolder;
    const fileGender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();

    const personImg = `${bucketBaseUrl}/${countryFolder}/${genderFolder}/${fileCountry}_${fileGender}_${randomIndex}.jpg`;
    return encodeURI(personImg);
  }

  if (this.imageCache[cacheKey]) {
    return this.imageCache[cacheKey];
  } else {
    return gender === 'female'
      ? 'assets/realwomen.jpg'
      : 'assets/realperson.jpg';
  }
}


  private buildPopupCard(church: ChurchData): string {
    const personImg = this.getImageForChurch(church);

    const languageRow =
      church.language && church.language.trim() !== ''
        ? `
        <tr>
          <td style="font-weight:bold; padding:2px 4px 2px 0;font-size:14px;">Language:</td>
          <td padding:2px 0;" style="font-weight:bold;font-size:14px;">${church.language}</td>
        </tr>`
        : '';

  let displayActivity = church.activity;

  if (
    church.activity === 'Bible Study Course Started' ||
    church.activity === 'Bible Study Lesson Finished'
  ) {
    displayActivity = 'Bible Study';
  } else if (church.activity === 'Bible Reading Plan Started') {
    displayActivity = 'Bible Reading Plan';
  }

    return `
    <div style="width:220px; padding:10px; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,0.2); background:#fff;">
      <img 
        src="${personImg}" 
        alt="${church.gender}" 
        style="width:100%; height:140px; object-fit:cover; border-radius:8px; margin-bottom:8px;"
      />
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="font-weight:bold; padding:2px 4px 2px 0;font-size:16px;">Country:</td>
          <td padding:2px 0;" style="font-weight:bold;font-size:16px;">${church.country}</td>
        </tr>
        ${languageRow}
        <tr>
          <td style="font-weight:bold; padding:2px 4px 2px 0;font-size:14px;">Activity:</td>
          <td padding:2px 0;" style="font-weight:bold;font-size:14px;">${displayActivity}</td>
        </tr>
      </table>
    </div>
  `;
  }




  private buildSmallPopup(church: ChurchData): string {
    const personImg = this.getImageForChurch(church);
    const languageRow =
      church.language && church.language.trim() !== ''
        ? `
        <tr>
          <td style="font-weight:bold; padding:1px 2px 1px 0;font-size:6px;">Language:</td>
          <td padding:1px 0;" style="font-weight:bold;font-size:6px;">${church.language}</td>
        </tr>`
        : '';

  // Clean up only specific activity values
  let displayActivity = church.activity;

  if (
    church.activity === 'Bible Study Course Started' ||
    church.activity === 'Bible Study Lesson Finished'
  ) {
    displayActivity = 'Bible Study';
  } else if (church.activity === 'Bible Reading Plan Started') {
    displayActivity = 'Bible Reading Plan';
  }
    //  let personImg: string;

    //     if (!church.gender || church.gender.trim() === '') {
    //       personImg = 'assets/realperson.jpg';
    //     } else if (church.gender.toLowerCase() === 'male') {
    //       personImg = 'assets/realperson.jpg';
    //     } else if (church.gender.toLowerCase() === 'female') {
    //       personImg = 'assets/realwomen.jpg';
    //     } else {
    //       personImg = 'assets/Personicon.jpg';
    //     }
    return `
    <div style="width:120px; padding:10px; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,0.2); background:#fff;">
      <img src="${personImg}" alt="${church.gender}" style="width:100%; height:80px; object-fit:cover; border-radius:4px; margin-bottom:4px;"/>
        <table style="width:100%; border-collapse:collapse;">
        <tr>
          <td style="font-weight:bold; padding:1px 2px 1px 0;font-size:8px;"">Country:</td>
          <td padding:1px 0;" style="font-weight:bold;font-size:8px;">${church.country}</td>
        </tr>
        ${languageRow}
        <tr>
          <td style="font-weight:bold; padding:1px 2px 1px 0;font-size:6px;">Activity:</td>
          <td padding:1px 0;" style="font-weight:bold;font-size:6px;">${displayActivity}</td>
        </tr>
      </table>
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
  if (!this.isMainPopupActive) {
    popup.addTo(this.map).setLngLat([church.longitude, church.latitude]);
  }
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
    if (this.map) this.map.remove();
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.quoteInterval) clearInterval(this.quoteInterval);
    document.removeEventListener('click', this.handleOutsideClick.bind(this));
  }

  private handleOutsideClick() {
    if (this.isMenuOpen) this.isMenuOpen = false;
  }
}
