"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Shield, Mail, Sparkles, Truck, ArrowLeft, CheckCircle2 } from "lucide-react";
import apiFetch from "../../lib/apiClient";
import LoadingSpinner from "../components/LoadingSpinner";

const ICONS: Record<string, any> = {
  new_message: Mail,
  badge_unlocked: Sparkles,
  admin_approval: Shield,
  order_update: Truck,
  system: Bell,
};

const TYPE_LABELS: Record<string, string> = {
  new_message: "New message",
  badge_unlocked: "Badge unlocked",
  admin_approval: "Official update",
  order_update: "Order update",
  system: "System notice",
};

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Just now";
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const loadNotifications = async () => {
      setLoading(true);
      try {
        const rawUser = typeof window !== "undefined" ? localStorage.getItem("unimart:user") : null;
        const currentUser = rawUser ? JSON.parse(rawUser) : null;
        const userId = currentUser?._id || currentUser?.id || null;
        if (!userId) {
          setError("Sign in to see your notifications.");
          setNotifications([]);
          return;
        }

        const res = await apiFetch(`/notifications?userId=${encodeURIComponent(userId)}`);
        const items = Array.isArray(res.notifications) ? res.notifications : [];
        if (mounted) {
          setNotifications(items);
          setError("");
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError("Unable to load notifications. Please refresh.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadNotifications();
    return () => { mounted = false; };
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) => prev.map((note) => note._id === id ? { ...note, read: true } : note));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="py-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="rounded-full p-2 bg-slate-100 hover:bg-slate-200 transition">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">All your push alerts, badge updates, and system messages in one place.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-teal-100 bg-teal-50 p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-2xl bg-white p-3 text-teal-700 shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Badge guide</p>
            <p className="text-sm text-slate-600 mt-1">Verified User means your account has been confirmed and trusted by UniMart. Early Bird means you joined early and receive special welcome perks for campus shoppers.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-4 border border-teal-100">
            <p className="text-xs text-teal-600 uppercase tracking-[0.2em] font-semibold">Verified User</p>
            <p className="mt-2 text-sm text-slate-600">This badge shows your account is trusted and ready for safe campus transactions.</p>
          </div>
          <div className="rounded-2xl bg-white p-4 border border-teal-100">
            <p className="text-xs text-orange-600 uppercase tracking-[0.2em] font-semibold">Early Bird</p>
            <p className="mt-2 text-sm text-slate-600">This badge means you joined UniMart early and can enjoy priority campus updates.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10"><LoadingSpinner size={40} /></div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-100 bg-rose-50 p-6 text-rose-700">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Bell className="mx-auto mb-4 w-10 h-10 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900">No notifications yet</h2>
          <p className="mt-2 text-sm text-slate-500">You’ll see notifications here when UniMart sends updates or when you unlock new badges.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((note) => {
            const Icon = ICONS[note.type] || Bell;
            const label = TYPE_LABELS[note.type] || "Update";
            return (
              <article key={note._id || note.id} className={`rounded-3xl border p-5 ${note.read ? 'border-slate-200 bg-white' : 'border-teal-200 bg-teal-50 shadow-sm'}`}>
                <div className="flex items-start gap-4">
                  <div className="mt-1 shrink-0 rounded-2xl bg-white p-3 text-teal-700 shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{note.title || label}</p>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mt-1">{label}</p>
                      </div>
                      <div className="text-xs text-slate-500">{formatDate(note.createdAt)}</div>
                    </div>
                    <p className="mt-4 text-sm text-slate-700 whitespace-pre-line">{note.body || 'You have a new notification from UniMart.'}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {!note.read && (
                    <button onClick={() => markAsRead(note._id || note.id)} className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 transition">
                      <CheckCircle2 className="w-4 h-4" /> Mark read
                    </button>
                  )}
                  <span className="text-[11px] text-slate-500">{note.read ? 'Read' : 'Unread'}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
