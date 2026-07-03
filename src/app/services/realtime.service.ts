import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {

  constructor(private http: HttpClient) {}

  getHistory(): Observable<any[]> {

    return this.http.get<any[]>(
      environment.apiUrl + '/realtime/history/'
    );

  }

  getSettings(): Observable<any> {

    return this.http.get(
      environment.apiUrl + '/settings/'
    );

  }

}