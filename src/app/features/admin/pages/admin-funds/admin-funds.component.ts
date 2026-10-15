import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FundraisingService } from '../../../../core/services/fundraising.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Fund } from '../../../../core/models/fund.model';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ProgressBarComponent } from '../../../../shared/components/progress-bar/progress-bar.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-admin-funds',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    ModalComponent,
    ProgressBarComponent,
    StatCardComponent,
  ],
  templateUrl: './admin-funds.component.html',
  styleUrl: './admin-funds.component.css',
})
export class AdminFundsComponent {
  private readonly fb = inject(FormBuilder);
  readonly fundraisingService = inject(FundraisingService);
  private readonly notificationService = inject(NotificationService);

  readonly allFunds = this.fundraisingService.funds;
  readonly stats = this.fundraisingService.stats;
  readonly loading = this.fundraisingService.loading;

  readonly searchQuery = signal<string>('');
  readonly isCreateModalOpen = signal<boolean>(false);
  readonly isEditModalOpen = signal<boolean>(false);
  readonly isDeleteModalOpen = signal<boolean>(false);
  readonly editingFund = signal<Fund | null>(null);
  readonly deletingFund = signal<Fund | null>(null);
  readonly isSaving = signal<boolean>(false);

  readonly fundForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    goal: [100000, [Validators.required, Validators.min(1000)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    image: [''],
  });

  readonly filteredFunds = computed(() => {
    let list = [...this.allFunds()];
    const query = this.searchQuery().trim().toLowerCase();
    if (query) {
      list = list.filter(
        (f) =>
          f.title.toLowerCase().includes(query) ||
          f.description.toLowerCase().includes(query)
      );
    }
    return list;
  });

  openCreateModal(): void {
    this.fundForm.reset({
      title: '',
      goal: 100000,
      description: '',
      image: '',
    });
    this.isCreateModalOpen.set(true);
  }

  openEditModal(fund: Fund): void {
    this.editingFund.set(fund);
    this.fundForm.patchValue({
      title: fund.title,
      goal: fund.goal,
      description: fund.description,
      image: fund.image || '',
    });
    this.isEditModalOpen.set(true);
  }

  openDeleteModal(fund: Fund): void {
    this.deletingFund.set(fund);
    this.isDeleteModalOpen.set(true);
  }

  closeModals(): void {
    this.isCreateModalOpen.set(false);
    this.isEditModalOpen.set(false);
    this.isDeleteModalOpen.set(false);
    this.editingFund.set(null);
    this.deletingFund.set(null);
  }

  onCreateSubmit(): void {
    if (this.fundForm.invalid) {
      this.fundForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const val = this.fundForm.value;

    this.fundraisingService
      .createFund({
        title: val.title.trim(),
        goal: Number(val.goal),
        description: val.description.trim(),
        image: val.image?.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.closeModals();
          this.notificationService.success('Campaign created successfully!');
        },
        error: (err) => {
          this.isSaving.set(false);
          this.notificationService.error(err.message || 'Failed to create campaign');
        },
      });
  }

  onEditSubmit(): void {
    const current = this.editingFund();
    if (!current || this.fundForm.invalid) {
      this.fundForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const val = this.fundForm.value;
    const fundId = current._id || current.id || '';

    this.fundraisingService
      .updateFund(fundId, {
        title: val.title.trim(),
        goal: Number(val.goal),
        description: val.description.trim(),
        image: val.image?.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.closeModals();
          this.notificationService.success('Campaign updated successfully!');
        },
        error: (err) => {
          this.isSaving.set(false);
          this.notificationService.error(err.message || 'Failed to update campaign');
        },
      });
  }

  confirmDelete(): void {
    const current = this.deletingFund();
    if (!current) return;

    this.isSaving.set(true);
    const fundId = current._id || current.id || '';

    this.fundraisingService.deleteFund(fundId).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeModals();
        this.notificationService.success('Campaign removed successfully');
      },
      error: (err) => {
        this.isSaving.set(false);
        this.notificationService.error(err.message || 'Failed to delete campaign');
      },
    });
  }
}

