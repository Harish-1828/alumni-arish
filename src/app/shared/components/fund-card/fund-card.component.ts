import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Fund } from '../../../core/models/fund.model';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';

@Component({
  selector: 'app-fund-card',
  standalone: true,
  imports: [CommonModule, RouterLink, ProgressBarComponent],
  templateUrl: './fund-card.component.html',
  styleUrl: './fund-card.component.css',
})
export class FundCardComponent {
  fund = input.required<Fund>();

  fundId = computed(() => this.fund()._id || this.fund().id || '');

  percentage = computed(() => {
    const goal = Number(this.fund().goal) || 0;
    const raised = Number(this.fund().raised) || 0;
    if (goal <= 0) return 0;
    return Math.min(100, Math.round((raised / goal) * 100));
  });

  formattedRaised = computed(() => {
    return Number(this.fund().raised || 0).toLocaleString('en-IN');
  });

  formattedGoal = computed(() => {
    return Number(this.fund().goal || 0).toLocaleString('en-IN');
  });
}
