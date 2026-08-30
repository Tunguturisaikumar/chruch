import { Injectable } from '@angular/core';
import { ChurchData } from '../models/church-data';

@Injectable({
  providedIn: 'root'
})
export class GroupingService {

  constructor() { }

  buildDisplayList(
    churches: ChurchData[],
    groupBatchSize: number,
    activities?: any
  ): ChurchData[] {

    const result = [...churches];

    const groupedActivities = [
      'Bible Reading Plan',
      'Website Visitor',
      'Bible Learn',
      'Bible Study',
      'Bible Study Lesson Completed',
      'Chat'
    ];

    const activityMap: {
      [key: string]: number[];
    } = {};

    churches.forEach((church, index) => {
      if (
        church &&
        church.activity &&
        groupedActivities.includes(church.activity)
      ) {
        if (!activityMap[church.activity]) {
          activityMap[church.activity] = [];
        }
        activityMap[church.activity].push(index);
      }
    });

    Object.keys(activityMap).forEach(activityName => {
      const indexes = activityMap[activityName];
      
      const activityKeyMap: { [key: string]: string } = {
        'Website Visitor': 'website',
        'Bible Reading Plan': 'reading',
        'Bible Learn': 'study',
        'Bible Study': 'study',
        'Bible Study Lesson Completed': 'study',
        'Chat': 'chat'
      };
      
      const actKey = activityKeyMap[activityName] || 'website';
      
      const batchSize = (activities && activities[actKey] && typeof activities[actKey].groupCount === 'number')
        ? activities[actKey].groupCount
        : 4;

      for (
        let i = 0;
        i < indexes.length;
        i += batchSize
      ) {
        const batch = indexes.slice(i, i + batchSize);

        if (batch.length > 1) {
          result[batch[0]] = {
            ...churches[batch[0]],
            groupCount: batch.length - 1
          };

          for (let k = 1; k < batch.length; k++) {
            result[batch[k]] = null as any;
          }
        }
      }
    });

    return result.filter(x => x !== null);

  }

}