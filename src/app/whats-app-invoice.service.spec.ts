import { TestBed } from '@angular/core/testing';

import { WhatsAppInvoiceService } from './whats-app-invoice.service';

describe('WhatsAppInvoiceService', () => {
  let service: WhatsAppInvoiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WhatsAppInvoiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
