export interface EventParticipant {
  alumniId: string;
  alumniName: string;
  registeredAt?: string | Date;
}

export interface AlumniEvent {
  _id: string;
  id?: string;
  title: string;
  date: string;
  time?: string;
  location: string;
  posterUrl?: string;
  description: string;
  allowParticipation?: boolean;
  participants?: EventParticipant[];
  participantCount?: number;
  createdAt?: string | Date;
}

export interface CreateEventDto {
  title: string;
  date: string;
  time?: string;
  location: string;
  description: string;
  posterUrl?: string;
  allowParticipation?: boolean;
}
