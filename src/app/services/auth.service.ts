import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  // Login
  login(data: any): Observable<any> {
    return this.http.post(
      `${this.api}/api/login/`,
      data,
      {
        headers: this.headers,
        withCredentials: true
      }
    );
  }

  validateUser() {
  return this.http.get(
    `${this.api}/api/validate-user/`,
    {
      withCredentials: true
    }
  );
}

  // Logout
  logout(): Observable<any> {
    return this.http.post(
      `${this.api}/api/logout/`,
      {},
      {
        withCredentials: true
      }
    );
  }

  // Get all settings
  getSettings(): Observable<any> {
    return this.http.get(
      `${this.api}/api/settings/`,
      {
        withCredentials: true
      }
    );
  }

  // Save Chat Interval
  saveChatInterval(data: any): Observable<any> {
    return this.http.post(
      `${this.api}/api/chat-interval/`,
      data,
      {
        withCredentials: true
      }
    );
  }

  // Save Reading Interval
  saveReadingInterval(data: any): Observable<any> {
    return this.http.post(
      `${this.api}/api/reading-interval/`,
      data,
      {
        withCredentials: true
      }
    );
  }

  // Save Study Interval
  saveStudyInterval(data: any): Observable<any> {
    return this.http.post(
      `${this.api}/api/study-interval/`,
      data,
      {
        withCredentials: true
      }
    );
  }

  // Save Website Interval
  saveWebsiteInterval(data: any): Observable<any> {
    return this.http.post(
      `${this.api}/api/website-interval/`,
      data,
      {
        withCredentials: true
      }
    );
  }

  // Save Card Duration
saveCardDuration(data: any): Observable<any> {
  return this.http.post(
    `${this.api}/api/save-card-duration/`,
    data,
    {
      withCredentials: true
    }
  );
}

// Save Show Past Records
saveShowPastRecords(data: any): Observable<any> {
  return this.http.post(
    `${this.api}/api/save-show-past-records/`,
    data,
    {
      withCredentials: true
    }
  );
}

// Save Group Count
saveGroupCount(data: any): Observable<any> {
  return this.http.post(
    `${this.api}/api/save-group-count/`,
    data,
    {
      withCredentials: true
    }
  );
}

  // Save Activity Settings (per-activity groupCount and order)
  saveActivitySettings(data: any): Observable<any> {
    return this.http.post(
      `${this.api}/api/save-activity-settings/`,
      data,
      {
        withCredentials: true
      }
    );
  }

}