"use client";

import apiFetch from './apiClient';

export interface ConversationSummary {
  _id: string;
  title?: string;
  listingTitle?: string;
  participants?: any[];
  lastMessage?: string | { text?: string };
  lastMessageAt?: string;
  unreadCount?: number;
  unreadForBuyer?: number;
  unreadForUser?: number;
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
  conversationId: string;
  text?: string;
  content?: string;
  senderId?: string;
  receiverId?: string;
  to?: string;
  type?: 'text' | 'image' | 'product' | 'offer';
  listingId?: string;
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
  delivered?: boolean;
  createdAt: string;
  updatedAt?: string;
  [key: string]: any;
}

export async function fetchConversations(): Promise<ConversationSummary[]> {
  try {
    const res: any = await apiFetch('/api/conversations', { suppressErrorLog: true });
    const payload = res?.data ?? res;
    if (Array.isArray(payload)) {
      return payload;
    }
    if (Array.isArray(payload?.conversations)) {
      return payload.conversations;
    }
    return [];
  } catch (error) {
    console.error('chatApi.fetchConversations failed:', error);
    return [];
  }
}

export async function fetchMessages(
  conversationId: string,
  limit = 50,
  before?: string
): Promise<ChatMessage[]> {
  try {
    const q = `?limit=${limit}${before ? `&before=${encodeURIComponent(before)}` : ''}`;
    const res: any = await apiFetch(`/api/conversations/${conversationId}/messages${q}`, {
      suppressErrorLog: true,
    });
    const payload = res?.data ?? res;
    if (Array.isArray(payload)) {
      return payload;
    }
    if (Array.isArray(payload?.data)) {
      return payload.data;
    }
    return [];
  } catch (error) {
    console.error('chatApi.fetchMessages failed:', error);
    return [];
  }
}

export async function createConversation(payload: Record<string, any>) {
  try {
    const res: any = await apiFetch('/api/conversations', {
      method: 'POST',
      body: payload,
      suppressErrorLog: true,
    });
    return res?.data ?? res;
  } catch (error) {
    console.error('chatApi.createConversation failed:', error);
    return {
      _id: `temp-${Date.now()}`,
      title: payload?.title || 'New Conversation',
      ...payload,
    };
  }
}

export async function sendMessage(payload: MessagePayload) {
  try {
    const body = {
      conversationId: payload.conversationId,
      text: payload.text || payload.content,
      senderId: payload.senderId,
      receiverId: payload.receiverId || payload.to,
      type: payload.type || 'text',
      listingId: payload.listingId,
    };

    const res: any = await apiFetch('/api/messages', {
      method: 'POST',
      body,
      suppressErrorLog: true,
    });
    return res?.data ?? res;
  } catch (error) {
    console.error('chatApi.sendMessage failed:', error);
    return {
      _id: `temp-${Date.now()}`,
      ...payload,
      content: payload.text || payload.content,
      createdAt: new Date().toISOString(),
      read: false,
      delivered: false,
    };
  }
}

export async function getConversation(conversationId: string) {
  try {
    const res: any = await apiFetch(`/api/conversations/${conversationId}`, {
      suppressErrorLog: true,
    });
    return res?.data ?? res;
  } catch (error) {
    console.error('chatApi.getConversation failed:', error);
    return null;
  }
}

export async function markAsRead(conversationId: string, userId: string) {
  try {
    const res: any = await apiFetch(`/api/messages/${conversationId}/read`, {
      method: 'PUT',
      body: { userId },
      suppressErrorLog: true,
    });
    return res?.success ?? false;
  } catch (error) {
    console.error('chatApi.markAsRead failed:', error);
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
