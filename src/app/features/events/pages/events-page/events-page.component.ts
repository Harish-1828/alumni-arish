import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventsService } from '../../../../core/services/events.service';
import { AlumniEvent, EventParticipant } from '../../../../core/models/event.model';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-events-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './events-page.component.html',
  styleUrl: './events-page.component.css',
})
export class EventsPageComponent {
  readonly eventsService = inject(EventsService);

  readonly events = this.eventsService.events;
  readonly loading = this.eventsService.loading;

  readonly isParticipantModalOpen = signal<boolean>(false);
  readonly selectedEvent = signal<AlumniEvent | null>(null);
  readonly currentParticipants = signal<EventParticipant[]>([]);
  readonly searchQuery = signal<string>('');

  readonly filteredEvents = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.events();
    return this.events().filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
    );
  });

  register(event: AlumniEvent): void {
    const id = event._id || event.id || '';
    this.eventsService.participate(id).subscribe();
  }

  viewParticipants(event: AlumniEvent): void {
    this.selectedEvent.set(event);
    this.isParticipantModalOpen.set(true);
    const id = event._id || event.id || '';
    this.eventsService.getParticipants(id).subscribe({
      next: (participants) => {
        this.currentParticipants.set(participants);
      },
    });
  }

  closeModal(): void {
    this.isParticipantModalOpen.set(false);
    this.selectedEvent.set(null);
  }
}

