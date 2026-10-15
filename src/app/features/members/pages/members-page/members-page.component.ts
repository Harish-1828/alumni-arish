import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MembersService } from '../../../../core/services/members.service';

@Component({
  selector: 'app-members-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './members-page.component.html',
  styleUrls: ['./members-page.component.css'],
})
export class MembersPageComponent implements OnInit {
  private membersService = inject(MembersService);

  readonly members = this.membersService.facultyMembers;

  ngOnInit(): void {
    this.membersService.fetchFaculty().subscribe();
  }
}

