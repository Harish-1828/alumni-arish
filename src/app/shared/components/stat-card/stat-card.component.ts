import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.css',
})
export class StatCardComponent {
  icon = input<string>('📊');
  label = input.required<string>();
  value = input<string | number | null | undefined>(0);
  prefix = input<string>('');
  suffix = input<string>('');
  trend = input<string>('');
  theme = input<'blue' | 'green' | 'purple' | 'amber'>('blue');
}
