
"use client";

import React, { useEffect, useState } from "react";

export default function CommentsSection({ listingId }: { listingId: string }) {
  const storageKey = `unimart:comments:${listingId}`;
  const [comments, setComments] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);

  // Load comments from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setComments(JSON.parse(raw));
    } catch (e) {
      setComments([]);
    }
  }, [storageKey]);

  // Save comments to localStorage
  function saveComments(list: any[]) {
    setComments(list);
    try {
      localStorage.setItem(storageKey, JSON.stringify(list));
    } catch (e) {}
  }

  // Add a new comment
  function addComment() {
    if (!text.trim()) return;
    const newComment = {
      id: Date.now(),
      name: name.trim() || "Anonymous",
      text: text.trim(),
      rating,
      createdAt: new Date().toISOString(),
    };
    const updated = [newComment, ...comments];
    saveComments(updated);
    // Reset form and close it
    setName("");
    setText("");
    setRating(5);
    setShowForm(false);
  }

  // Cancel / close form
  function cancelForm() {
    setName("");
    setText("");
    setRating(5);
    setShowForm(false);
  }

  return (
    <div className="w-full max-w-full px-0 sm:px-2">
      {/* Toggle Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Write a review
        </button>
      )}

      {/* Expandable Form */}
      {showForm && (
        <div className="mt-4 bg-white rounded-2xl shadow-lg border border-gray-100 p-5 transition-all duration-300">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              />
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full sm:w-24 px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} ★
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your experience or ask a question..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
            />
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={cancelForm}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={addComment}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-md transition"
              >
                Post review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="mt-6 space-y-4">
        {comments.length === 0 && (
          <div className="text-center text-sm text-gray-500 py-8 bg-gray-50 rounded-xl">
            No reviews yet — be the first to review this item.
          </div>
        )}
        {comments.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 transition hover:shadow-md"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {(c.name || "A")
                    .split(" ")
                    .map((s: string) => s[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">
                    {c.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
              <div className="text-amber-500 text-sm flex gap-0.5">
                {Array.from({ length: c.rating }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
                {Array.from({ length: 5 - c.rating }).map((_, i) => (
                  <span key={i} className="text-gray-300">
                    ★
                  </span>
                ))}
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed mt-2">
              {c.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}