import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FriendsService } from '../../../../core/services/friends.service';
import { AlumniService, AlumniRecord } from '../../../../core/services/alumni.service';
import { FriendInvitation } from '../../../../core/models/friend.model';

@Component({
  selector: 'app-friends-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './friends-page.component.html',
  styleUrl: './friends-page.component.css',
})
export class FriendsPageComponent {
  readonly friendsService = inject(FriendsService);
  readonly alumniService = inject(AlumniService);

  readonly friends = this.friendsService.friends;
  readonly invitations = this.friendsService.invitations;
  readonly allAlumni = this.alumniService.alumni;

  readonly activeTab = signal<'connections' | 'requests' | 'find'>('connections');
  readonly searchQuery = signal<string>('');

  readonly filteredFriends = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.friends();
    return this.friends().filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.department && f.department.toLowerCase().includes(q)) ||
        (f.batch && f.batch.toLowerCase().includes(q))
    );
  });

  readonly discoverAlumni = computed(() => {
    const friendIds = new Set(this.friends().map((f) => f.id));
    const q = this.searchQuery().toLowerCase().trim();
    let list = this.allAlumni().filter((a) => !friendIds.has(a.alumni_id));

    if (q) {
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.department.toLowerCase().includes(q) ||
          a.batch.toLowerCase().includes(q)
      );
    }
    return list;
  });

  acceptRequest(inv: FriendInvitation): void {
    this.friendsService.acceptInvite(inv);
  }

  rejectRequest(invId: string): void {
    this.friendsService.rejectInvite(invId);
  }

  sendConnect(alumnus: AlumniRecord): void {
    this.friendsService.sendInvite(alumnus.alumni_id, alumnus.name).subscribe();
  }

  removeFriend(id: string): void {
    this.friendsService.removeFriend(id);
  }
}
