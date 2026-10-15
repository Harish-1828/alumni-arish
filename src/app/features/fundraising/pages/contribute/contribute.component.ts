import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FundraisingService } from '../../../../core/services/fundraising.service';
import { Fund } from '../../../../core/models/fund.model';
import { Contribution } from '../../../../core/models/contribution.model';
import { DonationFormComponent } from '../../components/donation-form/donation-form.component';
import { ContributionTableComponent } from '../../components/contribution-table/contribution-table.component';
import { ProgressBarComponent } from '../../../../shared/components/progress-bar/progress-bar.component';

@Component({
  selector: 'app-contribute',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    DonationFormComponent,
    ContributionTableComponent,
    ProgressBarComponent,
  ],
  templateUrl: './contribute.component.html',
  styleUrl: './contribute.component.css',
})
export class ContributeComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly fundraisingService = inject(FundraisingService);

  readonly allFunds = this.fundraisingService.funds;

  readonly selectedFundId = signal<string>('');
  readonly contributions = signal<Contribution[]>([]);
  readonly isSuccess = signal<boolean>(false);
  readonly lastDonationRef = signal<string>('');

  readonly selectedFund = computed(() => {
    const id = this.selectedFundId();
    if (!id) return this.allFunds()[0] || null;
    return this.allFunds().find((f) => f._id === id || f.id === id) || null;
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const routeFundId = params.get('fundId');
      if (routeFundId) {
        this.selectFund(routeFundId);
      } else {
        this.route.queryParamMap.subscribe((queryParams) => {
          const qFundId = queryParams.get('fundId');
          if (qFundId) {
            this.selectFund(qFundId);
          } else if (this.allFunds().length > 0) {
            this.selectFund(this.allFunds()[0]._id || this.allFunds()[0].id || '');
          }
        });
      }
    });
  }

  selectFund(id: string): void {
    this.selectedFundId.set(id);
    this.loadFundContributions(id);
  }

  onFundChange(id: string): void {
    this.selectFund(id);
  }

  loadFundContributions(id: string): void {
    if (!id) return;
    this.fundraisingService.getContributions(id).subscribe({
      next: (list) => {
        this.contributions.set(list);
      },
    });
  }

  onSubmitted(res: { success: boolean; contributionId?: string }): void {
    this.isSuccess.set(true);
    this.lastDonationRef.set(res.contributionId || 'MSEC-' + Math.floor(100000 + Math.random() * 900000));
    const currentId = this.selectedFundId();
    if (currentId) {
      this.loadFundContributions(currentId);
    }
  }

  resetSuccess(): void {
    this.isSuccess.set(false);
  }

  navigateBack(): void {
    this.router.navigate(['/fundraising']);
  }
}

