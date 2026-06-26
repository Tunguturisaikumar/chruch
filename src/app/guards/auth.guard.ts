import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router
} from '@angular/router';

import { Observable, of } from 'rxjs';

import {
  map,
  catchError
} from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  canActivate(): Observable<boolean> {

    return this.auth.validateUser().pipe(

      map(() => {

        return true;

      }),

      catchError(() => {

        this.router.navigate(['/']);

        return of(false);

      })

    );

  }

}