import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
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
  showPassword = false;

  constructor(
    private dialogRef: MatDialogRef<LoginComponent>,
    private router: Router,
    private auth: AuthService,
    private toastr: ToastrService
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  closePopup(): void {
    if (!this.loading) {
      this.dialogRef.close();
    }
  }

  login(): void {
    this.submitted = true;

    if (!this.username.trim() || !this.password.trim()) {
      return;
    }

    this.loading = true;

    this.auth.login({
      username: this.username,
      password: this.password
    })
    .pipe(
      finalize(() => {
        this.loading = false;
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