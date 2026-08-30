import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  username = '';
  password = '';

  loading = false;
  submitted = false;

  constructor(
    private dialogRef: MatDialogRef<LoginComponent>,
    private router: Router,
    private auth: AuthService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {}

  closePopup() {
    this.dialogRef.close();
  }

  login() {

    this.submitted = true;

    if (!this.username.trim() || !this.password.trim()) {
      return;
    }

    this.loading = true;
    this.spinner.show();

    this.auth.login({
      username: this.username,
      password: this.password
    })
    .pipe(
      finalize(() => {
        this.loading = false;
        this.spinner.hide();
      })
    )
    .subscribe({

      next: () => {

        this.toastr.success(
          'Login Successful',
          'Success'
        );

        this.dialogRef.close();

        this.router.navigate(['/dashboard']);

      },

      error: () => {

        this.toastr.error(
          'Invalid Username or Password',
          'Login Failed'
        );

      }

    });

  }

}