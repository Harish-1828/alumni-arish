import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { CreateFundDto, Fund, FundStats, UpdateFundDto } from '../models/fund.model';
import {
  Contribution,
  ContributionResponse,
  CreateContributionDto,
} from '../models/contribution.model';

const INITIAL_FALLBACK_FUNDS: Fund[] = [
  {
    _id: '675d0123456789abcdef0001',
    id: '675d0123456789abcdef0001',
    title: 'Mepco Innovation & Robotics Lab Endowment',
    description:
      'Support the modernization of the Robotics & Automation Research Lab. The fund covers industrial collaborative robots, advanced sensor equipment, and competitive robotics team sponsorships for national hackathons.',
    goal: 500000,
    raised: 375000,
    contributors: 48,
    date: new Date('2025-01-15'),
    createdAt: new Date('2025-01-15'),
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  },
  {
    _id: '675d0123456789abcdef0002',
    id: '675d0123456789abcdef0002',
    title: 'Merit-Cum-Means Student Scholarship 2025-26',
    description:
      'Empower deserving undergraduate engineering students experiencing severe financial hardships. 100% of proceeds fund semester tuition, hostel boarding, and academic textbooks.',
    goal: 1000000,
    raised: 680000,
    contributors: 112,
    date: new Date('2025-02-01'),
    createdAt: new Date('2025-02-01'),
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
  },
  {
    _id: '675d0123456789abcdef0003',
    id: '675d0123456789abcdef0003',
    title: 'Campus Digital Library & Research Journal Access',
    description:
      'Expanding IEEE, ACM, Springer, and ScienceDirect high-tier subscriptions for postgraduates, research scholars, and faculty research laboratories.',
    goal: 300000,
    raised: 215000,
    contributors: 34,
    date: new Date('2025-02-18'),
    createdAt: new Date('2025-02-18'),
    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
  },
  {
    _id: '675d0123456789abcdef0004',
    id: '675d0123456789abcdef0004',
    title: 'Sports Complex & Athletic Equipment Upgrade',
    description:
      'Revamping the outdoor synthetic courts, gymnasium training equipment, and supporting college inter-collegiate athletic tournaments.',
    goal: 400000,
    raised: 190000,
    contributors: 29,
    date: new Date('2025-03-01'),
    createdAt: new Date('2025-03-01'),
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
  },
];

const INITIAL_FALLBACK_CONTRIBUTIONS: Contribution[] = [
  {
    _id: 'c001',
    fundId: '675d0123456789abcdef0001',
    amount: 25000,
    firstName: 'Karthik',
    lastName: 'Ramasamy',
    email: 'karthik.r@alumni.mepco.edu',
    phone: '+919842100001',
    street: '12 Anna Nagar East',
    locality: 'Anna Nagar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    pincode: '600102',
    transactionMode: 'online',
    notes: 'Proud alumnus of 2012 CSE batch. Best wishes for the new robotics center!',
    anonymous: false,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000 * 2),
  },
  {
    _id: 'c002',
    fundId: '675d0123456789abcdef0002',
    amount: 50000,
    firstName: 'Anonymous',
    lastName: 'Donor',
    email: 'secret@donor.org',
    phone: '+919876543210',
    street: 'Sector 5',
    locality: 'HSR Layout',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    pincode: '560102',
    transactionMode: 'upi',
    notes: 'Giving back to support deserving students.',
    anonymous: true,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000 * 4),
  },
  {
    _id: 'c003',
    fundId: '675d0123456789abcdef0001',
    amount: 10000,
    firstName: 'Priya',
    lastName: 'Sundaram',
    email: 'priya.ece@techcorp.com',
    phone: '+919443322110',
    street: '45 Race Course Road',
    locality: 'Race Course',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    country: 'India',
    pincode: '641018',
    transactionMode: 'card',
    notes: 'ECE 2016 Batch. For lab microcontrollers.',
    anonymous: false,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000 * 7),
  },
  {
    _id: 'c004',
    fundId: '675d0123456789abcdef0003',
    amount: 15000,
    firstName: 'Venkatesh',
    lastName: 'Natarajan',
    email: 'venkat.mech@alumni.mepco.edu',
    phone: '+919940123456',
    street: '78 Bypass Road',
    locality: 'KK Nagar',
    city: 'Madurai',
    state: 'Tamil Nadu',
    country: 'India',
    pincode: '625020',
    transactionMode: 'netbanking',
    notes: 'Happy to support IEEE access.',
    anonymous: false,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000 * 9),
  },
];

