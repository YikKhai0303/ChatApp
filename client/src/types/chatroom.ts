// src/types/chatroom.ts
export interface Chatroom {
  id: string;
  name: string;
  description?: string;
  createdAt?: any;
  createdBy: string;
  lastMessageTime?: any;
}
