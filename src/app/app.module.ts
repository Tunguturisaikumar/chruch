import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { AppComponent } from './app.component';
import { GlobeViewComponent } from './globe-view/globe-view.component';
import { CrushDetailsDialogComponent } from './crush-details-dialog/crush-details-dialog.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DashboardComponent } from './dashboard/dashboard.component';
import { Router } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './login/login.component';

@NgModule({
  declarations: [
    AppComponent,
    GlobeViewComponent,
    DashboardComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    HttpClientModule,
    ScrollingModule,
    AppRoutingModule     
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
