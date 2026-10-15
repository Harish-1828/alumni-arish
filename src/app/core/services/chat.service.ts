import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { ChatContact, ChatMessage } from '../models/chat.model';

const FALLBACK_CONTACTS: ChatContact[] = [
  { id: 'f001', name: 'Vignesh Kathirmani', department: 'CSE 2024', lastMessage: 'See you at the silver jubilee reunion!', lastMessageTime: '10:30 AM', online: true },
  { id: 'f002', name: 'Priya Sundaram', department: 'ECE 2020', lastMessage: 'Thank you for the referral!', lastMessageTime: 'Yesterday', online: false },
  { id: 'f003', name: 'Karthik Ramasamy', department: 'MECH 2016', lastMessage: 'Contributed to the robotics endowment.', lastMessageTime: 'Oct 12', online: true },
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  f001: [
    { senderId: 'f001', senderName: 'Vignesh Kathirmani', receiverId: 'me', message: 'Hey! Are you attending the upcoming Alumni Meet?', timestamp: new Date(Date.now() - 3600000 * 2) },
    { senderId: 'me', senderName: 'Me', receiverId: 'f001', message: 'Yes absolutely! Registered through the new portal.', timestamp: new Date(Date.now() - 3600000) },
    { senderId: 'f001', senderName: 'Vignesh Kathirmani', receiverId: 'me', message: 'See you at the silver jubilee reunion!', timestamp: new Date() },
  ],
};

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  readonly contacts = signal<ChatContact[]>(FALLBACK_CONTACTS);
  readonly activeContact = signal<ChatContact | null>(FALLBACK_CONTACTS[0]);
  readonly messages = signal<ChatMessage[]>(INITIAL_MESSAGES['f001'] || []);

  selectContact(contact: ChatContact): void {
    this.activeContact.set(contact);
    this.messages.set(INITIAL_MESSAGES[contact.id] || []);
  }

  sendMessage(text: string): void {
    const contact = this.activeContact();
    if (!contact || !text.trim()) return;

    const newMsg: ChatMessage = {
      senderId: 'me',
      senderName: this.auth.currentUser()?.name || 'Me',
      receiverId: contact.id,
      message: text.trim(),
      timestamp: new Date(),
    };

    this.messages.update((msgs) => [...msgs, newMsg]);

    if (!INITIAL_MESSAGES[contact.id]) {
      INITIAL_MESSAGES[contact.id] = [];
    }
    INITIAL_MESSAGES[contact.id].push(newMsg);
  }
}
