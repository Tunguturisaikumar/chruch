import { Injectable } from '@angular/core';
import { ChurchData } from '../models/church-data';

@Injectable({
  providedIn: 'root'
})
export class GroupingService {

  constructor() { }

  buildDisplayList(
    churches: ChurchData[],
    groupBatchSize: number
  ): ChurchData[] {

    const result = [...churches];

    const groupedActivities = [
      'Bible Reading Plan',
      'Website Visitor'
    ];

    const activityMap: {
      [key: string]: number[];
    } = {};

    churches.forEach((church, index) => {

      if (
        groupedActivities.includes(
          church.activity
        )
      ) {

        if (!activityMap[church.activity]) {

          activityMap[church.activity] = [];

        }

        activityMap[church.activity].push(index);

      }

    });

    Object.keys(activityMap).forEach(activity => {

      const indexes = activityMap[activity];

      for (

        let i = 0;

        i < indexes.length;

        i += groupBatchSize

      ) {

        const batch = indexes.slice(
          i,
          i + groupBatchSize
        );

        if (
          batch.length === groupBatchSize
        ) {

          result[batch[0]] = {

            ...churches[batch[0]],

            groupCount:
              groupBatchSize - 1

          };

          for (
            let k = 1;
            k < batch.length;
            k++
          ) {

            result[batch[k]] = null as any;

          }

        }

      }

    });

    return result.filter(
      x => x !== null
    );

  }

}