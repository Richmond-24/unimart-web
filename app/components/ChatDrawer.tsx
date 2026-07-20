"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import chatApi, { ConversationSummary } from '../../lib/chatApi';
import SocketChat from './SocketChat';

interface ChatDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChatDrawer({ isOpen, onClose }: ChatDrawerProps) {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeChat, setActiveChat] = useState<ConversationSummary | null>(null);

    // Load conversations when drawer opens
    useEffect(() => {
        if (isOpen && !activeChat && user) {
            setLoading(true);
            chatApi.fetchConversations()
                .then(res => setConversations(res))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [isOpen, activeChat, user]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9000]"
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[9001] shadow-2xl flex flex-col pt-[env(safe-area-inset-top)]"
                    >
                        {/* Header */}
                        {!activeChat && (
                            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-800 text-white shrink-0 shadow-sm z-10">
                                <div className="flex items-center gap-3">
                                    <h2 className="font-bold text-lg leading-tight">Messages</h2>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition active:scale-95">
                                        <X size={20} className="opacity-90" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Content Area */}
                        <div className="flex-1 overflow-hidden relative bg-gray-50/50">
                            {activeChat ? (
                                <div className="absolute inset-0 pb-[env(safe-area-inset-bottom)]">
                                    <SocketChat
                                        listingId={activeChat.listingId || ''}
                                        sellerId={activeChat.sellerId || ''}
                                        listingTitle={activeChat.listingTitle || activeChat.title || 'Chat'}
                                        onClose={() => setActiveChat(null)}
                                    />
                                </div>
                            ) : (
                                <div className="h-full overflow-y-auto pb-[calc(1rem+env(safe-area-inset-bottom))]">
                                    {!user ? (
                                        <div className="flex flex-col items-center justify-center p-8 text-gray-500 h-full">
                                            <MessageCircle className="w-16 h-16 mb-4 text-teal-200" />
                                            <p className="font-medium text-slate-600">Sign in to see your messages</p>
                                        </div>
                                    ) : loading ? (
                                        <div className="flex justify-center p-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                                        </div>
                                    ) : conversations.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center p-8 text-gray-500 h-full">
                                            <MessageCircle className="w-16 h-16 mb-4 text-teal-100" />
                                            <p className="font-medium text-slate-500">No conversations yet</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-100 bg-white shadow-sm border-y border-gray-100 mt-2">
                                            {conversations.map((c, i) => {
                                                const title = c.listingTitle || c.title || 'Conversation';
                                                const lastMsg = typeof c.lastMessage === 'object' ? c.lastMessage?.text : c.lastMessage;
                                                const unread = c.unreadCount || c.unreadForBuyer || 0;
                                                const sellerName = c.sellerName || null;

                                                return (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.04 }}
                                                        key={c._id}
                                                        onClick={() => setActiveChat(c)}
                                                        className="flex items-center gap-4 px-4 py-3.5 hover:bg-teal-50/50 active:bg-teal-100/50 cursor-pointer transition relative"
                                                    >
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center text-teal-700 font-bold shrink-0 shadow-inner text-lg">
                                                            {title.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0 pr-6">
                                                            <h3 className="font-semibold text-slate-800 truncate leading-snug">{title}</h3>
                                                            {sellerName && (
                                                                <p className="text-xs font-medium text-teal-700 truncate">{sellerName}</p>
                                                            )}
                                                            <p className={`text-sm truncate mt-0.5 ${unread > 0 ? "text-slate-800 font-medium" : "text-slate-500"}`}>
                                                                {lastMsg || 'Tap to chat'}
                                                            </p>
                                                        </div>
                                                        {unread > 0 && (
                                                            <div className="absolute right-4 w-5 h-5 rounded-full bg-teal-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-md transform scale-110">
                                                                {unread}
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
