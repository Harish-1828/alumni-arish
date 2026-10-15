import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../../core/services/chat.service';
import { ChatContact } from '../../../../core/models/chat.model';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-page.component.html',
  styleUrl: './chat-page.component.css',
})
export class ChatPageComponent {
  readonly chatService = inject(ChatService);

  readonly contacts = this.chatService.contacts;
  readonly activeContact = this.chatService.activeContact;
  readonly messages = this.chatService.messages;

  readonly messageInput = signal<string>('');

  selectContact(contact: ChatContact): void {
    this.chatService.selectContact(contact);
  }

  send(): void {
    const text = this.messageInput();
    if (text.trim()) {
      this.chatService.sendMessage(text);
      this.messageInput.set('');
    }
  }
}

