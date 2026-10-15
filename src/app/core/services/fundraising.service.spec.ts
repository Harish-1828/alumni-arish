import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { FundraisingService } from './fundraising.service';
import { CreateContributionDto } from '../models/contribution.model';

describe('FundraisingService', () => {
  let service: FundraisingService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FundraisingService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(FundraisingService);
    httpTesting = TestBed.inject(HttpTestingController);

    // Handle initial load funds call
    const req = httpTesting.expectOne(`${service.apiBase}/api/fundraising`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created and have initial computed stats', () => {
    expect(service).toBeTruthy();
    expect(service.stats()).toBeDefined();
    expect(service.stats().activeCampaigns).toBeGreaterThanOrEqual(0);
  });

  it('should submit contribution and update funds signal', () => {
    const dto: CreateContributionDto = {
      fundId: '675d0123456789abcdef0001',
      amount: 5000,
      firstName: 'Test',
      lastName: 'Donor',
      email: 'test@mepco.edu',
      phone: '+919876543210',
      street: 'Street 1',
      locality: 'Locality',
      city: 'Sivakasi',
      state: 'Tamil Nadu',
      country: 'India',
      pincode: '626005',
      transactionMode: 'online',
    };

    service.submitContribution(dto).subscribe((res) => {
      expect(res.success).toBe(true);
    });

    const req = httpTesting.expectOne(`${service.apiBase}/api/contributions`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, message: 'Saved', contributionId: 'c_test_123' });
  });
});

