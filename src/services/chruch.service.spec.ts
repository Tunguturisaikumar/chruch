import { TestBed } from '@angular/core/testing';

import { ChruchService } from './chruch.service';

describe('ChruchService', () => {
  let service: ChruchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChruchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
