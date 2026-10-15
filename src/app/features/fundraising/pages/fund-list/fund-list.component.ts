import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FundraisingService } from '../../../../core/services/fundraising.service';
import { FundCardComponent } from '../../../../shared/components/fund-card/fund-card.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-fund-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, FundCardComponent, StatCardComponent],
  templateUrl: './fund-list.component.html',
  styleUrl: './fund-list.component.css',
})
export class FundListComponent {
  readonly fundraisingService = inject(FundraisingService);

  readonly funds = this.fundraisingService.funds;
  readonly stats = this.fundraisingService.stats;
  readonly loading = this.fundraisingService.loading;

  readonly searchFilter = signal<string>('');
  readonly sortBy = signal<'recent' | 'goal' | 'progress'>('recent');

  readonly filteredFunds = computed(() => {
    let list = [...this.funds()];
    const query = this.searchFilter().trim().toLowerCase();

    if (query) {
      list = list.filter(
        (f) =>
          f.title.toLowerCase().includes(query) ||
          f.description.toLowerCase().includes(query)
      );
    }

    if (this.sortBy() === 'goal') {
      list.sort((a, b) => b.goal - a.goal);
    } else if (this.sortBy() === 'progress') {
      list.sort((a, b) => {
        const progA = a.goal ? a.raised / a.goal : 0;
        const progB = b.goal ? b.raised / b.goal : 0;
        return progB - progA;
      });
    }

    return list;
  });

  reload(): void {
    this.fundraisingService.loadFunds();
  }
}

