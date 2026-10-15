import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.css',
})
export class ProgressBarComponent {
  current = input<number>(0);
  target = input<number>(100);
  height = input<string>('8px');
  showLabel = input<boolean>(true);
  variant = input<'primary' | 'success' | 'warning'>('primary');

  percentage = computed(() => {
    const tgt = Number(this.target()) || 0;
    const cur = Number(this.current()) || 0;
    if (tgt <= 0) return 0;
    return Math.min(100, Math.round((cur / tgt) * 100));
  });

  isCompleted = computed(() => this.percentage() >= 100);
}
