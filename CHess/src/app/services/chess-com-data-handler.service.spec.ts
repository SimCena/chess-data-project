import { TestBed } from '@angular/core/testing';

import { ChessComDataHandlerService } from './chess-com-data-handler.service';

describe('ChessComDataHandlerService', () => {
  let service: ChessComDataHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChessComDataHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
