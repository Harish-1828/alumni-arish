export interface FriendInvitation {
  _id?: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: string | Date;
  acceptedAt?: string | Date;
}

export interface AlumniFriend {
  id: string;
  name: string;
  batch?: string;
  department?: string;
  avatar?: string;
  online?: boolean;
}
