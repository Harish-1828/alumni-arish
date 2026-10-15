import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FundraisingService } from '../../../../core/services/fundraising.service';
import { Fund } from '../../../../core/models/fund.model';
import { Contribution } from '../../../../core/models/contribution.model';
import { ProgressBarComponent } from '../../../../shared/components/progress-bar/progress-bar.component';
import { ContributionTableComponent } from '../../components/contribution-table/contribution-table.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { DonationFormComponent } from '../../components/donation-form/donation-form.component';

@Component({
  selector: 'app-fund-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ProgressBarComponent,
    ContributionTableComponent,
    ModalComponent,
    DonationFormComponent,
  ],
  templateUrl: './fund-detail.component.html',
  styleUrl: './fund-detail.component.css',
})
export class FundDetailComponent implements OnInit {
  readonly Math = Math;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fundraisingService = inject(FundraisingService);

  readonly fund = signal<Fund | null>(null);
  readonly contributions = signal<Contribution[]>([]);
  readonly loading = signal<boolean>(true);
  readonly isDonateModalOpen = signal<boolean>(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadFundDetails(id);
    } else {
      this.router.navigate(['/fundraising']);
    }
  }

  loadFundDetails(id: string): void {
    this.loading.set(true);
    this.fundraisingService.getFundById(id).subscribe({
      next: (f) => {
        if (f) {
          this.fund.set(f);
          this.loadContributions(id);
        } else {
          this.fund.set(null);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  loadContributions(id: string): void {
    this.fundraisingService.getContributions(id).subscribe({
      next: (list) => {
        this.contributions.set(list);
      },
    });
  }

  openDonateModal(): void {
    this.isDonateModalOpen.set(true);
  }

  closeDonateModal(): void {
    this.isDonateModalOpen.set(false);
  }

  onDonationSuccess(): void {
    this.closeDonateModal();
    const currentFund = this.fund();
    if (currentFund) {
      this.loadFundDetails(currentFund._id || currentFund.id || '');
    }
  }
}
