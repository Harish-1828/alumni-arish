import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FundraisingService } from '../../../../core/services/fundraising.service';
import { NotificationService } from '../../../../core/services/notification.service';
import {
  ContributionResponse,
  CreateContributionDto,
  TransactionMode,
} from '../../../../core/models/contribution.model';

@Component({
  selector: 'app-donation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './donation-form.component.html',
  styleUrl: './donation-form.component.css',
})
export class DonationFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly fundraisingService = inject(FundraisingService);
  private readonly notificationService = inject(NotificationService);

  fundId = input.required<string>();
  fundTitle = input<string>('Fundraising Campaign');

  submitted = output<ContributionResponse>();
  cancelled = output<void>();

  readonly isSubmitting = signal<boolean>(false);
  readonly selectedPreset = signal<number | null>(1000);

  readonly presetAmounts = [500, 1000, 2500, 5000, 10000];

  readonly form: FormGroup = this.fb.group({
    fundId: ['', Validators.required],
    amount: [1000, [Validators.required, Validators.min(1)]],
    transactionMode: ['online', Validators.required],
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [
      '',
      [
        Validators.required,
        Validators.pattern(/^(?:\+?91[- ]?)?[6-9]\d{9}$/),
      ],
    ],
    street: ['', [Validators.required, Validators.maxLength(120)]],
    locality: ['', [Validators.required, Validators.maxLength(80)]],
    city: ['', [Validators.required, Validators.maxLength(60)]],
    state: ['Tamil Nadu', [Validators.required, Validators.maxLength(60)]],
    country: ['India', [Validators.required, Validators.maxLength(60)]],
    pincode: [
      '',
      [Validators.required, Validators.pattern(/^[1-9][0-9]{5}$/)],
    ],
    notes: ['', [Validators.maxLength(500)]],
    anonymous: [false],
  });

  constructor() {
    effect(() => {
      const id = this.fundId();
      if (id) {
        this.form.patchValue({ fundId: id });
      }
    });
  }

  selectPreset(amount: number): void {
    this.selectedPreset.set(amount);
    this.form.patchValue({ amount });
    this.form.get('amount')?.markAsDirty();
  }

  onCustomAmountInput(): void {
    const val = Number(this.form.get('amount')?.value);
    if (this.presetAmounts.includes(val)) {
      this.selectedPreset.set(val);
    } else {
      this.selectedPreset.set(null);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'This field is required';
    if (control.errors['min']) return 'Amount must be at least ₹1';
    if (control.errors['email']) return 'Please enter a valid email address';
    if (control.errors['pattern']) {
      if (fieldName === 'phone') return 'Enter a valid 10-digit Indian phone number';
      if (fieldName === 'pincode') return 'Enter a valid 6-digit postal pincode';
    }
    if (control.errors['minlength']) {
      return `Minimum ${control.errors['minlength'].requiredLength} characters required`;
    }
    if (control.errors['maxlength']) {
      return `Maximum ${control.errors['maxlength'].requiredLength} characters allowed`;
    }
    return 'Invalid field value';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificationService.error('Please fix the highlighted fields before submitting.');
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.form.value;

    const dto: CreateContributionDto = {
      fundId: formValue.fundId,
      amount: Number(formValue.amount),
      firstName: formValue.firstName.trim(),
      lastName: formValue.lastName.trim(),
      email: formValue.email.trim(),
      phone: formValue.phone.trim(),
      street: formValue.street.trim(),
      locality: formValue.locality.trim(),
      city: formValue.city.trim(),
      state: formValue.state.trim(),
      country: formValue.country.trim(),
      pincode: formValue.pincode.trim(),
      transactionMode: formValue.transactionMode as TransactionMode,
      notes: formValue.notes?.trim() || '',
      anonymous: !!formValue.anonymous,
    };

    this.fundraisingService.submitContribution(dto).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.notificationService.success(
          `Thank you for contributing ₹${dto.amount.toLocaleString('en-IN')}!`,
          'Contribution Successful'
        );
        this.submitted.emit(response);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.notificationService.error(
          err.message || 'Failed to submit contribution. Please try again.'
        );
      },
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
