import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, Observable, of, tap } from 'rxjs';
import { NotificationService } from './notification.service';

export interface AlumniRecord {
  _id?: string;
  alumni_id: string;
  name: string;
  department: string;
  batch: string;
  contact?: string;
  status?: string;
  dob?: string;
  avatar?: string;
}

const FALLBACK_ALUMNI: AlumniRecord[] = [
  {
    alumni_id: '20CSE045',
    name: 'S. Koushik Raj',
    department: 'Computer Science and Engineering',
    batch: '2020-2024',
    contact: '+919842101122',
    status: 'Software Development Engineer at Microsoft',
  },
  {
    alumni_id: '18ECE089',
    name: 'Divya Bharathi',
    department: 'Electronics & Communication Engineering',
    batch: '2018-2022',
    contact: '+919443322119',
    status: 'Hardware Verification Engineer at Intel',
  },
  {
    alumni_id: '15MECH032',
    name: 'R. Vignesh',
    department: 'Mechanical Engineering',
    batch: '2015-2019',
    contact: '+919940123987',
    status: 'Lead Powertrain Specialist at TVS Motor',
  },
  {
    alumni_id: '12EEE014',
    name: 'Dr. M. Aravind',
    department: 'Electrical & Electronics Engineering',
    batch: '2012-2016',
    contact: '+919789012345',
    status: 'Postdoctoral Research Scientist at IISc Bangalore',
  },
];

@Injectable({
  providedIn: 'root',
})
export class AlumniService {
  private readonly http = inject(HttpClient);
  private readonly notify = inject(NotificationService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly alumni = signal<AlumniRecord[]>(FALLBACK_ALUMNI);
  readonly loading = signal<boolean>(false);

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
    this.loadAlumni();
  }

  loadAlumni(): void {
    this.loading.set(true);
    this.http
      .get<AlumniRecord[]>(`${this.apiBase}/students`)
      .pipe(catchError(() => of(FALLBACK_ALUMNI)))
      .subscribe({
        next: (list) => {
          if (Array.isArray(list) && list.length > 0) {
            this.alumni.set(list);
          }
          this.loading.set(false);
        },
      });
  }

  getStudentById(id: string): Observable<AlumniRecord | undefined> {
    return of(this.alumni().find((a) => a.alumni_id === id || a._id === id));
  }
}

