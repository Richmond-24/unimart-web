// lib/chatApi.ts

"use client";

import apiFetch from './apiClient';

export interface ConversationSummary {
  _id: string;
  title?: string;
  listingTitle?: string;
  participants?: any[];
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  updatedAt?: string;
  sellerId?: string;
  sellerName?: string;
  buyerId?: string;
  buyerName?: string;
  listingId?: string;
  listingPrice?: number;
  status?: string;
}

export interface MessagePayload {
  conversationId?: string;
  to?: string;
  receiverId?: string;
  senderId?: string;
  text: string;
  content?: string;
  attachments?: any[];
  type?: 'text' | 'image' | 'product' | 'offer';
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  text?: string;
  type?: 'text' | 'image' | 'product' | 'offer';
  read: boolean;
  delivered: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function fetchConversations(): Promise<ConversationSummary[]> {
  try {
    const res: any = await apiFetch('/api/conversations', { suppressErrorLog: true });
    return (res && (Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []))) || [];
  } catch (error) {
    console.log('Failed to fetch conversations, using fallback');
    return [];
  }
}

export async function fetchMessages(conversationId: string, limit = 50, before?: string): Promise<ChatMessage[]> {
  try {
    const q = `?limit=${limit}${before ? `&before=${encodeURIComponent(before)}` : ''}`;
    const res: any = await apiFetch(`/api/conversations/${conversationId}/messages${q}`, { suppressErrorLog: true });
    return (res && (Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []))) || [];
  } catch (error) {
    console.log('Failed to fetch messages, using fallback');
    return [];
  }
}

export async function createConversation(data: { listingId?: string; participantId?: string; title?: string }) {
  try {
    const res: any = await apiFetch('/api/conversations', { 
      method: 'POST', 
      body: data,
      suppressErrorLog: true 
    });
    return res?.data || res;
  } catch (error) {
    console.error('Failed to create conversation:', error);
    // Return a fallback conversation object
    return {
      _id: `temp-${Date.now()}`,
      title: data.title || 'New Conversation',
      ...data
    };
  }
}

export async function sendMessage(payload: MessagePayload) {
  try {
    // Ensure the payload has the correct structure
    const body = {
      conversationId: payload.conversationId,
      text: payload.text || payload.content,
      senderId: payload.senderId,
      receiverId: payload.receiverId || payload.to,
      type: payload.type || 'text',
    };

    const res: any = await apiFetch('/api/messages', { 
      method: 'POST', 
      body,
      suppressErrorLog: true 
    });
    return res?.data || res;
  } catch (error) {
    console.error('Failed to send message:', error);
    // Return the payload as a fallback so the UI still shows the message
    return {
      _id: `temp-${Date.now()}`,
      ...payload,
      content: payload.text || payload.content,
      createdAt: new Date().toISOString(),
      read: false,
      delivered: false
    };
  }
}

// Get a specific conversation by ID
export async function getConversation(conversationId: string) {
  try {
    const res: any = await apiFetch(`/api/conversations/${conversationId}`, { suppressErrorLog: true });
    return res?.data || res;
  } catch (error) {
    console.error('Failed to get conversation:', error);
    return null;
  }
}

// Mark messages as read
export async function markAsRead(conversationId: string, userId: string) {
  try {
    const res: any = await apiFetch(`/api/messages/${conversationId}/read`, {
      method: 'PUT',
      body: { userId },
      suppressErrorLog: true
    });
    return res?.success || false;
  } catch (error) {
    console.error('Failed to mark messages as read:', error);
    return false;
  }
}

export default {
  fetchConversations,
  fetchMessages,
  createConversation,
  sendMessage,
  getConversation,
  markAsRead,
};