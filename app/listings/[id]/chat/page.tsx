"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, MessageCircle, Send, Store } from "lucide-react";
import apiFetch from "../../../../lib/apiClient";
import { connectSocket, getSocket } from "../../../../lib/socket";
import { useAuth } from "../../../context/AuthContext";

// Temu-brand accent — replaces the WhatsApp-style teal/green theme
const TEMU_ORANGE = "#F6480B";
const TEMU_ORANGE_DARK = "#D63D07";

const QUICK_REPLIES = [
  "Is this still available?",
  "What's the best price?",
  "How long is delivery?",
  "Can I see more photos?",
];

interface ChatMessage {
  _id: string;
  id?: string;
  sender?: string | { _id?: string; name?: string; photoURL?: string };
  senderId?: string;
  text?: string;
  content?: string;
  createdAt?: string;
  timestamp?: string;
  read?: boolean;
  delivered?: boolean;
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

function isSameConversationContext(conversation: any, sellerId: string | null, listingId: string | null) {
  if (!sellerId) return false;

  const sellerMatches = (conversation?.participants || []).some((participant: any) => {
    const id = participant?._id || participant;
    return String(id) === String(sellerId);
  });

  if (!sellerMatches) return false;
  if (!listingId) return true;

  const productCandidates = [
    conversation?.product,
    conversation?.productId,
    conversation?.listingId,
    conversation?.listing?._id,
    conversation?.product?._id,
  ];

  return productCandidates.some((candidate) => candidate && String(candidate) === String(listingId));
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
      const res = await apiFetch("/conversations", { method: "GET", suppressErrorLog: true } as any);
      const conversations = res?.conversations || res?.data || res || [];
      return Array.isArray(conversations) ? conversations : [];
    } catch {
      return [];
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
    const existing = convs.find((c: any) => isSameConversationContext(c, sellerId, listingId));

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
        const existing = convs.find((c: any) => isSameConversationContext(c, sellerId, listingId));

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
        const msgs = res?.data || res?.messages || (Array.isArray(res) ? res : []);
        if (m) setMessages(msgs);
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
    const onNewMsg = (payload: any) => {
      const msg = payload?.message || payload;
      const incomingText = msg?.text || msg?.content || "";
      const incomingSender = String(msg?.sender?._id || msg?.sender || msg?.senderId || payload?.senderId || "");
      const isOwnEcho = Boolean(
        currentUserId &&
        pendingMessageRef.current &&
        incomingSender === String(currentUserId) &&
        incomingText.trim() === pendingMessageRef.current.text.trim()
      );

      if (!incomingText || isOwnEcho) return;

      setMessages((prev) => {
        const existingId = msg?._id || msg?.id || payload?.message?._id || payload?.message?.id;
        if (existingId && prev.some((m) => String(m._id || m.id) === String(existingId))) return prev;
        return [...prev, { ...msg, _id: existingId || `socket-${Date.now()}` }];
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("new_message", onNewMsg);
    socket.on("conversation_message", onNewMsg);

    if (socket.connected) {
      setConnected(true);
      socket.emit("join_conversation", { conversationId });
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("new_message", onNewMsg);
      socket.off("conversation_message", onNewMsg);
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

      const optimistic: ChatMessage = {
        _id: tempId,
        sender: currentUserId,
        senderId: currentUserId,
        text,
        timestamp: new Date().toISOString(),
        read: false,
        delivered: false,
      };
      setMessages((prev) => [...prev, optimistic]);
      scrollToBottom();

      const res = await apiFetch("/messages", {
        method: "POST",
        body: { conversationId: activeConversationId, text, type: "text" },
      } as any);

      const savedMsg = res?.message || res?.data || (res?._id ? res : null);
      if (savedMsg?._id) {
        setMessages((prev) => prev.map((m) => (m._id === tempId ? { ...savedMsg, text: savedMsg.text || savedMsg.content || text } : m)));
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

  // ✅ FIXED: Mobile-friendly, fixed position, no sideways scrolling
  return (
    <div className="fixed inset-0 bg-[#F5F5F5] overflow-hidden">
      <div className="flex flex-col h-full w-full max-w-3xl mx-auto">
        {/* ── HEADER ── */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 flex-shrink-0">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>

          <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-gray-500">
            {prodImage ? (
              <img src={prodImage} alt={chatTitle} className="w-full h-full object-cover" />
            ) : (
              <Store className="w-4 h-4" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{chatSubtitle}</h3>
            <p className="text-xs text-gray-500 truncate">{chatTitle}</p>
          </div>

          {listing?.price ? (
            <div className="text-sm font-bold flex-shrink-0" style={{ color: TEMU_ORANGE }}>
              GH₵{listing.price}
            </div>
          ) : null}
        </div>

        {/* ── CHAT MESSAGES ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: TEMU_ORANGE }} />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageCircle className="w-10 h-10 mb-3" />
              <p className="text-sm font-medium">Start chatting with the seller</p>
              <p className="text-xs mt-1 mb-4">Ask about the product, price, or delivery</p>
              <div className="flex flex-wrap justify-center gap-2 px-6">
                {QUICK_REPLIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => setNewMessage(q)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                    style={{ borderColor: TEMU_ORANGE, color: TEMU_ORANGE }}
                  >
                    {q}
                  </button>
                ))}
              </div>
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
                      className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap ${isMine
                          ? "text-white rounded-br-md"
                          : "bg-white text-gray-800 rounded-bl-md border border-gray-100"
                        }`}
                      style={isMine ? { backgroundColor: TEMU_ORANGE } : undefined}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {msg.text || msg.content || ""}
                      </p>
                      <div className={`mt-1 ${isMine ? "text-right" : "text-left"}`}>
                        <span className={`text-[10px] ${isMine ? "text-white/70" : "text-gray-400"}`}>
                          {formatTime(msg.timestamp || msg.createdAt)}
                        </span>
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
        <div className="bg-white border-t border-gray-200 px-4 py-3 flex-shrink-0">
          {error && (
            <div className="mb-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
              <p className="text-xs text-red-600 break-words">{error}</p>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-xs font-medium ml-2 flex-shrink-0">Dismiss</button>
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
              className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-gray-400 min-w-0"
              disabled={isSending}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSending}
              className="w-9 h-9 rounded-full text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              style={{ backgroundColor: TEMU_ORANGE }}
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}