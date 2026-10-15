import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { AlumniService, AlumniRecord } from '../../../../core/services/alumni.service';
import { FriendsService } from '../../../../core/services/friends.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css',
})
export class ProfilePageComponent {
  readonly auth = inject(AuthService);
  readonly alumniService = inject(AlumniService);
  readonly friendsService = inject(FriendsService);

  readonly currentUser = this.auth.currentUser;
  readonly allAlumni = this.alumniService.alumni;

  readonly directorySearch = signal<string>('');
  readonly selectedDept = signal<string>('all');

  readonly filteredDirectory = computed(() => {
    let list = this.allAlumni();
    const q = this.directorySearch().toLowerCase().trim();
    const dept = this.selectedDept();

    if (dept !== 'all') {
      list = list.filter((a) => a.department.toLowerCase().includes(dept.toLowerCase()));
    }

    if (q) {
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.alumni_id.toLowerCase().includes(q) ||
          a.batch.toLowerCase().includes(q) ||
          (a.status && a.status.toLowerCase().includes(q))
      );
    }
    return list;
  });

  connect(alumnus: AlumniRecord): void {
    this.friendsService.sendInvite(alumnus.alumni_id, alumnus.name).subscribe();
  }
}
