import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AlumniUser } from '../../../../core/models/user.model';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
})
export class LoginPageComponent {
  private authService = inject(AuthService);
  private notify = inject(NotificationService);
  private router = inject(Router);

  email = signal('alumni@mepcoeng.ac.in');
  password = signal('password123');
  isLoading = signal(false);

  onLogin(): void {
    if (!this.email() || !this.password()) {
      this.notify.warning('Please enter both email and password.');
      return;
    }

    this.isLoading.set(true);
    const user: AlumniUser = {
      name: this.email().includes('@') ? this.email().split('@')[0] : this.email(),
      email: this.email(),
      role: this.email().toLowerCase().includes('admin') ? 'admin' : 'alumni',
      alumni_id: 'ALU-' + Math.floor(1000 + Math.random() * 9000),
      batch: '2019 - 2023',
      department: 'Computer Science & Engineering',
      avatar: '/images/user.png',
    };

    setTimeout(() => {
      this.authService.login(user);
      this.isLoading.set(false);
      this.notify.success(`Welcome back, ${user.name}!`);
      this.router.navigate(['/home']);
    }, 400);
  }
}
