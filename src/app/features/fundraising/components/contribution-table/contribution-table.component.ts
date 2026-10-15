import { Component, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contribution } from '../../../../core/models/contribution.model';

@Component({
  selector: 'app-contribution-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contribution-table.component.html',
  styleUrl: './contribution-table.component.css',
})
export class ContributionTableComponent {
  contributions = input.required<Contribution[]>();
  title = input<string>('Recent Contributions');
  showSearch = input<boolean>(true);

  searchQuery = signal<string>('');
  selectedMode = signal<string>('all');
  sortOrder = signal<'newest' | 'highest'>('newest');

  filteredContributions = computed(() => {
    let list = [...this.contributions()];
    const query = this.searchQuery().trim().toLowerCase();
    const mode = this.selectedMode();

    if (query) {
      list = list.filter((c) => {
        const name = `${c.firstName} ${c.lastName}`.toLowerCase();
        const city = (c.city || '').toLowerCase();
        const notes = (c.notes || '').toLowerCase();
        return (
          (!c.anonymous && (name.includes(query) || (c.email || '').toLowerCase().includes(query))) ||
          city.includes(query) ||
          notes.includes(query) ||
          c.amount.toString().includes(query)
        );
      });
    }

    if (mode !== 'all') {
      list = list.filter((c) => c.transactionMode === mode);
    }

    if (this.sortOrder() === 'highest') {
      list.sort((a, b) => b.amount - a.amount);
    } else {
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return list;
  });

  totalFilteredAmount = computed(() => {
    return this.filteredContributions().reduce((sum, c) => sum + Number(c.amount || 0), 0);
  });

  getDonorName(c: Contribution): string {
    if (c.anonymous) {
      return 'Anonymous Alumnus';
    }
    return `${c.firstName} ${c.lastName}`;
  }

  getMaskedEmail(c: Contribution): string {
    if (c.anonymous || !c.email) return '—';
    const parts = c.email.split('@');
    if (parts.length !== 2) return c.email;
    const user = parts[0];
    const maskedUser = user.length > 2 ? user.slice(0, 2) + '***' : user + '***';
    return `${maskedUser}@${parts[1]}`;
  }

  formatDate(dateVal: string | Date): string {
    if (!dateVal) return '—';
    const d = new Date(dateVal);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}

