import { TestBed } from '@angular/core/testing';

import { AutoplayPermittedService } from './autoplay-permitted.service';

describe('AutoplayPermittedService', () => {
  let service: AutoplayPermittedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutoplayPermittedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
