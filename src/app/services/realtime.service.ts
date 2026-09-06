import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ChurchData } from '../models/church-data';
import { GroupingService } from './grouping.service';

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {

  constructor(
    private http: HttpClient,
    private groupingService: GroupingService
  ) { }

  // =====================================================
  // FLAGS & SETTINGS
  // =====================================================

  private historyLoaded = false;
  private showPastRecords = 20;
  private groupBatchSize = 1;
  public activities: any = {
    chat: { groupCount: 1, order: 1 },
    reading: { groupCount: 1, order: 2 },
    study: { groupCount: 1, order: 3 },
    website: { groupCount: 1, order: 4 }
  };

  // =====================================================
  // SUBJECTS
  // =====================================================

  private churchesSubject = new BehaviorSubject<ChurchData[]>([]);
  churches$ = this.churchesSubject.asObservable();

  private smallPopupSubject = new BehaviorSubject<ChurchData[]>([]);
  smallPopupChurches$ = this.smallPopupSubject.asObservable();

  private latestSmallPopupSubject = new BehaviorSubject<ChurchData | null>(null);
  latestSmallPopup$ = this.latestSmallPopupSubject.asObservable();

  private liveQueueSubject = new BehaviorSubject<ChurchData[]>([]);
  liveQueue$ = this.liveQueueSubject.asObservable();

  // =====================================================
  // API
  // =====================================================

  getHistory(): Observable<ChurchData[]> {
    return this.http.get<ChurchData[]>(`${environment.apiUrl}/realtime/history/`);
  }

  getSettings(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/settings/`);
  }

  // =====================================================
  // SETTINGS
  // =====================================================

  setShowPastRecords(value: number): void {
    this.showPastRecords = value;
    this.recalculateSmallPopups();
  }

  setGroupBatchSize(value: number): void {
    this.groupBatchSize = value;
    this.recalculateSmallPopups();
  }

  setActivities(activities: any): void {
    if (!activities) return;
    let parsed = activities;
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch (e) { }
    }
    this.activities = {
      chat: {
        groupCount: parsed.chat?.groupCount !== undefined ? Number(parsed.chat.groupCount) : 1,
        order: parsed.chat?.order !== undefined ? Number(parsed.chat.order) : 1
      },
      reading: {
        groupCount: parsed.reading?.groupCount !== undefined ? Number(parsed.reading.groupCount) : 1,
        order: parsed.reading?.order !== undefined ? Number(parsed.reading.order) : 2
      },
      study: {
        groupCount: parsed.study?.groupCount !== undefined ? Number(parsed.study.groupCount) : 1,
        order: parsed.study?.order !== undefined ? Number(parsed.study.order) : 3
      },
      website: {
        groupCount: parsed.website?.groupCount !== undefined ? Number(parsed.website.groupCount) : 1,
        order: parsed.website?.order !== undefined ? Number(parsed.website.order) : 4
      }
    };
    this.recalculateSmallPopups();
  }

  // =====================================================
  // GROUP CLASSIFICATION
  // =====================================================

  isGroupA(church: ChurchData): boolean {
    const act = (church?.activity || '').toLowerCase().trim();
    return act.includes('chat') ||
           act.includes('study') ||
           act.includes('learn');
  }

  isGroupB(church: ChurchData): boolean {
    const act = (church?.activity || '').toLowerCase().trim();
    return act.includes('website') ||
           act.includes('visitor') ||
           act.includes('word') ||
           act.includes('reading') ||
           act.includes('youversion') ||
           act.includes('plan');
  }

  extractBalancedSmallPopups(churches: ChurchData[], totalLimit: number): ChurchData[] {
    if (!churches || churches.length === 0 || totalLimit <= 0) {
      return [];
    }

    const groupA = churches.filter(c => this.isGroupA(c));
    const groupB = churches.filter(c => this.isGroupB(c));

    const halfA = Math.floor(totalLimit / 2);
    const halfB = totalLimit - halfA;

    // Strict 50/50 caps without borrowing
    const selectedA = groupA.slice(0, halfA);
    const selectedB = groupB.slice(0, halfB);

    const combined = [...selectedA, ...selectedB];

    console.group(`📊 PAST RECORDS 50/50 STRICT SPLIT (Target: ${totalLimit})`);
    console.log(`Total History in Dataset: ${churches.length}`);
    console.log(`Group A (Chat + Bible Study): Available = ${groupA.length} | Selected = ${selectedA.length} (Max: ${halfA})`);
    console.log(`Group B (Website + Reading): Available = ${groupB.length} | Selected = ${selectedB.length} (Max: ${halfB})`);
    console.log(`Total Small Cards Output: ${combined.length}`);
    console.table(
      combined.map((c, i) => ({
        '#': i + 1,
        Country: c.country,
        Activity: c.activity,
        Group: this.isGroupA(c) ? 'Chat + Bible Study' : 'Website + Reading'
      }))
    );
    console.groupEnd();

    return combined;
  }

  private recalculateSmallPopups(): void {
    if (this.churchesSubject.value && this.churchesSubject.value.length > 0) {
      const small = this.extractBalancedSmallPopups(
        this.churchesSubject.value,
        this.showPastRecords
      );
      this.smallPopupSubject.next(small);
      console.log('Small Popups updated (50/50 strict):', small.length);
    }
  }

  // =====================================================
  // GETTERS
  // =====================================================

  get churches(): ChurchData[] {
    return [...this.churchesSubject.value];
  }

  get smallPopupChurches(): ChurchData[] {
    return [...this.smallPopupSubject.value];
  }

  get liveQueue(): ChurchData[] {
    return [...this.liveQueueSubject.value];
  }

  // =====================================================
  // HISTORY INITIALIZATION
  // =====================================================

  setHistory(churches: ChurchData[]): void {
    if (this.historyLoaded) {
      console.log("History already initialized.");
      return;
    }

    this.historyLoaded = true;
    console.log("========== INITIAL HISTORY ==========");
    console.log("Records :", churches.length);

    const activityKeyMap: { [key: string]: string } = {
      'Website Visitor': 'website',
      'Bible Reading Plan': 'reading',
      'Bible Learn': 'study',
      'Bible Study': 'study',
      'Bible Study Lesson Completed': 'study',
      'Chat': 'chat'
    };

    const sortedChurches = [...churches].sort((a, b) => {
      const aKey = activityKeyMap[a.activity || ''] || 'website';
      const bKey = activityKeyMap[b.activity || ''] || 'website';

      const aOrder = (this.activities && this.activities[aKey] && typeof this.activities[aKey].order === 'number')
        ? this.activities[aKey].order
        : 99;

      const bOrder = (this.activities && this.activities[bKey] && typeof this.activities[bKey].order === 'number')
        ? this.activities[bKey].order
        : 99;

      return aOrder - bOrder;
    });

    this.churchesSubject.next(sortedChurches);

    const small = this.extractBalancedSmallPopups(
      sortedChurches,
      this.showPastRecords
    );

    this.smallPopupSubject.next(small);
    console.log("Small Popups :", small.length);
  }

  // =====================================================
  // CLEAR
  // =====================================================

  clear(): void {
    this.historyLoaded = false;
    this.churchesSubject.next([]);
    this.smallPopupSubject.next([]);
    this.liveQueueSubject.next([]);
  }

  // =====================================================
  // LIVE EVENTS
  // =====================================================

  addLiveEvent(church: ChurchData): void {
    const history = [...this.churchesSubject.value];

    const duplicate = history.find(x =>
      x.eventId && church.eventId ? x.eventId === church.eventId :
      (x.activity === church.activity &&
       x.country === church.country &&
       x.city === church.city &&
       x.language === church.language)
    );

    if (duplicate) {
      return;
    }

    history.unshift(church);
    if (history.length > 100) {
      history.pop();
    }

    this.churchesSubject.next(history);

    const queue = [...this.liveQueueSubject.value];
    console.log("========== LIVE EVENT ==========");
    console.log("Country:", church.country);
    console.log("Activity:", church.activity);

    queue.push(church);
    this.liveQueueSubject.next(queue);
    console.log("Queue AFTER PUSH:", queue.length);
    console.log("===============================");
  }

  // =====================================================
  // LIVE QUEUE HELPERS
  // =====================================================

  getNextLiveEvent(): ChurchData | null {
    const queue = [...this.liveQueueSubject.value];
    if (queue.length === 0) {
      return null;
    }
    const church = queue.shift()!;
    this.liveQueueSubject.next(queue);
    return church;
  }

  getNextLiveEventForActivity(activityKey: string): ChurchData | null {
    const queue = [...this.liveQueueSubject.value];
    const keyToNamesMap: { [key: string]: string[] } = {
      'chat': ['Chat'],
      'study': ['Bible Learn', 'Bible Study', 'Bible Study Lesson Completed'],
      'reading': ['Bible Reading Plan', 'Youversion'],
      'website': ['Website Visitor', 'Bible Word']
    };
    const targetNames = keyToNamesMap[activityKey] || [];
    const index = queue.findIndex(c => c && c.activity && targetNames.includes(c.activity));
    if (index !== -1) {
      const [event] = queue.splice(index, 1);
      this.liveQueueSubject.next(queue);
      return event;
    }
    return null;
  }

  // =====================================================
  // MAIN POPUP -> SMALL POPUP
  // =====================================================

  moveMainPopupToSmallPopup(church: ChurchData): void {
    const currentSmall = [...this.smallPopupSubject.value];
    const groupA = currentSmall.filter(c => this.isGroupA(c));
    const groupB = currentSmall.filter(c => this.isGroupB(c));

    const halfA = Math.floor(this.showPastRecords / 2);
    const halfB = this.showPastRecords - halfA;

    if (this.isGroupA(church)) {
      groupA.unshift(church);
      while (groupA.length > halfA) {
        groupA.pop();
      }
    } else {
      groupB.unshift(church);
      while (groupB.length > halfB) {
        groupB.pop();
      }
    }

    const updatedSmall = [...groupA, ...groupB];
    this.smallPopupSubject.next(updatedSmall);

    console.log(
      `Move to Small Popup -> ${church.activity} (${this.isGroupA(church) ? 'Group A' : 'Group B'}). GroupA count: ${groupA.length}/${halfA}, GroupB count: ${groupB.length}/${halfB}`
    );

    this.latestSmallPopupSubject.next(church);
  }

  // =====================================================
  // LIVE QUEUE STATUS & COUNTS
  // =====================================================

  hasLiveEvents(): boolean {
    return this.liveQueueSubject.value.length > 0;
  }

  getLiveQueueLength(): number {
    return this.liveQueueSubject.value.length;
  }

  getHistoryCount(): number {
    return this.churchesSubject.value.length;
  }

  getSmallPopupCount(): number {
    return this.smallPopupSubject.value.length;
  }

  getLiveQueueCount(): number {
    return this.liveQueueSubject.value.length;
  }

  getLatestEventForActivity(activityKey: string): ChurchData | null {
    const list = this.churchesSubject.value;
    const keyToNamesMap: { [key: string]: string[] } = {
      'chat': ['Chat'],
      'study': ['Bible Learn', 'Bible Study', 'Bible Study Lesson Completed'],
      'reading': ['Bible Reading Plan', 'Youversion'],
      'website': ['Website Visitor', 'Bible Word']
    };
    const targetNames = keyToNamesMap[activityKey] || [];
    const found = list.find(church =>
      church && church.activity && targetNames.includes(church.activity)
    );
    return found || null;
  }

}