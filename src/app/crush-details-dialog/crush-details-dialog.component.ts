import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-crush-details-dialog',
  templateUrl: './crush-details-dialog.component.html',
  styleUrls: ['./crush-details-dialog.component.css']
})
export class CrushDetailsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
