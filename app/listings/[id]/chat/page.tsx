"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Send, MessageCircle } from "lucide-react";
import apiFetch from "../../../../lib/apiClient";
import { connectSocket, getSocket } from "../../../../lib/socket";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { useAuth } from "../../../context/AuthContext";

// ---- pure helpers (no state, safe to keep outside the component) ----

function parseTimestamp(value: any): Date | null {
  if (value == null) return null;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "number") {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === "string") {
    const numeric = Number(value);
    const date = !Number.isNaN(numeric) ? new Date(numeric) : new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
}

function dateLabelFor(timestamp: any) {
  const d = parseTimestamp(timestamp);
  if (!d) return "";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function timeFor(timestamp: any) {
  const d = parseTimestamp(timestamp);
  if (!d) return "";
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isValidMongoId(value: any) {
  return typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value);
}

function resolveSellerId(listing: any) {
  if (!listing) return null;
  if (isValidMongoId(listing.sellerId)) return listing.sellerId;
  if (isValidMongoId(listing.sellerUserId)) return listing.sellerUserId;
  if (isValidMongoId(listing.sellerUid)) return listing.sellerUid;
  if (isValidMongoId(listing.userId)) return listing.userId;
  if (typeof listing.seller === 'object') {
    return (
      listing.seller._id || listing.seller.id || listing.seller.userId || listing.seller.uid
    )?.toString?.() || null;
  }
  if (isValidMongoId(listing.seller)) return listing.seller;
  return null;
}

function isMine(message: any, currentUserId?: string | null) {
  if (!message) return false;
  if (currentUserId && (message.senderId === currentUserId || message.sender === currentUserId)) {
    return true;
  }
  return message.senderId === 'me' || message.sender === 'me' || message.senderId === 'buyer';
}

// Groups flat messages into { label, items: [{ ...message, showTail }] } chunks
// so consecutive messages from the same sender sit tighter, with a tail only
// on the last message of each run. Pure function, derived on every render.
function groupMessages(messages: any[]) {
  const groups: { label: string; items: any[] }[] = [];

  messages.forEach((message, index) => {
    const label = message.timestamp ? dateLabelFor(message.timestamp) : "";
    const prev = messages[index - 1];
    const next = messages[index + 1];

    const sameGroupAsPrev =
      prev && isMine(prev) === isMine(message) && (!label || dateLabelFor(prev.timestamp) === label);
    const sameGroupAsNext =
      next && isMine(next) === isMine(message) && (!label || dateLabelFor(next.timestamp) === label);

    const item = { ...message, showTail: !sameGroupAsNext };

    if (!sameGroupAsPrev || groups.length === 0 || groups[groups.length - 1].label !== label) {
      groups.push({ label, items: [item] });
    } else {
      groups[groups.length - 1].items.push(item);
    }
  });

  return groups;
}

export default function ListingChatPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const id = params?.id;

  const [listing, setListing] = useState<any>(null);
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  // --- Fixed header height tracking (so content is offset correctly) ---
  const [headerHeight, setHeaderHeight] = useState(64); // sensible fallback
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const measure = () => {
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    let active = true;
    if (!id) return;

    setLoading(true);
    (async () => {
      try {
        const res = await apiFetch(`/public/listings/${id}`);
        if (!active) return;
        setListing(res?.data || res || null);
      } catch (err) {
        console.error("Failed to load product for chat", err);
        if (active) setError("Unable to load product details. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!id || !listing) return;
    if (!isAuthenticated) {
      setError("Please sign in to chat with the seller.");
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    (async () => {
      try {
        const sellerId = resolveSellerId(listing);
        const sellerEmail = listing?.sellerEmail || listing?.email || listing?.seller?.email;
        if (!sellerId && !sellerEmail) throw new Error("Seller is unavailable");

        const payload: any = {
          productId: id,
          initialMessage: `Hi, I'm interested in ${listing?.title || 'this item'}.`,
        };
        if (sellerId) payload.sellerId = sellerId;
        else payload.sellerEmail = sellerEmail;

        const res = await apiFetch("/conversations", {
          method: "POST",
          body: payload,
        });

        const conv = res?.conversation || res?.data?.conversation || res?.data || res;
        if (!conv) throw new Error('Conversation response was invalid');
        if (active) setConversation(conv);
      } catch (err) {
        console.error("Unable to start chat session", err);
        if (active) setError("Could not start chat with the seller. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id, listing, isAuthenticated]);

  useEffect(() => {
    if (!conversation) return;

    const socket = connectSocket();
    const conversationId = conversation._id || conversation.id;

    const handleConnect = () => {
      setConnected(true);
      if (socket && conversationId) {
        socket.emit("join_conversation", { conversationId });
      }
    };

    const handleDisconnect = () => setConnected(false);
    const handleNewMessage = (msg: any) => {
      if (!msg || !msg.text) return;
      setMessages((prev) => [...prev, msg]);
    };

    const joinRoom = () => {
      if (!socket || !conversationId) return;
      socket.emit("join_conversation", { conversationId });
    };

    if (socket) {
      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);
      socket.on("new_message", handleNewMessage);
    }

    if (socket && socket.connected) {
      joinRoom();
    } else if (socket) {
      socket.once("connect", joinRoom);
    }

    (async () => {
      try {
        const res = await apiFetch(`/conversations/${conversationId}/messages?limit=50`);
        const msgs = res?.data || res?.messages || [];
        if (Array.isArray(msgs)) {
          setMessages(msgs.slice().reverse());
        }
      } catch (err) {
        console.error("Failed to load chat messages", err);
      }
    })();

    return () => {
      if (!socket) return;
      try {
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
        socket.off("new_message", handleNewMessage);
        socket.emit("leave_conversation", { conversationId });
      } catch (err) {
        console.warn("Socket cleanup error", err);
      }
    };
  }, [conversation]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !conversation) return;

    const nextMessage = {
      senderId: "me",
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, nextMessage]);
    setInput("");

    const conversationId = conversation._id || conversation.id;
    const socket = getSocket();

    try {
      if (socket && socket.connected) {
        socket.emit("send_message", { conversationId, text, type: "text" });
      } else {
        await apiFetch(`/conversations/${conversationId}/sync`, {
          method: "POST",
          body: {
            messages: [
              {
                firebaseId: `local-${Date.now()}`,
                senderId: "me",
                text,
                type: "text",
                timestamp: Date.now(),
              },
            ],
          },
        });
      }
    } catch (err) {
      console.error("Chat send failed", err);
    }
  };

  const chatTitle = conversation?.productName || listing?.title || "Seller chat";
  const sellerInitial = (chatTitle || "S").trim().charAt(0).toUpperCase();
  const messageGroups = groupMessages(messages);

  return (
    <div className="min-h-screen bg-[#FAF7F1]">
      {/* Header — fixed (not sticky) with opaque background so there's no gap during mobile overscroll */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-30 bg-[#142420]"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#147D6F] text-sm font-semibold text-white">
            {sellerInitial}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{chatTitle}</p>
            <p className="flex items-center gap-1.5 text-xs text-white/50">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${connected ? "bg-[#5DCAA5]" : "bg-white/30"}`}
              />
              {connected ? "Seller is online" : "Connecting to chat..."}
            </p>
          </div>
        </div>
      </header>

      {/* Spacer so the fixed header doesn't overlap content below it */}
      <div style={{ height: headerHeight }} aria-hidden="true" />

      <main className="mx-auto max-w-4xl px-4 pb-32 pt-4">
        {/* Deal strip — ticket-stub style listing context */}
        {listing && (
          <div className="relative mb-6 overflow-hidden rounded-2xl bg-white shadow-[0_1px_0_rgba(20,36,32,0.04)] ring-1 ring-black/5">
            <div className="flex items-center gap-3 p-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#EFE8D8]">
                {listing.imageUrls?.[0] ? (
                  <img
                    src={listing.imageUrls[0]}
                    alt={listing.title || "Product"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-lg">📦</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8a8579]">
                  You&apos;re chatting about
                </p>
                <p className="truncate text-sm font-semibold text-[#142420]">{listing.title}</p>
              </div>
              <div className="shrink-0 rounded-full bg-[#E1F5EE] px-3 py-1 text-sm font-semibold text-[#085041]">
                ₵{listing.price}
              </div>
            </div>

            {/* perforated tear edge */}
            <div className="relative h-0 border-t border-dashed border-[#E3DED0]">
              <span className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full bg-[#FAF7F1]" />
              <span className="absolute -right-2.5 -top-2.5 h-5 w-5 rounded-full bg-[#FAF7F1]" />
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-2xl border border-[#F0997B]/40 bg-[#FAECE7] p-4 text-sm text-[#712B13]">
            {error}
          </div>
        )}

        {loading && (
          <div className="py-24">
            <div className="flex justify-center">
              <LoadingSpinner size={44} />
            </div>
          </div>
        )}

        {!loading && !conversation && !error && (
          <div className="rounded-2xl border border-[#E3DED0] bg-white p-6 text-center text-sm text-[#5C6B64]">
            Preparing your chat. This won&apos;t take long.
          </div>
        )}

        {/* Message thread */}
        {conversation && (
          <div ref={listRef} className="max-h-[62vh] space-y-5 overflow-y-auto px-0.5 py-1">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/60 px-6 py-14 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EFE8D8] text-[#8a8579]">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <p className="text-sm text-[#5C6B64]">
                  Say hello and ask about availability, delivery, or student discounts.
                </p>
              </div>
            ) : (
              messageGroups.map((group, gIndex) => (
                <div key={gIndex}>
                  {group.label && (
                    <div className="mb-3 flex justify-center">
                      <span className="rounded-full bg-[#EFE8D8] px-3 py-1 text-[11px] font-medium text-[#5C6B64]">
                        {group.label}
                      </span>
                    </div>
                  )}
                  <div className="space-y-1">
                    {group.items.map((message: any, mIndex: number) => {
                      const mine = isMine(message);
                      return (
                        <div key={mIndex} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[78%] px-4 py-2.5 text-sm leading-6 ${
                              mine
                                ? "bg-[#147D6F] text-white"
                                : "bg-white text-[#142420] ring-1 ring-black/5"
                            } ${
                              mine
                                ? `rounded-2xl ${message.showTail ? "rounded-br-md" : ""}`
                                : `rounded-2xl ${message.showTail ? "rounded-bl-md" : ""}`
                            }`}
                          >
                            {message.text}
                            {message.showTail && (
                              <div
                                className={`mt-1 text-[10px] ${mine ? "text-white/60" : "text-[#8a8579]"} ${
                                  mine ? "text-right" : "text-left"
                                }`}
                              >
                                {timeFor(message.timestamp)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Composer */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-[#FAF7F1] via-[#FAF7F1] to-transparent px-4 pb-4 pt-6">
        <div className="mx-auto flex max-w-4xl items-center gap-2 rounded-full bg-white p-1.5 shadow-[0_2px_12px_rgba(20,36,32,0.08)] ring-1 ring-black/5">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") sendMessage();
            }}
            placeholder={isAuthenticated ? "Write a message to the seller..." : "Sign in to start chatting"}
            disabled={!isAuthenticated}
            className="w-full flex-1 bg-transparent px-4 py-2.5 text-sm text-[#142420] placeholder:text-[#8a8579] outline-none disabled:cursor-not-allowed"
          />
          <button
            type="button"
            disabled={!isAuthenticated || !input.trim()}
            onClick={sendMessage}
            aria-label="Send message"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#147D6F] text-white transition hover:bg-[#0F6E56] active:scale-95 disabled:cursor-not-allowed disabled:bg-[#D3D1C7] disabled:text-[#8a8579]"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        {!isAuthenticated && (
          <div className="mt-3 text-center text-sm text-[#5C6B64]">
            <button
              type="button"
              onClick={() => router.push("/auth")}
              className="font-semibold text-[#147D6F] underline underline-offset-2"
            >
              Sign in
            </button>{" "}
            to message sellers and keep your chat saved.
          </div>
        )}
      </div>
    </div>
  );
}