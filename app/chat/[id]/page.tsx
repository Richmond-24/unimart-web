"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, MessageCircle, CheckCheck } from 'lucide-react';
import { apiFetch } from '../../../lib/apiClient';
import { connectSocket, getSocket } from '../../../lib/socket';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

interface ChatMessage {
    _id: string;
    sender?: string | { _id?: string; name?: string };
    senderId?: string;
    text?: string;
    content?: string;
    createdAt?: string;
    timestamp?: string;
    read?: boolean;
    delivered?: boolean;
}

export default function ChatConversationPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();

    // ✅ FIX: conversationId comes from the dynamic [id] segment
    const conversationId = params?.id as string | null;

    const [conversations, setConversations] = useState<any[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [text, setText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [connected, setConnected] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isSendingRef = useRef(false);
    const pendingTextRef = useRef<string | null>(null);

    const currentUserId = user?._id || user?.id;

    const scrollToBottom = useCallback(() => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }, []);

    useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

    // Load sidebar conversations
    useEffect(() => {
        if (!currentUserId) return;
        let m = true;
        (async () => {
            try {
                setLoading(true);
                const res = await apiFetch('/conversations', { suppressErrorLog: true } as any);
                const list = res?.conversations || res?.data || (Array.isArray(res) ? res : []);
                if (m) setConversations(Array.isArray(list) ? list : []);
            } catch {
                if (m) setConversations([]);
            } finally {
                if (m) setLoading(false);
            }
        })();
        return () => { m = false; };
    }, [currentUserId]);

    // Load messages for selected conversation
    useEffect(() => {
        if (!conversationId) return;
        let m = true;
        (async () => {
            try {
                setLoadingMessages(true);
                setError(null);
                const res = await apiFetch(`/conversations/${conversationId}/messages?limit=100`, { suppressErrorLog: true } as any);
                // ✅ FIX: handle various response shapes
                const msgs = res?.data || res?.messages || (Array.isArray(res) ? res : []);
                if (m) setMessages(Array.isArray(msgs) ? msgs : []);
            } catch {
                if (m) setMessages([]);
            } finally {
                if (m) setLoadingMessages(false);
            }
        })();
        return () => { m = false; };
    }, [conversationId]);

    // Socket real-time
    useEffect(() => {
        if (!conversationId) return;

        const socket = connectSocket();
        if (!socket) return;

        const onConnect = () => {
            setConnected(true);
            socket.emit('join_conversation', { conversationId });
        };
        const onDisconnect = () => setConnected(false);
        const onNewMsg = (msg: any) => {
            if (msg?.conversationId && msg.conversationId !== conversationId) return;

            const incomingText = msg?.text || msg?.content || '';
            const incomingSender = String(msg?.sender?._id || msg?.sender || msg?.senderId || '');
            // Ignore echo of our own pending message (already shown optimistically)
            const isOwnEcho = Boolean(
                currentUserId &&
                pendingTextRef.current !== null &&
                incomingSender === String(currentUserId) &&
                incomingText.trim() === pendingTextRef.current.trim()
            );
            if (isOwnEcho) return;

            setMessages((prev) => {
                if (prev.some((m) => m._id === msg._id)) return prev;
                return [...prev, msg];
            });
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('new_message', onNewMsg);
        socket.on('message:new', onNewMsg);

        if (socket.connected) {
            setConnected(true);
            socket.emit('join_conversation', { conversationId });
        }

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('new_message', onNewMsg);
            socket.off('message:new', onNewMsg);
            try { socket.emit('leave_conversation', { conversationId }); } catch { /* ignore */ }
        };
    }, [conversationId, currentUserId]);

    // Send message
    const handleSend = async () => {
        const content = text.trim();
        if (!content || isSendingRef.current || !conversationId || !currentUserId) return;

        isSendingRef.current = true;
        setSending(true);
        setError(null);
        pendingTextRef.current = content;

        const tempId = `temp-${Date.now()}`;
        const optimistic: ChatMessage = {
            _id: tempId,
            senderId: currentUserId,
            text: content,
            createdAt: new Date().toISOString(),
            read: false,
            delivered: false,
        };
        setText('');
        setMessages((prev) => [...prev, optimistic]);
        scrollToBottom();

        try {
            const res = await apiFetch('/messages', {
                method: 'POST',
                body: { conversationId, text: content, type: 'text' },
            } as any);

            // ✅ FIX: Accept saved message from res.message, res.data, or res directly
            const saved = res?.message || res?.data || (res?._id ? res : null);
            if (saved?._id) {
                setMessages((prev) =>
                    prev.map((m) =>
                        m._id === tempId
                            ? { ...saved, text: saved.text || saved.content || content }
                            : m
                    )
                );
            }
            // Otherwise keep optimistic — socket will deliver the persisted copy
        } catch (err: any) {
            // Remove optimistic if request failed entirely
            setMessages((prev) => prev.filter((m) => m._id !== tempId));
            setText(content);
            setError(err?.message || 'Failed to send message');
        } finally {
            pendingTextRef.current = null;
            isSendingRef.current = false;
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (ts?: string) => {
        if (!ts) return '';
        const d = new Date(ts);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 172800000) return 'Yesterday';
        return d.toLocaleDateString();
    };

    const activeConv = conversations.find((c) => c._id === conversationId);

    if (loading && conversations.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <LoadingSpinner size={40} />
            </div>
        );
    }

    if (!currentUserId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white">
                <MessageCircle className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-600 mb-4">Please sign in to view your messages</p>
                <Link href="/login" className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                    Sign In
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto flex h-screen">
                {/* ── CONVERSATIONS SIDEBAR ── */}
                <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
                    <div className="px-4 py-4 border-b border-gray-200 flex items-center gap-3">
                        <button
                            onClick={() => router.push('/')}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Back to home"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-400 px-4">
                                <MessageCircle className="w-8 h-8 mb-2" />
                                <p className="text-sm text-center">No conversations yet.</p>
                                <Link href="/" className="text-xs text-teal-600 hover:underline mt-1">
                                    Browse products to start chatting
                                </Link>
                            </div>
                        ) : (
                            conversations.map((c: any) => (
                                <div
                                    key={c._id}
                                    onClick={() => router.push(`/chat/${c._id}`)}
                                    className={`px-4 py-3 cursor-pointer border-b border-gray-100 transition-colors ${c._id === conversationId
                                            ? 'bg-teal-50 border-l-4 border-l-teal-500'
                                            : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm text-gray-900 truncate">
                                                {c.listingTitle || c.title || 'Conversation'}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate mt-0.5">
                                                {typeof c.lastMessage === 'object'
                                                    ? c.lastMessage?.text
                                                    : c.lastMessage || 'No messages yet'}
                                            </p>
                                        </div>
                                        {(c.unreadCount || c.unreadForBuyer || 0) > 0 && (
                                            <span className="flex-shrink-0 mt-0.5 w-5 h-5 bg-teal-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                                {c.unreadCount || c.unreadForBuyer}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {c.sellerName || 'Seller'}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ── CHAT AREA ── */}
                <div className="flex-1 flex flex-col bg-[#f3f4f6]">
                    {!conversationId ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <MessageCircle className="w-16 h-16 mb-4 text-gray-200" />
                            <p className="text-lg font-medium text-gray-500">Select a conversation</p>
                            <p className="text-sm mt-1">Choose a conversation from the sidebar to start messaging</p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm flex-shrink-0">
                                        {(activeConv?.listingTitle || activeConv?.title || 'C').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-sm">
                                            {activeConv?.listingTitle || activeConv?.title || 'Conversation'}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300'}`} />
                                            <span>{connected ? 'Connected' : 'Reconnecting...'}</span>
                                            {activeConv?.sellerName && (
                                                <>
                                                    <span className="text-gray-300">·</span>
                                                    <span>{activeConv.sellerName}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                                {loadingMessages ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                        <MessageCircle className="w-10 h-10 mb-3 text-gray-200" />
                                        <p className="text-sm font-medium">No messages yet</p>
                                        <p className="text-xs mt-1">Start the conversation!</p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const senderObj = typeof msg.sender === 'object' ? msg.sender : null;
                                        const sender = String(senderObj?._id || msg.sender || msg.senderId || '');
                                        const isMine = sender === String(currentUserId);

                                        const thisDate = new Date(msg.createdAt || msg.timestamp || '').toDateString();
                                        const prevDate = idx > 0
                                            ? new Date(messages[idx - 1]?.createdAt || messages[idx - 1]?.timestamp || '').toDateString()
                                            : null;
                                        const showDate = idx === 0 || thisDate !== prevDate;

                                        return (
                                            <React.Fragment key={msg._id || idx}>
                                                {showDate && (msg.createdAt || msg.timestamp) && (
                                                    <div className="flex justify-center my-3">
                                                        <span className="px-3 py-1 text-[11px] font-medium bg-gray-200/80 text-gray-500 rounded-full">
                                                            {new Date(msg.createdAt || msg.timestamp || '').toLocaleDateString(undefined, {
                                                                weekday: 'short', month: 'short', day: 'numeric',
                                                            })}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                    <div
                                                        className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl ${isMine
                                                                ? 'bg-teal-600 text-white rounded-br-md'
                                                                : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
                                                            }`}
                                                    >
                                                        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                                                            {msg.text || msg.content || ''}
                                                        </p>
                                                        <div className={`flex items-center gap-1.5 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                            <span className={`text-[10px] ${isMine ? 'text-teal-100' : 'text-gray-400'}`}>
                                                                {formatTime(msg.createdAt || msg.timestamp)}
                                                            </span>
                                                            {isMine && (
                                                                <CheckCheck
                                                                    className={`w-3.5 h-3.5 ${msg.read ? 'text-blue-300' : 'text-teal-200'}`}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </React.Fragment>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Bar */}
                            <div className="bg-white border-t border-gray-200 px-4 py-3">
                                {error && (
                                    <div className="mb-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                                        <p className="text-xs text-red-600">{error}</p>
                                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-xs ml-2">
                                            Dismiss
                                        </button>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 bg-gray-50 rounded-2xl border border-gray-200 px-4 py-1.5">
                                    <input
                                        type="text"
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-gray-400"
                                        disabled={sending}
                                        autoFocus
                                    />
                                    <button
                                        id="chat-send-btn"
                                        onClick={handleSend}
                                        disabled={!text.trim() || sending}
                                        className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-teal-700 transition-colors flex-shrink-0"
                                        aria-label="Send message"
                                    >
                                        {sending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
