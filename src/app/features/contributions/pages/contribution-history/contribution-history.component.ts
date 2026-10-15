import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FundraisingService } from '../../../../core/services/fundraising.service';
import { ContributionTableComponent } from '../../../fundraising/components/contribution-table/contribution-table.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-contribution-history',
  standalone: true,
  imports: [CommonModule, RouterLink, ContributionTableComponent, StatCardComponent],
  templateUrl: './contribution-history.component.html',
  styleUrl: './contribution-history.component.css',
})
export class ContributionHistoryComponent implements OnInit {
  readonly fundraisingService = inject(FundraisingService);
  private readonly notificationService = inject(NotificationService);

  readonly contributions = this.fundraisingService.contributions;

  readonly totalDonated = computed(() => {
    return this.contributions().reduce((sum, c) => sum + Number(c.amount || 0), 0);
  });

  readonly anonymousCount = computed(() => {
    return this.contributions().filter((c) => c.anonymous).length;
  });

  readonly averageDonation = computed(() => {
    const list = this.contributions();
    if (list.length === 0) return 0;
    return Math.round(this.totalDonated() / list.length);
  });

  ngOnInit(): void {
    this.fundraisingService.getAllContributions().subscribe();
  }

  exportCSV(): void {
    const list = this.contributions();
    if (list.length === 0) {
      this.notificationService.warning('No contributions available to export');
      return;
    }

    const headers = [
      'ID',
      'Fund ID',
      'Date',
      'Amount (INR)',
      'Donor Name',
      'Email',
      'Phone',
      'Transaction Mode',
      'City',
      'Pincode',
      'Anonymous',
      'Notes',
    ];

    const rows = list.map((c) => [
      c._id || '',
      c.fundId,
      new Date(c.createdAt).toISOString(),
      c.amount,
      c.anonymous ? 'Anonymous' : `"${c.firstName} ${c.lastName}"`,
      c.anonymous ? 'Hidden' : c.email,
      c.anonymous ? 'Hidden' : c.phone,
      c.transactionMode,
      `"${c.city || ''}"`,
      c.pincode || '',
      c.anonymous ? 'Yes' : 'No',
      `"${(c.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mepco_contributions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.notificationService.success('CSV ledger downloaded successfully!');
  }
}