@Injectable({
  providedIn: 'root',
})
export class FundraisingService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _funds = signal<Fund[]>(INITIAL_FALLBACK_FUNDS);
  readonly funds = this._funds.asReadonly();

  private readonly _contributions = signal<Contribution[]>(INITIAL_FALLBACK_CONTRIBUTIONS);
  readonly contributions = this._contributions.asReadonly();

  private readonly _loading = signal<boolean>(false);
  readonly loading = this._loading.asReadonly();

  private readonly _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  readonly stats = computed<FundStats>(() => {
    const list = this._funds();
    const totalGoal = list.reduce((sum, f) => sum + (Number(f.goal) || 0), 0);
    const totalRaised = list.reduce((sum, f) => sum + (Number(f.raised) || 0), 0);
    const totalContributors = list.reduce((sum, f) => sum + (Number(f.contributors) || 0), 0);
    const activeCampaigns = list.length;
    const overallProgress = totalGoal > 0 ? Math.min(100, Math.round((totalRaised / totalGoal) * 100)) : 0;

    return {
      totalGoal,
      totalRaised,
      totalContributors,
      activeCampaigns,
      overallProgress,
    };
  });

  get apiBase(): string {
    if (isPlatformBrowser(this.platformId)) {
      const hostname = window.location.hostname;
      return hostname === 'localhost' || hostname === '127.0.0.1'
        ? 'http://localhost:5000'
        : `http://${hostname}:5000`;
    }
    return 'http://localhost:5000';
  }

  constructor() {
    this.loadFunds();
  }

  loadFunds(): void {
    this._loading.set(true);
    this._error.set(null);

    this.http
      .get<Fund[]>(`${this.apiBase}/api/fundraising`)
      .pipe(
        map((funds) =>
          funds.map((f) => ({
            ...f,
            _id: f._id || f.id || '',
            id: f.id || f._id || '',
          }))
        ),
        catchError((err: HttpErrorResponse) => {
          console.warn('Backend unavailable, utilizing cached/demo funds:', err.message);
          return of(this._funds());
        })
      )
      .subscribe({
        next: (funds) => {
          if (funds && funds.length > 0) {
            this._funds.set(funds);
          }
          this._loading.set(false);
        },
        error: (err) => {
          this._error.set('Failed to load fundraising data');
          this._loading.set(false);
        },
      });
  }

  getFundById(id: string): Observable<Fund | undefined> {
    return this.http.get<Fund>(`${this.apiBase}/api/fundraising/${encodeURIComponent(id)}`).pipe(
      map((f) => ({
        ...f,
        _id: f._id || f.id || id,
        id: f.id || f._id || id,
      })),
      catchError(() => {
        const found = this._funds().find((f) => f._id === id || f.id === id);
        return of(found);
      })
    );
  }

  createFund(data: CreateFundDto): Observable<{ success: boolean; message?: string; fund: Fund }> {
    return this.http
      .post<{ success: boolean; message: string; fund: Fund }>(`${this.apiBase}/api/fundraising`, data)
      .pipe(
        tap((res) => {
          if (res.fund) {
            const newFund: Fund = {
              ...res.fund,
              _id: res.fund._id || res.fund.id || String(Date.now()),
              id: res.fund.id || res.fund._id || String(Date.now()),
            };
            this._funds.update((list) => [newFund, ...list]);
          }
        }),
        catchError((err) => {
          // Local fallback creation
          const localFund: Fund = {
            _id: 'f_' + Date.now().toString(36),
            id: 'f_' + Date.now().toString(36),
            title: data.title,
            description: data.description,
            goal: Number(data.goal),
            raised: 0,
            contributors: 0,
            image: data.image,
            createdAt: new Date(),
            date: new Date(),
          };
          this._funds.update((list) => [localFund, ...list]);
          return of({
            success: true,
            message: 'Fund created (offline mode)',
            fund: localFund,
          });
        })
      );
  }

  updateFund(id: string, data: UpdateFundDto): Observable<{ success: boolean; message?: string }> {
    return this.http
      .put<{ success: boolean; message: string }>(`${this.apiBase}/api/fundraising/${encodeURIComponent(id)}`, data)
      .pipe(
        tap(() => {
          this._funds.update((list) =>
            list.map((f) => {
              if (f._id === id || f.id === id) {
                return {
                  ...f,
                  ...data,
                  goal: data.goal !== undefined ? Number(data.goal) : f.goal,
                };
              }
              return f;
            })
          );
        }),
        catchError(() => {
          this._funds.update((list) =>
            list.map((f) => {
              if (f._id === id || f.id === id) {
                return {
                  ...f,
                  ...data,
                  goal: data.goal !== undefined ? Number(data.goal) : f.goal,
                };
              }
              return f;
            })
          );
          return of({ success: true, message: 'Fund updated (offline mode)' });
        })
      );
  }

  deleteFund(id: string): Observable<{ success: boolean; message?: string }> {
    return this.http
      .delete<{ success: boolean; message: string }>(`${this.apiBase}/api/fundraising/${encodeURIComponent(id)}`)
      .pipe(
        tap(() => {
          this._funds.update((list) => list.filter((f) => f._id !== id && f.id !== id));
        }),
        catchError(() => {
          this._funds.update((list) => list.filter((f) => f._id !== id && f.id !== id));
          return of({ success: true, message: 'Fund deleted (offline mode)' });
        })
      );
  }

  getContributions(fundId: string): Observable<Contribution[]> {
    return this.http
      .get<Contribution[]>(`${this.apiBase}/api/fundraising/${encodeURIComponent(fundId)}/contributions`)
      .pipe(
        catchError(() => {
          const filtered = this._contributions().filter((c) => c.fundId === fundId);
          return of(filtered);
        })
      );
  }

  getAllContributions(): Observable<Contribution[]> {
    return this.http.get<Contribution[]>(`${this.apiBase}/api/contributions`).pipe(
      tap((list) => {
        if (Array.isArray(list) && list.length > 0) {
          this._contributions.set(list);
        }
      }),
      catchError(() => {
        return of(this._contributions());
      })
    );
  }

  submitContribution(dto: CreateContributionDto): Observable<ContributionResponse> {
    return this.http
      .post<ContributionResponse>(`${this.apiBase}/api/contributions`, dto)
      .pipe(
        tap((res) => {
          const newContrib: Contribution = {
            _id: res.contributionId || 'c_' + Date.now().toString(36),
            ...dto,
            createdAt: new Date(),
          };
          this._contributions.update((list) => [newContrib, ...list]);

          // Update fund stats in memory
          this._funds.update((funds) =>
            funds.map((f) => {
              if (f._id === dto.fundId || f.id === dto.fundId) {
                return {
                  ...f,
                  raised: (Number(f.raised) || 0) + Number(dto.amount),
                  contributors: (Number(f.contributors) || 0) + 1,
                };
              }
              return f;
            })
          );
        }),
        catchError((err: HttpErrorResponse) => {
          // If server error message exists from backend validation
          if (err.error && err.error.message) {
            return throwError(() => new Error(err.error.message));
          }

          // Fallback offline recording
          const localContrib: Contribution = {
            _id: 'c_' + Date.now().toString(36),
            ...dto,
            createdAt: new Date(),
          };
          this._contributions.update((list) => [localContrib, ...list]);
          this._funds.update((funds) =>
            funds.map((f) => {
              if (f._id === dto.fundId || f.id === dto.fundId) {
                return {
                  ...f,
                  raised: (Number(f.raised) || 0) + Number(dto.amount),
                  contributors: (Number(f.contributors) || 0) + 1,
                };
              }
              return f;
            })
          );
          return of({
            success: true,
            message: 'Contribution recorded successfully (offline mode)!',
            contributionId: localContrib._id,
          });
        })
      );
  }
}
