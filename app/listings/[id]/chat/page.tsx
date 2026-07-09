"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Send, AlertCircle, Loader2 } from "lucide-react";
import apiFetch from "../../../../lib/apiClient";
import { connectSocket, getSocket } from "../../../../lib/socket";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { useAuth } from "../../../context/AuthContext";

interface Message {
  _id?: string;
  id?: string;
  sender?: string;
  senderId?: string;
  senderName?: string;
  text: string;
  timestamp?: string | number;
  type?: string;
  read?: boolean;
}

interface ChatParticipant {
  _id: string;
  id: string;
  name: string;
  photoURL?: string;
  email?: string;
}

export default function BuyerChatPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const id = params?.id;

  const [listing, setListing] = useState<any>(null);
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const [sellerInfo, setSellerInfo] = useState<ChatParticipant | null>(null);
  const [isWaitingForReply, setIsWaitingForReply] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<any>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load listing details
  useEffect(() => {
    let mounted = true;
    if (!id) return;

    setLoading(true);
    (async () => {
      try {
        const res = await apiFetch(`/public/listings/${id}`);
        if (!mounted) return;
        setListing(res?.data || res || null);
      } catch (err) {
        console.error("Failed to load product for chat", err);
        if (mounted) setError("Unable to load product details. Please try again.");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  // Create or get conversation
  useEffect(() => {
    if (!id || !listing || !isAuthenticated) {
      if (!isAuthenticated) {
        setError("Please sign in to chat with the seller.");
      }
      return;
    }

    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const payload: any = {
          productId: id,
        };

        // Get seller ID from listing
        const sellerId =
          listing.sellerId ||
          listing.sellerUserId ||
          listing.sellerUid ||
          listing.userId ||
          (typeof listing.seller === "object" ? listing.seller._id || listing.seller.id : listing.seller);

        if (sellerId) {
          payload.sellerId = sellerId;
        } else if (listing.sellerEmail) {
          payload.sellerEmail = listing.sellerEmail;
        } else {
          throw new Error("Cannot determine seller");
        }

        const res = await apiFetch("/conversations", {
          method: "POST",
          body: payload,
        });

        const conv = res?.conversation || res?.data?.conversation || res?.data || res;
        if (!conv || !conv._id) throw new Error("Invalid conversation");

        if (mounted) {
          setConversation(conv);
          // Extract seller info
          const sInfo = conv.seller || {
            _id: payload.sellerId,
            name: listing.sellerName || "Seller",
            photoURL: listing.sellerPhotoURL || listing.photoURL,
          };
          setSellerInfo(sInfo);
        }
      } catch (err) {
        console.error("Unable to start chat session", err);
        if (mounted) setError("Could not start chat with the seller. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, listing, isAuthenticated]);

  // Load messages and setup socket
  useEffect(() => {
    if (!conversation?._id || !isAuthenticated) return;

    const conversationId = conversation._id;
    let mounted = true;

    // Load initial messages
    (async () => {
      try {
        const res = await apiFetch(`/conversations/${conversationId}/messages?limit=100`);
        const msgs = (res?.data || res?.messages || []).reverse();
        if (mounted) {
          setMessages(msgs);
          // Check if seller has replied
          const hasSellerMessage = msgs.some(
            (m: any) => m.sender !== user?.id && m.senderId !== user?.id
          );
          setIsWaitingForReply(!hasSellerMessage);
        }
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    })();

    // Setup Socket.IO
    const socket = connectSocket();
    socketRef.current = socket;

    const handleConnect = () => {
      setConnected(true);
      if (socket) {
        socket.emit("join_conversation", { conversationId });
      }
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    const handleNewMessage = (msg: any) => {
      if (!msg || !msg.text || String(msg.conversationId || msg.conversationID) !== String(conversationId))
        return;

      if (mounted) {
        setMessages((prev) => [...prev, msg]);
        // If we got a message from someone else (seller), we're no longer waiting
        if (msg.sender !== user?.id && msg.senderId !== user?.id) {
          setIsWaitingForReply(false);
        }
        scrollToBottom();
      }
    };

    if (socket) {
      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);
      socket.on("new_message", handleNewMessage);

      if (socket.connected) {
        handleConnect();
      } else {
        socket.once("connect", handleConnect);
      }
    }

    return () => {
      if (socket) {
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
        socket.off("new_message", handleNewMessage);
        socket.emit("leave_conversation", { conversationId });
      }
      mounted = false;
    };
  }, [conversation?._id, isAuthenticated, user?.id]);

  const sendMessage = async () => {
    if (!input.trim() || !conversation?._id || sending) return;

    const text = input.trim();
    setInput("");
    setSending(true);

    try {
      // Add optimistic message
      const optimisticMessage: Message = {
        _id: `temp-${Date.now()}`,
        sender: user?.id,
        senderId: user?.id,
        text,
        timestamp: new Date().toISOString(),
        type: "text",
        read: false,
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      scrollToBottom();

      // Send via API
      const res = await apiFetch("/messages", {
        method: "POST",
        body: {
          conversationId: conversation._id,
          text,
          type: "text",
        },
      });

      if (!res?.success) {
        throw new Error(res?.message || "Failed to send message");
      }

      // Message will be updated via Socket.IO
    } catch (err) {
      console.error("Send message error:", err);
      setError("Failed to send message. Please try again.");
      // Re-add the message for retry
      setInput(text);
      setMessages((prev) => prev.slice(0, -1));
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
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (error && !conversation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="max-w-md p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="font-semibold text-gray-900">{sellerInfo?.name || "Seller"}</h1>
              <p className="text-xs text-gray-500">
                {connected ? "Online" : "Offline"}
              </p>
            </div>
          </div>
          {!connected && <div className="text-xs text-gray-400">Connecting...</div>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-gray-400 mb-2 text-4xl">💬</div>
            <p className="text-gray-600 font-medium">Start a conversation</p>
            <p className="text-sm text-gray-500">Send a message to the seller</p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isMine = msg.sender === user?.id || msg.senderId === user?.id;
          return (
            <div
              key={msg._id || msg.id || idx}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs sm:max-w-sm px-4 py-2.5 rounded-lg ${
                  isMine
                    ? "bg-teal-600 text-white rounded-br-none"
                    : "bg-white border border-gray-200 text-gray-900 rounded-bl-none"
                }`}
              >
                <p className="break-words">{msg.text}</p>
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
        })}

        {isWaitingForReply && messages.length > 0 && (
          <div className="flex justify-center py-4">
            <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 text-center">
                Waiting for the seller to reply...
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Input */}
      <div className="border-t bg-white px-4 py-3 sm:px-6">
        <button
          onClick={() => router.push(`https://wa.me/${sellerInfo?._id || ''}?text=${encodeURIComponent('Hi, I saw your listing for ' + listing?.title)}`)}
          className="w-full mb-3 py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition-colors"
        >
          💬 Contact on WhatsApp
        </button>

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
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
    </div>
  );
}
