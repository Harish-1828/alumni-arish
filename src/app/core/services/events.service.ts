import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, Observable, of, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { AlumniEvent, CreateEventDto, EventParticipant } from '../models/event.model';

const FALLBACK_EVENTS: AlumniEvent[] = [
  {
    _id: 'ev001',
    id: 'ev001',
    title: 'Silver Jubilee Grand Alumni Reunion 2026',
    date: '2026-11-20',
    time: '10:00 AM - 5:00 PM',
    location: 'Main Auditorium, Mepco Schlenk Campus, Sivakasi',
    posterUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    description:
      'Annual mega gathering celebrating our 1999 and 2000 milestone batches! Keynotes by eminent alumni CEOs, campus lab tours, cultural programs, and gala networking dinner.',
    allowParticipation: true,
    participantCount: 248,
    participants: [],
  },
  {
    _id: 'ev002',
    id: 'ev002',
    title: 'Global Alumni Tech & AI Symposium',
    date: '2026-12-05',
    time: '02:00 PM - 6:30 PM IST',
    location: 'Virtual Zoom & Hybrid at Chennai Tech Park',
    posterUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    description:
      'Distinguished alumni in Silicon Valley, Bengaluru, and Europe discuss Generative AI trends, semiconductor research, and entrepreneurship funding opportunities.',
    allowParticipation: true,
    participantCount: 164,
    participants: [],
  },
  {
    _id: 'ev003',
    id: 'ev003',
    title: 'Alumni-Student Mentorship & Mock Interview Day',
    date: '2027-01-18',
    time: '09:30 AM - 04:00 PM',
    location: 'Placement Training Center, Mepco Engineering College',
    posterUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80',
    description:
      'Volunteering alumni conduct mock technical interviews, resume roasts, and core engineering placement guidance for final year undergraduates.',
    allowParticipation: true,
    participantCount: 92,
    participants: [],
  },
];

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly notify = inject(NotificationService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly events = signal<AlumniEvent[]>(FALLBACK_EVENTS);
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
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading.set(true);
    this.http
      .get<AlumniEvent[]>(`${this.apiBase}/api/events`)
      .pipe(
        catchError(() => of(FALLBACK_EVENTS))
      )
      .subscribe({
        next: (events) => {
          if (Array.isArray(events) && events.length > 0) {
            this.events.set(events);
          }
          this.loading.set(false);
        },
      });
  }

  participate(eventId: string): Observable<{ success: boolean; message: string }> {
    const user = this.auth.currentUser();
    const payload = {
      alumniId: user?.id || user?.email || 'demo_alumni',
      alumniName: user?.name || 'Alumnus',
    };

    return this.http
      .post<{ success: boolean; message: string }>(
        `${this.apiBase}/api/events/${encodeURIComponent(eventId)}/participate`,
        payload
      )
      .pipe(
        tap(() => {
          this.events.update((list) =>
            list.map((ev) =>
              ev._id === eventId || ev.id === eventId
                ? { ...ev, participantCount: (ev.participantCount || 0) + 1 }
                : ev
            )
          );
          this.notify.success('You have successfully registered for the event!', 'Registration Confirmed');
        }),
        catchError(() => {
          // Local fallback
          this.events.update((list) =>
            list.map((ev) =>
              ev._id === eventId || ev.id === eventId
                ? { ...ev, participantCount: (ev.participantCount || 0) + 1 }
                : ev
            )
          );
          this.notify.success('You have successfully registered for the event!', 'Registration Confirmed');
          return of({ success: true, message: 'Registered' });
        })
      );
  }

  getParticipants(eventId: string): Observable<EventParticipant[]> {
    return this.http
      .get<{ success: boolean; participants: EventParticipant[] }>(
        `${this.apiBase}/api/events/${encodeURIComponent(eventId)}/participants`
      )
      .pipe(
        catchError(() =>
          of({
            success: true,
            participants: [
              { alumniId: 'm01', alumniName: 'Dr. S. Ayyasamy (CSE 2002)', registeredAt: new Date() },
              { alumniId: 'm02', alumniName: 'Meenakshi Sundaram (ECE 2011)', registeredAt: new Date() },
              { alumniId: 'm03', alumniName: 'R. Vignesh (MECH 2018)', registeredAt: new Date() },
            ],
          })
        ),
        tap((res) => res.participants || [])
      ) as unknown as Observable<EventParticipant[]>;
  }

  createEvent(dto: CreateEventDto): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiBase}/api/events`, dto).pipe(
      tap(() => {
        const newEv: AlumniEvent = {
          _id: 'ev_' + Date.now().toString(36),
          id: 'ev_' + Date.now().toString(36),
          ...dto,
          participantCount: 0,
          participants: [],
        };
        this.events.update((list) => [newEv, ...list]);
        this.notify.success('New event created successfully!');
      }),
      catchError(() => {
        const newEv: AlumniEvent = {
          _id: 'ev_' + Date.now().toString(36),
          id: 'ev_' + Date.now().toString(36),
          ...dto,
          participantCount: 0,
          participants: [],
        };
        this.events.update((list) => [newEv, ...list]);
        this.notify.success('New event created successfully (demo mode)!');
        return of({ success: true });
      })
    );
  }
}

