import { Injectable } from '@angular/core';

import { ChurchData } from '../models/church-data';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  // =====================================================
  // CONFIGURATION
  // =====================================================

  private readonly IMAGE_POOL_SIZE = 10;

  private readonly BRAZIL_POOL_SIZE = 14;

  private readonly IMAGE_COOLDOWN = 5;

  private readonly BUCKET_BASE_URL =
    'https://storage.googleapis.com/my-chruch-images';

  // =====================================================
  // CACHE
  // =====================================================

  private imageCache: {
    [key: string]: string;
  } = {};

  private recentImageHistory: {
    [key: string]: number[];
  } = {};

  // =====================================================
  // PUBLIC
  // =====================================================

  assignImagesToChurches(
    churches: ChurchData[]
  ): void {

    churches.forEach(church => {

      if (!church?.country) {

        console.warn(
          'Skipping image assignment because country is missing.',
          church
        );

        return;

      }

      const gender = (
        church.gender || 'male'
      )
        .toLowerCase()
        .trim();

      const country =
        church.country.trim();

      const countryFolder =
        this.normalizeCountryForFolder(
          country
        );

      const genderFolder =
        gender === 'female'
          ? 'female'
          : 'male';

      const historyKey =
        `${countryFolder}_${genderFolder}`;

      const totalImages =

        country.toLowerCase() === 'brazil'

          ? this.BRAZIL_POOL_SIZE

          : this.IMAGE_POOL_SIZE;

      const imageIndex =
        this.getNonRepeatingRandomIndex(

          historyKey,

          totalImages

        );

      church.imageIndex = imageIndex;

      church.imageKey =
        `${historyKey}_${imageIndex}`;

    });

  }

  // =====================================================
  async preloadImages(
    churches: ChurchData[]
  ): Promise<void> {

    const uniqueKeys = new Set<string>();

    const promises: Promise<void>[] = [];

    churches.forEach(church => {

      let gender = (
        church.gender || ''
      )
        .toLowerCase()
        .trim();

      const country = (
        church.country || ''
      )
        .trim();

      if (!country) {
        return;
      }

      if (!gender) {

        gender =
          Math.random() < 0.5
            ? 'male'
            : 'female';

      }

      const countryFolder =
        this.normalizeCountryForFolder(
          country
        );

      const genderFolder =
        gender === 'female'
          ? 'female'
          : 'male';

      const fileGender =
        gender.charAt(0).toUpperCase() +
        gender.slice(1).toLowerCase();

      const cacheKey =
        church.imageKey!;

      if (uniqueKeys.has(cacheKey)) {
        return;
      }

      uniqueKeys.add(cacheKey);

      const rawUrl =

        `${this.BUCKET_BASE_URL}/` +

        `${countryFolder}/` +

        `${genderFolder}/` +

        `${countryFolder}_${fileGender}_${church.imageIndex}.png`;

      promises.push(

        this.resolveImage(

          cacheKey,

          encodeURI(rawUrl),

          gender

        )

      );

    });

    await Promise.all(promises);

  }

  // =====================================================
  // GET IMAGE
  // =====================================================

  getImageForChurch(
    church: ChurchData
  ): string {

    const gender =
      (church.gender || 'male')
        .toLowerCase();

    const countryFolder =
      this.normalizeCountryForFolder(
        church.country
      );

    const genderFolder =
      gender === 'female'
        ? 'female'
        : 'male';

    const cacheKey =
      church.imageKey!;

    const index =
      church.imageIndex!;

    if (!this.imageCache[cacheKey]) {

      const fileGender =
        gender.charAt(0).toUpperCase() +
        gender.slice(1);

      const imageUrl = encodeURI(

        `${this.BUCKET_BASE_URL}/` +

        `${countryFolder}/` +

        `${genderFolder}/` +

        `${countryFolder}_${fileGender}_${index}.png`

      );

      this.resolveImage(

        cacheKey,

        imageUrl,

        gender

      );

    }

    return (

      this.imageCache[cacheKey]

      ||

      (

        gender === 'female'

          ? 'assets/realwomen.jpg'

          : 'assets/realperson.jpg'

      )

    );

  }

  // =====================================================
  // COUNTRY FOLDER
  // =====================================================

  private normalizeCountryForFolder(

    country: string | null | undefined

  ): string {

    if (!country?.trim()) {

      return 'default';

    }

    return country

      .trim()

      .split(/\s+/)

      .map(

        word =>

          word.charAt(0).toUpperCase()

          +

          word.slice(1).toLowerCase()

      )

      .join('');

  }

private resolveImage(
  cacheKey: string,
  imageUrl: string,
  gender: string
): Promise<void> {

  return new Promise(resolve => {

    const img = new Image();

    img.onload = () => {

      this.imageCache[cacheKey] = imageUrl;

      resolve();

    };

    img.onerror = () => {

      console.warn(`Failed to load image from GCP bucket: ${imageUrl}. Falling back to default.`);

      this.imageCache[cacheKey] =

        gender === 'female'
          ? 'assets/realwomen.jpg'
          : 'assets/realperson.jpg';

      resolve();

    };

    img.src = imageUrl;

  });

}

  private getNonRepeatingRandomIndex(
    cacheKey: string,
    totalImages: number
  ): number {

    if (!this.recentImageHistory[cacheKey]) {

      this.recentImageHistory[cacheKey] = [];

    }

    const history =
      this.recentImageHistory[cacheKey];

    const available: number[] = [];

    for (let i = 1; i <= totalImages; i++) {

      if (!history.includes(i)) {

        available.push(i);

      }

    }

    if (available.length === 0) {

      history.length = 0;

      for (let i = 1; i <= totalImages; i++) {

        available.push(i);

      }

    }

    const selected =

      available[
      Math.floor(
        Math.random() * available.length
      )
      ];

    history.push(selected);

    if (history.length > this.IMAGE_COOLDOWN) {

      history.shift();

    }

    return selected;

  }

  // =====================================================
  // CACHE HELPERS
  // =====================================================

  clearCache(): void {

    this.imageCache = {};

  }

  clearHistory(): void {

    this.recentImageHistory = {};

  }

  reset(): void {

    this.clearCache();

    this.clearHistory();

  }

  // =====================================================
  // DEBUG
  // =====================================================

  get cacheSize(): number {

    return Object.keys(
      this.imageCache
    ).length;

  }

  get historySize(): number {

    return Object.keys(
      this.recentImageHistory
    ).length;

  }

}