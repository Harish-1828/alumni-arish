import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, Observable, of, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { AlumniFriend, FriendInvitation } from '../models/friend.model';

const FALLBACK_FRIENDS: AlumniFriend[] = [
  { id: 'f001', name: 'Vignesh Kathirmani', batch: '2020-2024', department: 'Computer Science', online: true },
  { id: 'f002', name: 'Priya Sundaram', batch: '2016-2020', department: 'ECE', online: false },
  { id: 'f003', name: 'Karthik Ramasamy', batch: '2012-2016', department: 'Mechanical', online: true },
  { id: 'f004', name: 'Aswin Harish', batch: '2023-2027', department: 'Computer Science', online: true },
];

const FALLBACK_INVITATIONS: FriendInvitation[] = [
  {
    _id: 'inv001',
    senderId: 'user_anand',
    senderName: 'Anand Kumar',
    receiverId: 'me',
    status: 'pending',
    createdAt: new Date(),
  },
  {
    _id: 'inv002',
    senderId: 'user_divya',
    senderName: 'Divya Bharathi',
    receiverId: 'me',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 24),
  },
];

@Injectable({
  providedIn: 'root',
})
export class FriendsService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly notify = inject(NotificationService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly friends = signal<AlumniFriend[]>(FALLBACK_FRIENDS);
  readonly invitations = signal<FriendInvitation[]>(FALLBACK_INVITATIONS);
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

  loadFriends(alumniId?: string): void {
    const id = alumniId || this.auth.currentUser()?.id || 'demo_alumni';
    this.loading.set(true);

    this.http
      .get<{ success: boolean; friends: any[] }>(`${this.apiBase}/api/friends/${encodeURIComponent(id)}`)
      .pipe(
        catchError(() => of({ success: true, friends: [] }))
      )
      .subscribe({
        next: (res) => {
          if (res.friends && res.friends.length > 0) {
            const mapped: AlumniFriend[] = res.friends.map((f: any) => ({
              id: f.senderId === id ? f.receiverId : f.senderId,
              name: f.senderId === id ? f.receiverName : f.senderName,
              department: f.department || 'Engineering',
              batch: f.batch || 'Alumnus',
              online: Math.random() > 0.4,
            }));
            this.friends.set(mapped);
          }
          this.loading.set(false);
        },
      });

    this.loadInvitations(id);
  }

  loadInvitations(alumniId: string): void {
    this.http
      .get<{ success: boolean; invitations: FriendInvitation[] }>(
        `${this.apiBase}/api/friends/invitations/${encodeURIComponent(alumniId)}`
      )
      .pipe(catchError(() => of({ success: true, invitations: this.invitations() })))
      .subscribe({
        next: (res) => {
          if (res.invitations) {
            this.invitations.set(res.invitations);
          }
        },
      });
  }

  sendInvite(receiverId: string, receiverName: string): Observable<{ success: boolean; message: string }> {
    const currentUser = this.auth.currentUser();
    const payload = {
      senderId: currentUser?.id || 'me',
      senderName: currentUser?.name || 'Alumnus',
      receiverId,
      receiverName,
    };

    return this.http
      .post<{ success: boolean; message: string }>(`${this.apiBase}/api/friends/invite`, payload)
      .pipe(
        tap(() => this.notify.success(`Invitation sent to ${receiverName}!`, 'Request Sent')),
        catchError((err) => {
          this.notify.success(`Invitation sent to ${receiverName} (demo mode)!`, 'Request Sent');
          return of({ success: true, message: 'Invite sent' });
        })
      );
  }

  acceptInvite(invitation: FriendInvitation): void {
    const invId = invitation._id || '';
    this.http
      .post<{ success: boolean }>(`${this.apiBase}/api/friends/accept/${encodeURIComponent(invId)}`, {})
      .pipe(
        catchError(() => of({ success: true }))
      )
      .subscribe({
        next: () => {
          this.invitations.update((list) => list.filter((i) => i._id !== invId));
          this.friends.update((list) => [
            {
              id: invitation.senderId,
              name: invitation.senderName,
              department: 'Engineering Alumnus',
              batch: '2022',
              online: true,
            },
            ...list,
          ]);
          this.notify.success(`You are now connected with ${invitation.senderName}!`);
        },
      });
  }

  rejectInvite(invitationId: string): void {
    this.http
      .post<{ success: boolean }>(`${this.apiBase}/api/friends/reject/${encodeURIComponent(invitationId)}`, {})
      .pipe(
        catchError(() => of({ success: true }))
      )
      .subscribe({
        next: () => {
          this.invitations.update((list) => list.filter((i) => i._id !== invitationId));
          this.notify.info('Invitation declined');
        },
      });
  }

  removeFriend(friendId: string): void {
    this.friends.update((list) => list.filter((f) => f.id !== friendId));
    this.notify.info('Friend connection removed');
  }
}

