export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  message: string;
  timestamp: string | Date;
  read?: boolean;
}

export interface ChatContact {
  id: string;
  name: string;
  department?: string;
  lastMessage?: string;
  lastMessageTime?: string | Date;
  unreadCount?: number;
  online?: boolean;
}
