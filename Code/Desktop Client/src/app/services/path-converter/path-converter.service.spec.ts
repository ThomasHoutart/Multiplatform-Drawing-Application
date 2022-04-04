import { TestBed } from '@angular/core/testing';

import { PathConverterService } from './path-converter.service';

describe('PathConverterService', () => {
  let service: PathConverterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PathConverterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
