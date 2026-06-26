import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor() { }

  slideshowDelaySeconds = signal(5);
  maxSmallPopups = signal(20);
  groupBatchSize = signal(10);
}
