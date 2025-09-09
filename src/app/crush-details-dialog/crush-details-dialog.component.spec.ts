import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrushDetailsDialogComponent } from './crush-details-dialog.component';

describe('CrushDetailsDialogComponent', () => {
  let component: CrushDetailsDialogComponent;
  let fixture: ComponentFixture<CrushDetailsDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrushDetailsDialogComponent]
    });
    fixture = TestBed.createComponent(CrushDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
