"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import io, { Socket } from "socket.io-client";
import apiFetch from "../../lib/apiClient"; // ✅ Using default export (apiFetch) which is the callable function
import { useAuth } from "../context/AuthContext";

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

interface SocketChatProps {
  listingId: string;
  sellerId: string;
  listingTitle?: string;
  onClose?: () => void;
}

export default function SocketChat({
  listingId,
  sellerId,
  listingTitle,
  onClose,
}: SocketChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlineStatus, setOnlineStatus] = useState<"online" | "offline" | "typing">("offline");

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const router = useRouter();

  const currentUserId = user?._id || user?.id;
  const isSeller = user?.role === "seller";

  // Load messages from API
  useEffect(() => {
    const loadMessages = async () => {
      if (!listingId) return;

      try {
        setIsLoading(true);
        const response = await apiFetch(`/messages/${listingId}`, {
          method: "GET",
        });

        if (response?.success && response.data) {
          setMessages(response.data);
        } else if (Array.isArray(response?.data)) {
          setMessages(response.data);
        } else if (Array.isArray(response)) {
          setMessages(response);
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
        // Don't show error to user, just use empty array
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [listingId]);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem("unimart:token");
    if (!token) {
      setError("Please login to chat");
      setIsLoading(false);
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "https://unimart-backend-6pld.onrender.com";

    socketRef.current = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
      setError(null);

      // Join conversation room (server expects 'join_conversation')
      const roomId = [sellerId, currentUserId].sort().join("-");
      socket.emit('join_conversation', { conversationId: roomId });
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      setIsConnected(false);
      setError("Failed to connect to chat server");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socket.on('new_message', (message: any) => {
      const msg: Message = {
        _id: message._id || message.id || `srv-${Date.now()}`,
        senderId: message.sender?._id || message.senderId || message.sender,
        receiverId: message.receiverId || undefined,
        content: message.text || message.content || '',
        createdAt: message.timestamp || message.createdAt || new Date().toISOString(),
        read: !!message.read,
      };
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    socket.on("messageRead", ({ messageId, readAt }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, read: true } : msg
        )
      );
    });

    socket.on("typing", ({ userId }) => {
      if (userId !== currentUserId) {
        setOnlineStatus("typing");
        setTimeout(() => setOnlineStatus("online"), 3000);
      }
    });

    socket.on("userOnline", ({ userId }) => {
      if (userId !== currentUserId) {
        setOnlineStatus("online");
      }
    });

    socket.on("userOffline", ({ userId }) => {
      if (userId !== currentUserId) {
        setOnlineStatus("offline");
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [sellerId, currentUserId, listingId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!isConnected) {
      setError("Not connected to chat server");
      return;
    }
    if (!currentUserId) {
      setError("Please login to send messages");
      return;
    }

    const messageContent = newMessage.trim();
    setNewMessage("");
    setError(null);

    // Optimistic update
    const tempMessage: Message = {
      _id: `temp-${Date.now()}`,
      senderId: currentUserId,
      receiverId: sellerId,
      content: messageContent,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const roomId = [sellerId, currentUserId].sort().join("-");

      // Save message to API (use 'text' field expected by backend)
      await apiFetch("/messages", {
        method: "POST",
        body: {
          listingId,
          text: messageContent,
          receiverId: sellerId,
          senderId: currentUserId,
          type: 'text'
        },
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message. Please try again.");
      // Remove optimistic message if failed
      setMessages((prev) => prev.filter((msg) => msg._id !== tempMessage._id));
    }
  };

  const handleTyping = () => {
    const roomId = [sellerId, currentUserId].sort().join("-");
    socketRef.current?.emit("typing", {
      conversationId: roomId,
      userId: currentUserId,
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 172800000) return "Yesterday";
    return date.toLocaleDateString();
  };

  const getMessageStatus = (message: Message) => {
    if (message.senderId === currentUserId) {
      return message.read ? "✓✓ Read" : "✓ Sent";
    }
    return "";
  };

  if (!currentUserId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-50 rounded-xl">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please login to chat</p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-teal-600 text-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-lg font-bold">
                {listingTitle?.charAt(0) || "C"}
              </span>
            </div>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-teal-600 ${onlineStatus === "online"
                  ? "bg-green-500"
                  : onlineStatus === "typing"
                    ? "bg-yellow-500"
                    : "bg-gray-400"
                }`}
            />
          </div>
          <div>
            <h3 className="font-semibold">{listingTitle || "Chat"}</h3>
            <p className="text-xs opacity-75">
              {onlineStatus === "online"
                ? "Online"
                : onlineStatus === "typing"
                  ? "Typing..."
                  : "Offline"}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.senderId === currentUserId;
            const showDate = index === 0 ||
              new Date(message.createdAt).toDateString() !==
              new Date(messages[index - 1].createdAt).toDateString();

            return (
              <React.Fragment key={message._id}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="px-3 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                      {new Date(message.createdAt).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
                <div
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${isOwnMessage
                        ? "bg-teal-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100"
                      }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <div
                      className={`flex items-center gap-1 mt-1 text-xs ${isOwnMessage ? "text-teal-100" : "text-gray-400"
                        }`}
                    >
                      <span>{formatTime(message.createdAt)}</span>
                      {isOwnMessage && (
                        <span className="ml-1">
                          {message.read ? "✓✓" : "✓"}
                        </span>
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

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        {error && (
          <div className="mb-2 p-2 bg-red-50 text-red-600 text-sm rounded">
            {error}
          </div>
        )}
        <div className="flex gap-2">
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
            onFocus={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            disabled={!isConnected}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        {!isConnected && (
          <p className="mt-1 text-xs text-red-500">Reconnecting to chat server...</p>
        )}
      </div>
    </div>
  );
}