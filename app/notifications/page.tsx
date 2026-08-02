"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Mail, Sparkles, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import apiFetch from "../../lib/apiClient";
import LoadingSpinner from "../components/LoadingSpinner";

const ICONS: Record<string, any> = {
  new_message: Mail,
  badge_unlocked: Sparkles,
  system: Bell,
};

const TYPE_LABELS: Record<string, string> = {
  new_message: "New message",
  badge_unlocked: "Verified badge",
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
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const badgeMessage = notifications.find((note) => note.type === "badge_unlocked");
  const badgeDisplay = {
    _id: badgeMessage?._id || 'badge-synthetic',
    type: 'badge_unlocked',
    title: badgeMessage?.title || 'Verified badge unlocked',
    body:
      badgeMessage?.body ||
      'Your seller account has been verified on UniMart. Tap the bell icon to view your latest updates and start selling with more trust.',
    createdAt: badgeMessage?.createdAt || new Date().toISOString(),
    read: badgeMessage?.read ?? true,
  };
  const visibleNotifications = notifications.filter((note) => note.type !== 'badge_unlocked');

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
        const items = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.notifications)
          ? res.notifications
          : [];
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

    const onNotificationsUpdate = (e: any) => {
      const detail = e?.detail || {};
      if (typeof detail.increment === 'number' || typeof detail.count === 'number') {
        loadNotifications();
      }
    };

    const onNotificationsOpened = () => {
      loadNotifications();
    };

    window.addEventListener('unimart:notificationCount', onNotificationsUpdate as EventListener);
    window.addEventListener('unimart:notificationOpened', onNotificationsOpened as EventListener);
    loadNotifications();

    return () => {
      mounted = false;
      window.removeEventListener('unimart:notificationCount', onNotificationsUpdate as EventListener);
      window.removeEventListener('unimart:notificationOpened', onNotificationsOpened as EventListener);
    };
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) => prev.map((note) => (note._id === id ? { ...note, read: true } : note)));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="py-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Your notifications</h1>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl">
            Only notifications sent to your account appear here. Verified badge messages are highlighted for sellers.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {badgeDisplay && (
        <section className="rounded-[32px] border border-orange-200 bg-orange-50 p-6 mb-6 shadow-sm">
          <div className="flex gap-4 items-start">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-orange-600 shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.24em] text-orange-700 font-semibold">Verified badge alert</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">Congratulations, seller!</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {badgeDisplay.body}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <span className="rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-orange-700 ring-1 ring-orange-100">Verified Seller</span>
                <span className="rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-100">View details below</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <LoadingSpinner size={40} />
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-100 bg-rose-50 p-6 text-rose-700">{error}</div>
      ) : (
        <div className="space-y-4">
          {visibleNotifications.map((note) => {
            const Icon = ICONS[note.type] || Bell;
            const label = TYPE_LABELS[note.type] || "Notification";

            const handleClickNotification = () => {
              if (!note.read) {
                markAsRead(note._id || note.id);
              }
            };

            return (
              <article
                key={note._id || note.id}
                className={`rounded-3xl border p-5 cursor-pointer transition ${note.read ? 'border-slate-200 bg-white' : 'border-teal-200 bg-teal-50 shadow-sm hover:shadow-md'}`}
                onClick={handleClickNotification}
              >
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
                    <p className="mt-4 text-sm text-slate-700 whitespace-pre-line">{note.body || 'This notification was sent to your account.'}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {!note.read && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(note._id || note.id);
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 transition"
                    >
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
