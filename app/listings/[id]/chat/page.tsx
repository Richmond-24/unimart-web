"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Phone, Video, Info } from "lucide-react";
import { apiClient } from "../../../../lib/apiClient";
import { useAuth } from "../../../context/AuthContext";

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

interface Listing {
  _id: string;
  title: string;
  price: number;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerEmail?: string;
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params?.id as string;
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = user?._id || user?.id;
  const currentUserEmail = user?.email;

  // Load listing details
  useEffect(() => {
    const loadListing = async () => {
      if (!listingId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const res = await apiClient.get(`/api/public/listings/${listingId}`, {
          suppressErrorLog: true
        });
        
        if (res?.success && res.data) {
          setListing(res.data);
        } else if (res?.data) {
          setListing(res.data);
        } else {
          setError("Listing not found");
        }
      } catch (err: any) {
        console.warn('Failed to load listing:', err?.message || 'Unknown error');
        setError("Failed to load listing");
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [listingId]);

  // Get or create conversation
  useEffect(() => {
    const getOrCreateConversation = async () => {
      if (!listingId || !currentUserId || !listing) return;

      try {
        // Get the seller's email from the listing
        const sellerEmail = listing.sellerEmail || listing.sellerId;
        
        if (!sellerEmail) {
          console.warn('No seller email available');
          return;
        }

        const convIdParam = [listing.sellerId, currentUserId].sort().join("-");
        
        // Try to get existing conversation
        try {
          const convRes = await apiClient.get(`/api/conversations/${convIdParam}`, {
            suppressErrorLog: true
          });
          
          if (convRes?.success && convRes.data) {
            setConversationId(convRes.data._id);
            loadMessages(convRes.data._id);
            return;
          }
        } catch (err: any) {
          if (err.status === 404 || err.status === 400) {
            console.debug('No existing conversation, creating new one');
          } else {
            console.warn('Error checking conversation:', err?.message || 'Unknown error');
          }
        }

        // Create new conversation with required fields
        try {
          const createPayload = {
            listingId,
            sellerId: listing.sellerId,
            sellerEmail: sellerEmail,
            buyerId: currentUserId,
            buyerEmail: currentUserEmail,
            title: listing.title,
            price: listing.price,
          };
          
          console.log('Creating conversation with payload:', createPayload);
          
          const createRes = await apiClient.post("/api/conversations", createPayload, {
            suppressErrorLog: true
          });
          
          if (createRes?.success && createRes.data) {
            setConversationId(createRes.data._id);
            setMessages([]);
          } else {
            setError("Failed to start conversation");
          }
        } catch (createErr: any) {
          console.warn('Failed to create conversation:', createErr?.message || 'Unknown error');
          // Check if the error is due to missing sellerEmail
          if (createErr?.message?.includes('sellerId or sellerEmail')) {
            setError("Unable to start chat: Seller information is incomplete. Please try again later.");
          } else {
            setError("Failed to start conversation. Please try again.");
          }
        }
      } catch (err: any) {
        console.warn('Error in conversation setup:', err?.message || 'Unknown error');
        setError("Failed to set up conversation");
      }
    };

    if (listing && currentUserId) {
      getOrCreateConversation();
    }
  }, [listingId, currentUserId, listing, currentUserEmail]);

  // Load messages
  const loadMessages = async (convId: string) => {
    try {
      setIsLoadingMessages(true);
      const res = await apiClient.get(`/api/conversations/${convId}/messages?limit=100`, {
        suppressErrorLog: true
      });
      
      if (res?.success && res.data) {
        setMessages(res.data);
      }
    } catch (err: any) {
      console.warn('Failed to load messages:', err?.message || 'Unknown error');
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !currentUserId || !listing) return;

    setIsSending(true);
    const content = newMessage.trim();
    setNewMessage("");

    // Optimistic update
    const tempMessage: Message = {
      _id: `temp-${Date.now()}`,
      senderId: currentUserId,
      receiverId: listing.sellerId,
      content,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const res = await apiClient.post("/api/messages", {
        conversationId,
        content,
        senderId: currentUserId,
        receiverId: listing.sellerId,
        listingId,
      }, {
        suppressErrorLog: true
      });
      
      if (res?.success && res.data) {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === tempMessage._id ? res.data : msg
          )
        );
      } else {
        setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
        setError("Failed to send message");
      }
    } catch (err: any) {
      console.warn('Failed to send message:', err?.message || 'Unknown error');
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
      setError("Failed to send message");
    } finally {
      setIsSending(false);
    }
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

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <p className="text-red-600 mb-4">{error || "Listing not found"}</p>
        <Link href="/" className="text-teal-600 hover:underline">
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
              <span className="text-teal-600 font-bold">
                {listing.title.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{listing.title}</h3>
              <p className="text-xs text-gray-500">${listing.price}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Info className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
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
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isOwnMessage
                        ? "bg-teal-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100"
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <div
                      className={`flex items-center gap-1 mt-1 text-xs ${
                        isOwnMessage ? "text-teal-100" : "text-gray-400"
                      }`}
                    >
                      <span>{formatTime(message.createdAt)}</span>
                      {isOwnMessage && (
                        <span>{message.read ? "✓✓" : "✓"}</span>
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
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            disabled={isSending}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}