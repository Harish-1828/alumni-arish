import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MembersService } from '../../../../core/services/members.service';

@Component({
  selector: 'app-proudable-alumni-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './proudable-alumni-page.component.html',
  styleUrls: ['./proudable-alumni-page.component.css'],
})
export class ProudableAlumniPageComponent implements OnInit {
  private membersService = inject(MembersService);

  readonly alumni = this.membersService.proudableAlumni;

  ngOnInit(): void {
    this.membersService.fetchProudableAlumni().subscribe();
  }
}

