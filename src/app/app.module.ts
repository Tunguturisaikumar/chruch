import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { AppComponent } from './app.component';
import { GlobeViewComponent } from './globe-view/globe-view.component';
import { CrushDetailsDialogComponent } from './crush-details-dialog/crush-details-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    GlobeViewComponent,
    CrushDetailsDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
