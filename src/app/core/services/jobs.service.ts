import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, Observable, of, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { InternshipPosting, JobPosting } from '../models/job.model';

const FALLBACK_JOBS: JobPosting[] = [
  {
    _id: 'j001',
    jobTitle: 'Senior Full Stack Engineer (Angular / Node)',
    company: 'Zoho Corporation',
    companyWebsite: 'https://www.zoho.com',
    location: ['Chennai', 'Tenkasi'],
    contactEmail: 'careers@zohocorp.com',
    jobArea: 'Software Development',
    skills: ['Angular', 'TypeScript', 'Node.js', 'MongoDB', 'REST APIs'],
    experienceFrom: 2,
    experienceTo: 5,
    salary: '₹12,00,000 - ₹18,00,000 P.A.',
    applicationDeadline: '2026-11-30',
    jobDescription:
      'Architecting resilient cloud SaaS applications. Looking for Mepco engineering alumni with hands-on expertise in modern Angular and backend architecture.',
    postedBy: 'alumni_hr_zoho',
    postedDate: new Date('2026-10-01'),
  },
  {
    _id: 'j002',
    jobTitle: 'Embedded Systems & Firmware Engineer',
    company: 'Bosch Global Software Technologies',
    companyWebsite: 'https://www.bosch.in',
    location: ['Bengaluru', 'Coimbatore'],
    contactEmail: 'campus.referrals@bosch.com',
    jobArea: 'Core Engineering & IoT',
    skills: ['Embedded C', 'RTOS', 'CAN Protocol', 'Microcontrollers', 'AUTOSAR'],
    experienceFrom: 1,
    experienceTo: 4,
    salary: '₹8,50,000 - ₹14,00,000 P.A.',
    applicationDeadline: '2026-12-15',
    jobDescription:
      'Developing automotive control firmware for EV powertrains. Preferred backgrounds: EEE, ECE, EIE batches of Mepco.',
    postedBy: 'alumni_bosch',
    postedDate: new Date('2026-10-08'),
  },
  {
    _id: 'j003',
    jobTitle: 'Associate Data Scientist & ML Engineer',
    company: 'Tata Consultancy Services Research',
    companyWebsite: 'https://www.tcs.com',
    location: ['Chennai', 'Hyderabad'],
    contactEmail: 'tcs.alumni.referrals@tcs.com',
    jobArea: 'Data Science & AI',
    skills: ['Python', 'PyTorch', 'SQL', 'NLP', 'Vector Databases'],
    experienceFrom: 0,
    experienceTo: 2,
    salary: '₹7,00,000 - ₹10,50,000 P.A.',
    applicationDeadline: '2026-11-25',
    jobDescription:
      'Working on Large Language Models fine-tuning and enterprise analytics workflows. Open to recent graduates and alumni.',
    postedBy: 'alumni_tcs',
    postedDate: new Date('2026-10-10'),
  },
];

const FALLBACK_INTERNSHIPS: InternshipPosting[] = [
  {
    _id: 'i001',
    title: 'Frontend Engineering Intern (Angular 22)',
    company: 'Freshworks Inc.',
    companyWebsite: 'https://www.freshworks.com',
    duration: '6 Months',
    location: ['Chennai'],
    contactEmail: 'internships@freshworks.com',
    jobArea: 'Web Development',
    skills: ['Angular', 'TypeScript', 'CSS', 'HTML5'],
    stipend: '₹35,000 / month',
    applicationDeadline: '2026-11-15',
    description:
      'Work alongside core engineering teams building customer engagement suites. PPO opportunity based on performance.',
    postedBy: 'alumni_freshworks',
    postedDate: new Date('2026-10-05'),
  },
  {
    _id: 'i002',
    title: 'VLSI Design & Physical Verification Intern',
    company: 'Qualcomm India',
    companyWebsite: 'https://www.qualcomm.com',
    duration: '11 Months',
    location: ['Bengaluru'],
    contactEmail: 'university.relations@qualcomm.com',
    jobArea: 'Semiconductors',
    skills: ['Verilog', 'SystemVerilog', 'Digital Design', 'STA'],
    stipend: '₹45,000 / month',
    applicationDeadline: '2026-12-01',
    description:
      'Silicon design verification for next-gen Snapdragon processors. ECE/EEE postgrads and final year students.',
    postedBy: 'alumni_qualcomm',
    postedDate: new Date('2026-10-09'),
  },
];

@Injectable({
  providedIn: 'root',
})
export class JobsService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly notify = inject(NotificationService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly jobs = signal<JobPosting[]>(FALLBACK_JOBS);
  readonly internships = signal<InternshipPosting[]>(FALLBACK_INTERNSHIPS);
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
    this.loadOpportunities();
  }

  loadOpportunities(): void {
    this.loading.set(true);
    this.http
      .get<JobPosting[]>(`${this.apiBase}/api/jobs`)
      .pipe(catchError(() => of(FALLBACK_JOBS)))
      .subscribe({
        next: (jobsList) => {
          if (Array.isArray(jobsList) && jobsList.length > 0) {
            this.jobs.set(jobsList);
          }
          this.loading.set(false);
        },
      });

    this.http
      .get<InternshipPosting[]>(`${this.apiBase}/api/internships`)
      .pipe(catchError(() => of(FALLBACK_INTERNSHIPS)))
      .subscribe({
        next: (internshipList) => {
          if (Array.isArray(internshipList) && internshipList.length > 0) {
            this.internships.set(internshipList);
          }
        },
      });
  }

  postJob(job: Omit<JobPosting, '_id' | 'postedDate' | 'postedBy'>): Observable<{ success: boolean }> {
    const user = this.auth.currentUser();
    const payload = {
      ...job,
      postedBy: user?.id || user?.name || 'Mepco Alumnus',
    };

    return this.http.post<{ success: boolean }>(`${this.apiBase}/api/jobs`, payload).pipe(
      tap(() => {
        const created: JobPosting = {
          _id: 'j_' + Date.now().toString(36),
          ...payload,
          postedDate: new Date(),
        };
        this.jobs.update((list) => [created, ...list]);
        this.notify.success('Job opportunity posted successfully!');
      }),
      catchError(() => {
        const created: JobPosting = {
          _id: 'j_' + Date.now().toString(36),
          ...payload,
          postedDate: new Date(),
        };
        this.jobs.update((list) => [created, ...list]);
        this.notify.success('Job opportunity posted (demo mode)!');
        return of({ success: true });
      })
    );
  }

  postInternship(internship: Omit<InternshipPosting, '_id' | 'postedDate' | 'postedBy'>): Observable<{ success: boolean }> {
    const user = this.auth.currentUser();
    const payload = {
      ...internship,
      postedBy: user?.id || user?.name || 'Mepco Alumnus',
    };

    return this.http.post<{ success: boolean }>(`${this.apiBase}/api/internships`, payload).pipe(
      tap(() => {
        const created: InternshipPosting = {
          _id: 'i_' + Date.now().toString(36),
          ...payload,
          postedDate: new Date(),
        };
        this.internships.update((list) => [created, ...list]);
        this.notify.success('Internship opportunity posted successfully!');
      }),
      catchError(() => {
        const created: InternshipPosting = {
          _id: 'i_' + Date.now().toString(36),
          ...payload,
          postedDate: new Date(),
        };
        this.internships.update((list) => [created, ...list]);
        this.notify.success('Internship opportunity posted (demo mode)!');
        return of({ success: true });
      })
    );
  }
}
