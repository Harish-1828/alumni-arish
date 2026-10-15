import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { JobsService } from '../../../../core/services/jobs.service';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-jobs-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './jobs-page.component.html',
  styleUrl: './jobs-page.component.css',
})
export class JobsPageComponent {
  private readonly fb = inject(FormBuilder);
  readonly jobsService = inject(JobsService);

  readonly jobs = this.jobsService.jobs;
  readonly internships = this.jobsService.internships;
  readonly loading = this.jobsService.loading;

  readonly activeTab = signal<'jobs' | 'internships'>('jobs');
  readonly searchQuery = signal<string>('');
  readonly isPostModalOpen = signal<boolean>(false);

  readonly postForm: FormGroup = this.fb.group({
    type: ['job', Validators.required],
    title: ['', [Validators.required, Validators.minLength(3)]],
    company: ['', Validators.required],
    companyWebsite: [''],
    location: ['Chennai, Hybrid', Validators.required],
    contactEmail: ['', [Validators.required, Validators.email]],
    jobArea: ['Software Engineering'],
    skills: ['Angular, TypeScript', Validators.required],
    compensation: ['₹8,00,000 - ₹12,00,000 P.A.'],
    deadline: ['2026-12-31'],
    description: ['', [Validators.required, Validators.minLength(20)]],
  });

  readonly filteredJobs = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.jobs();
    return this.jobs().filter(
      (j) =>
        j.jobTitle.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.skills.some((s) => s.toLowerCase().includes(q))
    );
  });

  readonly filteredInternships = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.internships();
    return this.internships().filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.company.toLowerCase().includes(q) ||
        i.skills.some((s) => s.toLowerCase().includes(q))
    );
  });

  openPostModal(): void {
    this.postForm.reset({
      type: 'job',
      title: '',
      company: '',
      companyWebsite: '',
      location: 'Chennai, Hybrid',
      contactEmail: '',
      jobArea: 'Engineering',
      skills: '',
      compensation: '',
      deadline: '',
      description: '',
    });
    this.isPostModalOpen.set(true);
  }

  closePostModal(): void {
    this.isPostModalOpen.set(false);
  }

  onPostSubmit(): void {
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      return;
    }

    const val = this.postForm.value;
    const locations = String(val.location)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const skillsList = String(val.skills)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (val.type === 'job') {
      this.jobsService
        .postJob({
          jobTitle: val.title,
          company: val.company,
          companyWebsite: val.companyWebsite,
          location: locations,
          contactEmail: val.contactEmail,
          jobArea: val.jobArea,
          skills: skillsList,
          salary: val.compensation,
          applicationDeadline: val.deadline,
          jobDescription: val.description,
        })
        .subscribe(() => this.closePostModal());
    } else {
      this.jobsService
        .postInternship({
          title: val.title,
          company: val.company,
          companyWebsite: val.companyWebsite,
          location: locations,
          contactEmail: val.contactEmail,
          jobArea: val.jobArea,
          skills: skillsList,
          stipend: val.compensation,
          applicationDeadline: val.deadline,
          description: val.description,
        })
        .subscribe(() => this.closePostModal());
    }
  }
}
