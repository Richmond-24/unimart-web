"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Send, Loader2, MessageCircle, AlertCircle } from "lucide-react";
import apiFetch from "../../../../lib/apiClient";
import { connectSocket } from "../../../../lib/socket";

interface Message {
  _id?: string;
  id?: string;
  sender?: string;
  senderId?: string;
  text: string;
  timestamp?: string | number;
  type?: string;
}

interface ConvData {
  _id: string;
  buyer?: { name: string; _id?: string; id?: string; email?: string };
  productName?: string;
  productImage?: string;
  price?: number;
  lastMessage?: { text: string; timestamp: string };
  unreadCount?: number;
  unreadForSeller?: number;
}

// Component that actually uses useSearchParams
function MessagesContent() {
  const searchParams = useSearchParams();
  const selectedConvId = searchParams.get("convId");

  const [conversations, setConversations] = useState<ConvData[]>([]);
  const [selectedConv, setSelectedConv] = useState<ConvData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<any>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let mounted = true;

    const loadConversations = async () => {
      try {
        setLoading(true);
        const res = await apiFetch("/messages/seller/conversations");
        if (!mounted) return;

        const convs = res?.conversations || [];
        setConversations(convs);

        if (selectedConvId) {
          const found = convs.find((c: any) => c._id === selectedConvId);
          if (found) {
            setSelectedConv(found);
          }
        } else if (convs.length > 0) {
          setSelectedConv(convs[0]);
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
        if (mounted) setError("Failed to load conversations");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadConversations();
    return () => {
      mounted = false;
    };
  }, [selectedConvId]);

  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    const handleConnect = () => {
      setConnected(true);
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    const handleSellerNewMessage = (data: any) => {
      (async () => {
        try {
          const res = await apiFetch("/messages/seller/conversations");
          const convs = res?.conversations || [];
          setConversations(convs);

          if (selectedConv && data.conversationId === selectedConv._id) {
            const newMessage = data.message || {
              _id: `msg-${Date.now()}`,
              sender: data.from === "buyer" ? selectedConv.buyer?._id : "seller",
              text: data.message?.text || "New message",
              timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, newMessage]);
            scrollToBottom();
          }
        } catch (err) {
          console.error("Failed to update conversations:", err);
        }
      })();
    };

    if (socket) {
      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);
      socket.on("seller:new_message", handleSellerNewMessage);
    }

    return () => {
      if (socket) {
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
        socket.off("seller:new_message", handleSellerNewMessage);
      }
    };
  }, [selectedConv?._id, selectedConv?.buyer?._id]);

  useEffect(() => {
    if (!selectedConv?._id) return;

    let mounted = true;

    const loadMessages = async () => {
      try {
        setMessagesLoading(true);
        const res = await apiFetch(
          `/messages/seller/conversations/${selectedConv._id}?limit=100`
        );
        if (!mounted) return;

        const msgs = (res?.messages || []).reverse();
        setMessages(msgs);
      } catch (err) {
        console.error("Failed to load messages:", err);
        if (mounted) setError("Failed to load messages");
      } finally {
        if (mounted) setMessagesLoading(false);
      }
    };

    loadMessages();
    return () => {
      mounted = false;
    };
  }, [selectedConv?._id]);

  const handleSelectConversation = (conv: ConvData) => {
    setSelectedConv(conv);
    setMessages([]);
    setInput("");
    setError(null);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedConv?._id || sending) return;

    const text = input.trim();
    setInput("");
    setSending(true);

    try {
      const res = await apiFetch("/messages", {
        method: "POST",
        body: {
          conversationId: selectedConv._id,
          text,
          type: "text",
        },
      });

      if (!res?.success) {
        throw new Error(res?.message || "Failed to send message");
      }

      const newMessage = res.message || {
        _id: `msg-${Date.now()}`,
        sender: "seller",
        text,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMessage]);
      scrollToBottom();
    } catch (err) {
      console.error("Send message error:", err);
      setError("Failed to send message. Please try again.");
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96"></div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <MessageCircle className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-500">No messages yet</p>
        <p className="text-sm text-gray-400">Buyers will message you here</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4 bg-white rounded-lg shadow">
      <div className="w-80 border-r overflow-y-auto flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Messages ({conversations.length})</h2>
          <p className="text-xs text-gray-500 mt-1">
            {conversations.reduce((sum, c) => sum + (c.unreadForSeller || 0), 0)} unread
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv._id}
              onClick={() => handleSelectConversation(conv)}
              className={`w-full text-left p-3 border-b hover:bg-gray-50 transition-colors ${
                selectedConv?._id === conv._id ? "bg-teal-50 border-l-4 border-l-teal-600" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 line-clamp-1">
                    {conv.buyer?.name || "Unknown Buyer"}
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-1">
                    {conv.productName || "No product"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {conv.lastMessage?.text || "No messages yet"}
                  </p>
                </div>
                {(conv.unreadForSeller || 0) > 0 && (
                  <div className="flex-shrink-0 px-2 py-1 bg-teal-600 text-white text-xs font-semibold rounded-full">
                    {conv.unreadForSeller}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedConv ? (
        <div className="flex-1 flex flex-col">
          <div className="border-b p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                {selectedConv.buyer?.name || "Buyer"}
              </h3>
              <p className="text-xs text-gray-500">{selectedConv.productName}</p>
              {selectedConv.price && (
                <p className="text-xs font-medium text-teal-600 mt-1">
                  ₵{selectedConv.price.toFixed(2)}
                </p>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {connected ? "🟢 Online" : "⚪ Offline"}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messagesLoading ? (
              <div className="flex justify-center items-center h-full"></div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <MessageCircle className="w-8 h-8 mb-2" />
                <p className="text-sm">No messages yet</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMine =
                  msg.sender === "seller" ||
                  msg.senderId === "seller" ||
                  (!msg.sender && !msg.senderId);
                return (
                  <div
                    key={msg._id || msg.id || idx}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2.5 rounded-lg ${
                        isMine
                          ? "bg-teal-600 text-white rounded-br-none"
                          : "bg-white border border-gray-200 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      <p className="break-words text-sm">{msg.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isMine ? "text-teal-100" : "text-gray-500"
                        }`}
                      >
                        {msg.timestamp
                          ? new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-200">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}

          <div className="border-t bg-white p-4 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your reply..."
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-sm"
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending || !connected}
              className="px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <p>Select a conversation to view messages</p>
        </div>
      )}
    </div>
  );
}

// Main export with Suspense wrapper
export default function MessagesClient() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-96">Loading messages...</div>}>
      <MessagesContent />
    </Suspense>
  );
}