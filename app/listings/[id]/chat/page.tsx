"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Send } from "lucide-react";
import apiFetch from "../../../../lib/apiClient";
import { connectSocket, getSocket } from "../../../../lib/socket";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { useAuth } from "../../../context/AuthContext";

export default function ListingChatPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const id = params?.id;

  const [listing, setListing] = useState<any>(null);
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

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
        const sellerId = listing?.sellerId || listing?.seller || listing?.sellerUserId || listing?.sellerUid;
        if (!sellerId) throw new Error("Seller is unavailable");

        const res = await apiFetch("/conversations", {
          method: "POST",
          body: {
            sellerId,
            productId: id,
            initialMessage: `Hi, I'm interested in ${listing?.title || 'this item'}.`,
          },
        });

        const conv = res?.data || res?.conversation || res;
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
  const chatSubtitle = connected ? "Seller is online" : "Connecting to chat...";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">Chat with seller</p>
            <p className="text-xs text-slate-500">{chatSubtitle}</p>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 pb-28 pt-4">
        {listing && (
          <div className="mb-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="h-16 w-16 overflow-hidden rounded-3xl bg-slate-100">
                {listing.imageUrls?.[0] ? (
                  <img src={listing.imageUrls[0]} alt={listing.title || "Product"} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-500">📦</div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 line-clamp-2">{listing.title}</p>
                <p className="mt-2 text-sm text-slate-500">₵{listing.price ?? listing.price}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
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
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-600">
            Preparing your chat. Please wait a moment.
          </div>
        )}

        {conversation && (
          <div className="mb-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div ref={listRef} className="max-h-[62vh] overflow-y-auto space-y-3 px-1 py-2">
              {messages.length === 0 ? (
                <div className="rounded-3xl bg-slate-100 p-5 text-center text-sm text-slate-500">
                  Say hello to the seller and ask about availability, delivery or student discounts.
                </div>
              ) : (
                messages.map((message, index) => {
                  const mine = message.senderId === "me" || message.senderId === "buyer";
                  return (
                    <div
                      key={index}
                      className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[84%] rounded-3xl px-4 py-3 text-sm leading-6 ${mine ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-900'}`}>
                        {message.text}
                        <div className="mt-2 text-[10px] text-slate-400 text-right">
                          {message.timestamp ? new Date(Number(message.timestamp)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') sendMessage(); }}
            placeholder={isAuthenticated ? 'Write a message to the seller...' : 'Sign in to start chatting'}
            disabled={!isAuthenticated}
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
          <button
            type="button"
            disabled={!isAuthenticated || !input.trim()}
            onClick={sendMessage}
            className="inline-flex h-12 items-center justify-center rounded-3xl bg-teal-600 px-4 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        {!isAuthenticated && (
          <div className="mt-3 text-center text-sm text-slate-500">
            <button
              type="button"
              onClick={() => router.push('/auth')}
              className="font-semibold text-teal-600 underline"
            >Sign in</button>{' '}
            to message sellers and keep your chat saved.
          </div>
        )}
      </div>
    </div>
  );
}
