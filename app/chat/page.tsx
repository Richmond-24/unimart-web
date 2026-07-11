"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import chatApi from '../../lib/chatApi';
import { connectSocket, getSocket, disconnectSocket } from '../../lib/socket';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ChatPage({ params }: any) {
  const router = useRouter();
  const idParam = useParams();
  const { user } = useAuth();
  const conversationId = (params && params.id) || (idParam && idParam.id) || null;
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  // Load conversations and messages
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!user?._id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Load conversations using fetchConversations
        console.log('📡 Loading conversations for user:', user._id);
        const list = await chatApi.fetchConversations();
        
        if (!mounted) return;
        
        if (list && list.length > 0) {
          setConversations(list);
        } else {
          setConversations([]);
        }

        // Load messages for specific conversation using fetchMessages
        if (conversationId) {
          console.log('📡 Loading messages for conversation:', conversationId);
          const msgs = await chatApi.fetchMessages(conversationId, 50);
          if (msgs && msgs.length > 0) {
            setMessages(msgs);
            try {
              const socket = getSocket();
              if (socket && socket.emit) socket.emit('messages_read', { conversationId });
            } catch (e) {
              // ignore
            }
          } else {
            // Try direct fetch
            try {
              const res = await fetch(`/api/conversations/${conversationId}/messages?limit=50`);
              const data = await res.json();
              if (data?.success && data.data) {
                setMessages(data.data);
              }
            } catch (e) {
              setMessages([]);
            }
          }
        }
      } catch (error: any) {
        console.error('Chat init failed:', error);
        setError('Failed to load conversations');
        // Use fallback data
        if (conversationId) {
          setConversations([{
            _id: conversationId,
            title: 'Conversation',
            lastMessage: 'No messages yet'
          }]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [user, conversationId]);

  // Socket connection for real-time messages
  useEffect(() => {
    if (!user?._id) return;

    const token = localStorage.getItem('unimart:token');
    const socket = connectSocket(token);
    socketRef.current = socket;

    if (!socket) return;

    // Server auto-joins user room on authentication. Join conversation room when available.

    // Handle new message
    const handleNewMessage = (payload: any) => {
      if (!payload) return;
      
      console.log('📩 New message received:', payload);
      
      // Update messages if in the current conversation
      if (payload.conversationId === conversationId) {
        setMessages((prev) => [...prev, payload]);
      }
      
      // Update conversation list
      setConversations((prev) => {
        const existing = prev.find(c => c._id === payload.conversationId);
        if (existing) {
          return prev.map(c => 
            c._id === payload.conversationId 
              ? { ...c, lastMessage: payload.text || payload.message, lastMessageAt: new Date().toISOString() }
              : c
          );
        }
        return prev;
      });
    };

    const handleMessagesRead = (payload: any) => {
      if (!payload) return;
      if (payload.conversationId !== conversationId) return;
      const readerId = payload.userId;
      // Mark messages sent by the reader as read for current view
      setMessages((prev) => prev.map(m => {
        if (!m) return m;
        // If the reader is the other participant and this message was sent by current user, mark read
        if (readerId && m.senderId === (user?._id || user?.id) && readerId !== (user?._id || user?.id)) {
          return { ...m, read: true };
        }
        return m;
      }));
    };

    // Register event listeners
    socket.on('new_message', handleNewMessage);
    socket.on('message:new', handleNewMessage);
    socket.on('messages_read', handleMessagesRead);

    return () => {
      try {
        if (socket) {
          socket.off('new_message', handleNewMessage);
          socket.off('message:new', handleNewMessage);
          socket.off('messages_read', handleMessagesRead);
        }
      } catch (e) {
        console.warn('Error cleaning up socket listeners:', e);
      }
    };
  }, [user, conversationId]);

  // When a specific conversation is opened, join its room so we receive real-time messages
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !conversationId) return;
    try {
      socket.emit('join_conversation', { conversationId });
    } catch (e) {
      console.warn('Failed to join conversation via socket:', e);
    }

    return () => {
      try {
        socket.emit('leave_conversation', { conversationId });
      } catch (e) {
        // ignore
      }
    };
  }, [conversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSend = async () => {
    if (!text.trim() || !conversationId || !user) return;

    setSending(true);
    const content = text.trim();
    setText('');

    // Optimistic update
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      conversationId: conversationId,
      senderId: user._id,
      content: content,
      text: content,
      createdAt: new Date().toISOString(),
      read: false,
      delivered: false
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const receiverId = conversations.find(c => c._id === conversationId)?.sellerId || '';
      
      const payload = {
        conversationId: conversationId,
        text: content,  // ✅ Using 'text' as required by MessagePayload
        content: content,
        senderId: user._id,
        receiverId: receiverId,
        to: receiverId,
      };

      console.log('📤 Sending message:', payload);
      
      const sent = await chatApi.sendMessage(payload);
      
      if (sent && sent._id) {
        // Replace temp message with real one
        setMessages((prev) => 
          prev.map(m => 
            m._id === tempMessage._id ? sent : m
          )
        );
      } else {
        // Try direct fetch
        try {
          const res = await fetch('/api/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              conversationId: conversationId,
                text: content,
              senderId: user._id,
              receiverId: receiverId,
            })
          });
          const data = await res.json();
          if (data?.success && data.data) {
            setMessages((prev) => 
              prev.map(m => 
                m._id === tempMessage._id ? data.data : m
              )
            );
          }
        } catch (e) {
          // Keep temp message if API fails
          console.log('Using temp message');
        }
      }

      // Do not emit duplicate socket send. Server REST handler will persist and emit 'new_message'.

    } catch (error: any) {
      console.error('Send failed:', error);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 172800000) return 'Yesterday';
    return date.toLocaleDateString();
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-4">
        {/* Conversations Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Conversations</h2>
            {error && (
              <div className="text-sm text-red-500 mb-3">{error}</div>
            )}
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No conversations yet</p>
                  <Link href="/" className="text-xs text-teal-600 hover:underline">
                    Browse products to start chatting
                  </Link>
                </div>
              ) : (
                conversations.map((c: any) => (
                  <div
                    key={c._id}
                    onClick={() => router.push(`/chat/${c._id}`)}
                    className={`p-3 rounded-lg cursor-pointer transition ${
                      c._id === conversationId ? 'bg-teal-50 border border-teal-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-sm truncate text-gray-900">
                      {c.listingTitle || c.title || 'Conversation'}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {c.lastMessage || c.lastMessage?.text || 'No messages yet'}
                    </div>
                    {c.unreadCount > 0 && (
                      <span className="inline-block mt-1 bg-teal-600 text-white text-xs font-semibold rounded-full px-2 py-0.5">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[70vh]">
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {conversations.find(c => c._id === conversationId)?.listingTitle || 
                   conversations.find(c => c._id === conversationId)?.title || 
                   'Chat'}
                </h3>
                <p className="text-xs text-gray-500">
                  {conversations.find(c => c._id === conversationId)?.sellerName || 'Unknown seller'}
                </p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="text-sm text-teal-600 hover:text-teal-700"
              >
                Browse Products
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs">Start the conversation!</p>
                </div>
              ) : (
                messages.map((m: any, i: number) => {
                  const isOwn = m.senderId === user?._id || m.from === 'me';
                  return (
                    <div
                      key={m._id || i}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isOwn
                            ? 'bg-teal-600 text-white rounded-br-none'
                            : 'bg-gray-100 text-gray-900 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm break-words">{m.content || m.text || m.message || ''}</p>
                        <div className={`text-xs mt-1 ${isOwn ? 'text-teal-100' : 'text-gray-400'}`}>
                          {formatTime(m.createdAt || m.timestamp || Date.now())}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  disabled={sending}
                />
                <button
                  onClick={handleSend}
                  disabled={!text.trim() || sending}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}