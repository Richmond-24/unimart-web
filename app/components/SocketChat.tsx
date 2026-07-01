"use client";

import React, { useEffect, useState, useRef } from "react";
import { connectSocket, getSocket } from "../../lib/socket";
import apiFetch from "../../lib/apiClient";

type Message = {
  _id?: string;
  senderId: string;
  text: string;
  timestamp?: string | number;
  type?: string;
};

export default function SocketChat({ conv, onClose }: { conv: any; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // connectSocket now retrieves token from localStorage automatically
    const socket = connectSocket();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    if (socket) {
      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
    }

    const joinRoom = () => {
      if (!conv || !conv._id || !socket) return;
      socket.emit("join_conversation", { conversationId: conv._id || conv.id });
    };

    const onNewMessage = (msg: Message) => {
      setMessages((m) => [...m, msg]);
      // scroll
      setTimeout(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, 50);
    };

    if (socket) {
      socket.on("new_message", onNewMessage);
    }

    // load recent messages from backend
    (async () => {
      try {
        const res = await apiFetch(`/conversations/${conv._id || conv.id}/messages?limit=50`);
        const msgs = res?.data || [];
        setMessages(msgs);
        setTimeout(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, 100);
      } catch (e) {
        console.error('Failed to load messages', e);
      }
    })();

    // join after connect
    if (socket) {
      if (socket.connected) joinRoom();
      else socket.once('connect', joinRoom);
    }

    return () => {
      if (!socket) return;
      try {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off("new_message", onNewMessage);
        socket.emit("leave_conversation", { conversationId: conv._id || conv.id });
      } catch (e) {}
    };
  }, [conv]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const socket = getSocket();
    const payload = { conversationId: conv._id || conv.id, text: input.trim(), type: 'text' };
    // optimistic UI
    const optimistic: Message = { senderId: 'me', text: input.trim(), timestamp: Date.now() };
    setMessages((m) => [...m, optimistic]);
    setInput("");
    setTimeout(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, 50);
    try {
      if (socket && socket.connected) {
        socket.emit("send_message", payload, (ack: any) => {
          // ack may contain saved message
        });
      } else {
        // fallback: POST to backend sync endpoint
        apiFetch(`/conversations/${conv._id || conv.id}/sync`, { method: 'POST', body: JSON.stringify({ messages: [payload] }), headers: { 'Content-Type': 'application/json' } }).catch(() => {});
      }
    } catch (e) {
      console.error('sendMessage error', e);
    }
  };

  const productImage = conv?.productImage || conv?.product?.imageUrls?.[0] || conv?.image || conv?.productImageUrl || null;
  const sellerName = conv?.sellerName || conv?.seller?.name || conv?.sellerName || '';
  const sellerPhone = conv?.sellerPhone || conv?.seller?.phone || null;

  return (
    <div style={{ position: 'fixed', right: 20, bottom: 20, width: 420, maxHeight: '75vh', zIndex: 9999 }}>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 14px 40px rgba(2,6,23,0.2)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', background: '#f8fafc', flexShrink: 0 }}>
              {productImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={productImage} alt="product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5a0', fontWeight: 700 }}>
                  {conv?.productName ? String(conv.productName).slice(0,1) : 'C'}
                </div>
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>{conv?.productName || 'Chat with seller'}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{sellerName || (connected ? 'Connected' : 'Connecting...')}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {sellerPhone && (
              <a href={`tel:${sellerPhone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f8fafc', border: '1px solid #e6f6ef', color: '#065f46', padding: '8px 10px', borderRadius: 8, textDecoration: 'none', fontSize: 13 }}>📞 Call</a>
            )}
            <button onClick={onClose} aria-label="Close chat" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
          </div>
        </div>

        {/* Messages */}
        <div ref={listRef} style={{ padding: 14, overflowY: 'auto', flex: 1, background: 'linear-gradient(180deg,#f8fafc, #ffffff)' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: (m.senderId === 'me' ? 'flex-end' : 'flex-start'), marginBottom: 10 }}>
              <div style={{ background: m.senderId === 'me' ? '#059669' : '#ffffff', color: m.senderId === 'me' ? '#ffffff' : '#0f172a', padding: '10px 14px', borderRadius: 14, maxWidth: '78%', boxShadow: '0 6px 18px rgba(2,6,23,0.06)' }}>
                <div style={{ fontSize: 14, lineHeight: '20px', wordBreak: 'break-word' }}>{m.text}</div>
                <div style={{ fontSize: 11, color: m.senderId === 'me' ? 'rgba(255,255,255,0.85)' : '#94a3b8', marginTop: 8, textAlign: 'right' }}>{m.timestamp ? new Date(Number(m.timestamp)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Composer */}
        <div style={{ padding: 12, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Write a message to the seller..." style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: '1px solid #e6edf0', outline: 'none' }} onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }} />
          <button onClick={sendMessage} style={{ background: '#06b6d4', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}>Send</button>
        </div>
      </div>
    </div>
  );
}
