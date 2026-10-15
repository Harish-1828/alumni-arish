import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AlumniUser } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _currentUser = signal<AlumniUser | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  readonly isAuthenticated = computed(() => !!this._currentUser());
  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');

  constructor() {
    this.restoreSession();
  }

  restoreSession(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
      const storedUser = sessionStorage.getItem('loggedInUser');

      if (isLoggedIn && storedUser) {
        let user: AlumniUser;
        try {
          user = JSON.parse(storedUser);
        } catch {
          user = {
            name: storedUser,
            email: sessionStorage.getItem('userEmail') || `${storedUser.toLowerCase().replace(/\s+/g, '')}@alumni.mepco.edu`,
            role: storedUser.toLowerCase().includes('admin') ? 'admin' : 'alumni',
          };
        }
        this._currentUser.set(user);
      }
    } catch {
      // Fallback for storage restrictions
    }
  }

  login(user: AlumniUser): void {
    this._currentUser.set(user);
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('loggedInUser', JSON.stringify(user));
    }
  }

  logout(): void {
    this._currentUser.set(null);
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.clear();
      localStorage.removeItem('token');
    }
    this.router.navigate(['/fundraising']);
  }
}
