import { Injectable } from '@angular/core';
import { ChurchData } from '../models/church-data';

@Injectable({
  providedIn: 'root'
})
export class GroupingService {

  constructor() { }

  private getActivityKey(activity: string): string {
    const act = (activity || '').toLowerCase().trim();
    if (act.includes('chat')) return 'chat';
    if (act.includes('study') || act.includes('learn')) return 'study';
    if (act.includes('reading') || act.includes('youversion') || act.includes('plan')) return 'reading';
    if (act.includes('website') || act.includes('visitor') || act.includes('word')) return 'website';
    return 'website';
  }

  buildDisplayList(
    churches: ChurchData[],
    groupBatchSize: number = 1,
    activities?: any
  ): ChurchData[] {
    if (!churches || churches.length === 0) {
      return [];
    }

    const result: (ChurchData | null)[] = churches.map(c => ({ ...c, groupCount: 0 }));

    const activityMap: { [key: string]: number[] } = {
      chat: [],
      study: [],
      reading: [],
      website: []
    };

    churches.forEach((church, index) => {
      if (church && church.activity) {
        const actKey = this.getActivityKey(church.activity);
        if (activityMap[actKey]) {
          activityMap[actKey].push(index);
        }
      }
    });

    Object.keys(activityMap).forEach(actKey => {
      const indexes = activityMap[actKey];
      if (!indexes || indexes.length === 0) return;

      const actObj = activities ? activities[actKey] : null;
      let rawBatch = 1;

      // Strictly read from settings API only. No UI default grouping > 1.
      if (actObj && actObj.groupCount !== undefined && actObj.groupCount !== null && actObj.groupCount !== '') {
        const parsed = Number(actObj.groupCount);
        if (!isNaN(parsed) && parsed > 1) {
          rawBatch = Math.floor(parsed);
        }
      }

      const batchSize = rawBatch;

      if (batchSize <= 1) {
        // Group count is 1 (or default): strictly individual records, no grouping, no & other
        indexes.forEach(idx => {
          if (result[idx]) {
            result[idx]!.groupCount = 0;
          }
        });
        return;
      }

      // Group count > 1 (e.g. 2 -> & 1 other, 100 -> & 99 others)
      for (let i = 0; i < indexes.length; i += batchSize) {
        const batch = indexes.slice(i, i + batchSize);

        if (batch.length > 1) {
          result[batch[0]] = {
            ...churches[batch[0]],
            groupCount: batchSize - 1
          };

          for (let k = 1; k < batch.length; k++) {
            result[batch[k]] = null;
          }
        } else if (batch.length === 1 && result[batch[0]]) {
          result[batch[0]] = {
            ...churches[batch[0]],
            groupCount: batchSize - 1
          };
        }
      }
    });

    return result.filter((x): x is ChurchData => x !== null);
  }

}