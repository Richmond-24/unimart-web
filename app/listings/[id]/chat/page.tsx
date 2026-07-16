"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, MessageCircle, CheckCheck } from "lucide-react";
import apiFetch from "../../../../lib/apiClient";
import { connectSocket, getSocket } from "../../../../lib/socket";
import { useAuth } from "../../../context/AuthContext";

interface ChatMessage {
  _id: string;
  sender?: string | { _id?: string; name?: string; photoURL?: string };
  senderId?: string;
  text?: string;
  content?: string;
  createdAt?: string;
  timestamp?: string;
  read?: boolean;
  delivered?: boolean; // ✅ FIX: Added delivered property
  type?: string;
}

interface ListingData {
  _id: string;
  title: string;
  price: number;
  images?: string[];
  imageUrls?: string[];
  sellerId?: string;
  sellerName?: string;
  seller?: string | { _id?: string; id?: string; name?: string };
  sellerEmail?: string;
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const listingId = params?.id as string;
  const conversationIdFromQuery = searchParams?.get("convId") || null;
  const { user } = useAuth();

  const [listing, setListing] = useState<ListingData | null>(null);
  const [conversation, setConversation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSendingRef = useRef(false);
  const pendingMessageRef = useRef<{ id: string; text: string } | null>(null);

  const currentUserId = user?._id || user?.id;

  const loadBuyerConversations = useCallback(async () => {
    try {
      const res = await apiFetch("/messages/conversations", { method: "GET", suppressErrorLog: true } as any);
      const conversations = res?.conversations || res?.data || [];
      return Array.isArray(conversations) ? conversations : [];
    } catch {
      try {
        const fallback = await apiFetch("/conversations", { method: "GET", suppressErrorLog: true } as any);
        const conversations = fallback?.conversations || fallback?.data || [];
        return Array.isArray(conversations) ? conversations : [];
      } catch {
        return [];
      }
    }
  }, []);

  const resolveSellerInfo = useCallback(() => {
    const sellerId = listing?.sellerId
      || (typeof listing?.seller === "object" ? listing.seller._id || listing.seller.id : listing?.seller)
      || (typeof conversation?.seller === "object" ? conversation.seller._id || conversation.seller.id : conversation?.seller)
      || null;
    const sellerEmail = listing?.sellerEmail
      || (typeof conversation?.seller === "object" ? conversation.seller.email : null)
      || null;
    return { sellerId, sellerEmail };
  }, [listing, conversation]);

  const ensureConversation = useCallback(async () => {
    if (conversationId) return conversationId;
    if (!currentUserId) throw new Error("Please sign in to continue chatting.");

    const { sellerId, sellerEmail } = resolveSellerInfo();
    if (!listing && !conversationIdFromQuery) {
      throw new Error("The listing is still loading. Please try again in a moment.");
    }
    if (!sellerId && !sellerEmail && !conversationIdFromQuery) {
      throw new Error("Unable to find seller information for this conversation. Please refresh and try again.");
    }

    const convs = await loadBuyerConversations();
    const existing = convs.find((c: any) => {
      const productMatch = listingId && c.product && String(c.product) === String(listingId);
      const sellerInParts = (c.participants || []).some(
        (p: any) => String(p._id || p) === String(sellerId)
      );
      return productMatch || sellerInParts;
    });

    if (existing?._id) {
      setConversationId(existing._id);
      return existing._id;
    }

    const createRes = await apiFetch(`/conversations`, {
      method: "POST",
      body: {
        ...(sellerId ? { sellerId } : {}),
        sellerEmail: sellerEmail || listing?.sellerEmail || "",
        listingId: listingId || undefined,
        productId: listingId || undefined,
        title: listing?.title || conversation?.productName || "",
        price: listing?.price || conversation?.price,
      },
    } as any);

    const nextConversationId = createRes?.conversation?._id || null;
    if (!nextConversationId) {
      throw new Error("Unable to start the conversation right now.");
    }

    setConversationId(nextConversationId);
    return nextConversationId;
  }, [conversationId, currentUserId, resolveSellerInfo, loadBuyerConversations, listing, conversation, listingId, conversationIdFromQuery]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Load listing metadata when we have a listing route
  useEffect(() => {
    if (!listingId) return;
    let m = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiFetch(`/listings/${listingId}`, { suppressErrorLog: true } as any);
        if (!m) return;
        if (res?.data) {
          setListing(res.data);
        } else if (!conversationIdFromQuery) {
          setError("Listing not found");
        }
      } catch {
        if (m && !conversationIdFromQuery) setError("Failed to load listing");
      } finally { if (m) setLoading(false); }
    })();
    return () => { m = false; };
  }, [listingId, conversationIdFromQuery]);

  // Load conversation details when we arrive with a conversation ID
  useEffect(() => {
    if (!conversationIdFromQuery) return;
    let m = true;
    (async () => {
      try {
        const res = await apiFetch(`/conversations/${conversationIdFromQuery}`, { suppressErrorLog: true } as any);
        if (!m) return;
        if (res?.conversation) {
          setConversation(res.conversation);
          setConversationId(conversationIdFromQuery);
        }
      } catch (err) {
        console.warn("Failed to load conversation details:", err);
      }
    })();
    return () => { m = false; };
  }, [conversationIdFromQuery]);

  // Get or create conversation
  useEffect(() => {
    if (!currentUserId) return;

    const { sellerId, sellerEmail } = resolveSellerInfo();
    if (!listing && !conversationIdFromQuery) return;
    if (!sellerId && !sellerEmail && !conversationIdFromQuery) return;

    let m = true;

    (async () => {
      try {
        if (conversationIdFromQuery) {
          setConversationId(conversationIdFromQuery);
          return;
        }

        const convs = await loadBuyerConversations();
        const existing = convs.find((c: any) => {
          const productMatch = listingId && c.product && String(c.product) === String(listingId);
          const sellerInParts = (c.participants || []).some(
            (p: any) => String(p._id || p) === String(sellerId)
          );
          return productMatch || sellerInParts;
        });

        if (existing && m) {
          setConversationId(existing._id);
          return;
        }

        const createRes = await apiFetch(`/conversations`, {
          method: "POST",
          body: {
            ...(sellerId ? { sellerId } : {}),
            sellerEmail: sellerEmail || listing?.sellerEmail || "",
            listingId: listingId || undefined,
            productId: listingId || undefined,
            title: listing?.title || conversation?.productName || "",
            price: listing?.price || conversation?.price,
          },
        } as any);

        if (m && createRes?.conversation?._id) {
          setConversationId(createRes.conversation._id);
        } else if (m) {
          console.warn("create conversation response", createRes);
        }
      } catch (err: any) {
        console.warn("Conversation setup error:", err?.message);
        if (m) setError("Failed to start conversation");
      }
    })();

    return () => { m = false; };
  }, [listing, conversation, currentUserId, listingId, conversationIdFromQuery, resolveSellerInfo, loadBuyerConversations]);

  // Load messages
  useEffect(() => {
    if (!conversationId) return;
    let m = true;
    (async () => {
      try {
        setIsLoadingMessages(true);
        const res = await apiFetch(`/conversations/${conversationId}/messages?limit=100`, { suppressErrorLog: true } as any);
        if (m) setMessages(res?.messages || []);
      } catch {
        if (m) setMessages([]);
      } finally { if (m) setIsLoadingMessages(false); }
    })();
    return () => { m = false; };
  }, [conversationId]);

  // WebSocket for real-time
  useEffect(() => {
    if (!conversationId) return;

    const socket = connectSocket();
    if (!socket) return;

    const onConnect = () => {
      setConnected(true);
      socket.emit("join_conversation", { conversationId });
    };
    const onDisconnect = () => setConnected(false);
    const onNewMsg = (msg: any) => {
      const incomingText = msg?.text || msg?.content || "";
      const incomingSender = String(msg?.sender?._id || msg?.sender || msg?.senderId || "");
      const isOwnEcho = Boolean(
        currentUserId &&
        pendingMessageRef.current &&
        incomingSender === String(currentUserId) &&
        incomingText.trim() === pendingMessageRef.current.text.trim()
      );

      if (isOwnEcho) return;

      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("new_message", onNewMsg);

    if (socket.connected) {
      setConnected(true);
      socket.emit("join_conversation", { conversationId });
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("new_message", onNewMsg);
      socket.emit("leave_conversation", { conversationId });
    };
  }, [conversationId]);

  // Send message
  const sendMessage = async () => {
    const text = newMessage.trim();
    if (!text || isSendingRef.current) return;

    if (!currentUserId) {
      setError("Please sign in to continue chatting.");
      return;
    }

    isSendingRef.current = true;
    setIsSending(true);
    setError(null);

    const tempId = `temp-${Date.now()}`;
    pendingMessageRef.current = { id: tempId, text };

    try {
      const activeConversationId = conversationId || (await ensureConversation());
      if (!activeConversationId) {
        throw new Error("Conversation is not ready yet. Please try again.");
      }

      setNewMessage("");

      // ✅ FIX: Added delivered: false to optimistic message
      const optimistic: ChatMessage = {
        _id: tempId,
        sender: currentUserId,
        senderId: currentUserId,
        text,
        timestamp: new Date().toISOString(),
        read: false,
        delivered: false, // ✅ Added this
      };
      setMessages((prev) => [...prev, optimistic]);
      scrollToBottom();

      const res = await apiFetch("/messages", {
        method: "POST",
        body: { conversationId: activeConversationId, text, type: "text" },
      } as any);

      if (res?.success && res?.message) {
        setMessages((prev) => prev.map((m) => (m._id === tempId ? res.message : m)));
      } else {
        setMessages((prev) => prev.filter((m) => m._id !== tempId));
        setNewMessage(text);
      }

      pendingMessageRef.current = null;
    } catch (err: any) {
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      pendingMessageRef.current = null;
      setNewMessage(text);
      setError(err?.message || "Failed to send");
    } finally {
      isSendingRef.current = false;
      setIsSending(false);
    }
  };

  const formatTime = (ts?: string) => {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 172800000) return "Yesterday";
    return d.toLocaleDateString();
  };

  const formatDateLabel = (ts?: string) => {
    if (!ts) return "";
    return new Date(ts).toLocaleDateString(undefined, {
      weekday: "short", month: "short", day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if ((error && !conversationId) || (!listing && !conversation && !conversationId)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 bg-white">
        <MessageCircle className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-red-600 mb-4 text-center">{error || "Listing not found"}</p>
        <Link href="/" className="text-teal-600 font-medium hover:underline">
          ← Back to home
        </Link>
      </div>
    );
  }

  const chatTitle = listing?.title || conversation?.productName || "Conversation";
  const chatSubtitle = listing?.sellerName || conversation?.seller?.name || "Seller";
  const prodImage = listing?.imageUrls?.[0] || listing?.images?.[0] || conversation?.productImage || null;

  // === TEMU-STYLE CHAT UI ===
  return (
    <div className="flex flex-col h-screen bg-[#f3f4f6] max-w-3xl mx-auto">
      {/* ── HEADER ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="p-1 -ml-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>

        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
          {prodImage ? (
            <img src={prodImage} alt={chatTitle} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-teal-600 font-bold text-sm">
              {chatTitle.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm truncate">{chatTitle}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {listing?.price ? <span className="font-medium text-teal-600">₵{listing.price}</span> : null}
            <span className="text-gray-300">·</span>
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-gray-300"}`} />
              {connected ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        <div className="text-xs text-gray-400">
          {chatSubtitle}
        </div>
      </div>

      {/* ── CHAT MESSAGES ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageCircle className="w-10 h-10 mb-3" />
            <p className="text-sm font-medium">Start chatting with the seller</p>
            <p className="text-xs mt-1">Ask about the product, price, or delivery</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const senderObj = typeof msg.sender === "object" ? msg.sender : null;
            const sender = String(senderObj?._id || msg.sender || msg.senderId || "");
            const isMine = sender === String(currentUserId);
            const showDate =
              idx === 0 ||
              (msg.timestamp || msg.createdAt) &&
              (messages[idx - 1]?.timestamp || messages[idx - 1]?.createdAt) &&
              new Date(msg.timestamp || msg.createdAt || "").toDateString() !==
              new Date(messages[idx - 1]?.timestamp || messages[idx - 1]?.createdAt || "").toDateString();

            return (
              <React.Fragment key={msg._id || idx}>
                {showDate && (
                  <div className="flex justify-center my-3">
                    <span className="px-3 py-1 text-[11px] font-medium bg-gray-200/80 text-gray-500 rounded-full">
                      {formatDateLabel(msg.timestamp || msg.createdAt)}
                    </span>
                  </div>
                )}
                <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl ${
                      isMine
                        ? "bg-teal-600 text-white rounded-br-md"
                        : "bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100"
                    }`}
                  >
                    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                      {msg.text || msg.content || ""}
                    </p>
                    <div className={`flex items-center gap-1.5 mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
                      <span className={`text-[10px] ${isMine ? "text-teal-100" : "text-gray-400"}`}>
                        {formatTime(msg.timestamp || msg.createdAt)}
                      </span>
                      {isMine && (
                        <div className="flex items-center">
                          {/* ✅ FIX: Using optional chaining to safely access delivered */}
                          <CheckCheck className={`w-3.5 h-3.5 ${msg.read ? "text-blue-300" : msg.delivered === true ? "text-teal-200" : "text-teal-100"}`} />
                          {msg.read && <CheckCheck className="w-3.5 h-3.5 -ml-1.5 text-blue-300" />}
                        </div>
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

      {/* ── INPUT BAR ── */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        {error && (
          <div className="mb-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <p className="text-xs text-red-600">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-xs font-medium ml-2">Dismiss</button>
          </div>
        )}
        <div className="flex items-center gap-2 bg-gray-50 rounded-2xl border border-gray-200 px-4 py-1.5">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-gray-400"
            disabled={isSending}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-teal-700 transition-colors flex-shrink-0"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}