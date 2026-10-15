import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { FacultyMember, ProudableAlumnus } from '../models/member.model';

const INITIAL_FACULTY: FacultyMember[] = [
  {
    _id: 'm1',
    name: 'Dr. S. Arivazhagan',
    role: 'Principal',
    designation: 'Professor & Head',
    experience: '25+ Years Experience',
    photo: '/images/user.png',
    department: 'Electronics & Communication',
  },
  {
    _id: 'm2',
    name: 'Dr. K. M. Aroul Canessane',
    role: 'Alumni Coordinator',
    designation: 'Associate Professor',
    experience: '18+ Years Experience',
    photo: '/images/user.png',
    department: 'Computer Science',
  },
  {
    _id: 'm3',
    name: 'Dr. M. Vimala',
    role: 'Faculty Advisor',
    designation: 'Assistant Professor (Sr. Gr.)',
    experience: '12+ Years Experience',
    photo: '/images/user.png',
    department: 'Information Technology',
  },
];

const INITIAL_PROUDABLE: ProudableAlumnus[] = [
  {
    _id: 'pa1',
    name: 'Sundar Pitchai Raj',
    batch: 'Batch of 2004',
    designation: 'VP of Engineering',
    company: 'Global Cloud Systems',
    achievements: 'Pioneered enterprise-grade microservice architecture; recognized with 4 US Patents in distributed systems.',
    photo: '/images/user.png',
  },
  {
    _id: 'pa2',
    name: 'Deepa Muthukumar',
    batch: 'Batch of 2011',
    designation: 'Founder & CEO',
    company: 'FinEdge AI',
    achievements: 'Named in Forbes 30 Under 30 Asia for pioneering AI algorithms in automated risk assessment.',
    photo: '/images/user.png',
  },
  {
    _id: 'pa3',
    name: 'Karthik Subramanian',
    batch: 'Batch of 2016',
    designation: 'Principal Security Researcher',
    company: 'CyberDefend Labs',
    achievements: 'Credited with discovering critical zero-day vulnerabilities in web runtime standards.',
    photo: '/images/user.png',
  },
];

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  private http = inject(HttpClient);
  private membersUrl = 'http://localhost:5000/api/members';
  private proudableUrl = 'http://localhost:5000/api/proudable-alumni';

  readonly facultyMembers = signal<FacultyMember[]>(INITIAL_FACULTY);
  readonly proudableAlumni = signal<ProudableAlumnus[]>(INITIAL_PROUDABLE);

  fetchFaculty(): Observable<FacultyMember[]> {
    return this.http.get<FacultyMember[]>(this.membersUrl).pipe(
      tap((res) => {
        if (res && res.length > 0) this.facultyMembers.set(res);
      }),
      catchError(() => of(this.facultyMembers()))
    );
  }

  fetchProudableAlumni(): Observable<ProudableAlumnus[]> {
    return this.http.get<ProudableAlumnus[]>(this.proudableUrl).pipe(
      tap((res) => {
        if (res && res.length > 0) this.proudableAlumni.set(res);
      }),
      catchError(() => of(this.proudableAlumni()))
    );
  }
}

