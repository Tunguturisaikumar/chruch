import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {

  username = '';
  password = '';

  constructor(
    private dialogRef: MatDialogRef<LoginComponent>,
    private router: Router,
    private auth: AuthService
  ) {}

   closePopup() {
    this.dialogRef.close();
  }

  login() {

      const body = {
    username: this.username,
    password: this.password
  };

  this.auth.login(body).subscribe({

    next: (res) => {

      this.dialogRef.close();

      this.router.navigate(['/dashboard']);
    },

    error: (err) => {

      console.log(err);
 alert('Invalid credentials');
    }

  });



  }



  
}