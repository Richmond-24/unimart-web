"use client";

import React, { useEffect, useState } from "react";
import apiFetch from "../../lib/apiClient";

export type ReactionType = "up" | null;
export type EmojiReaction = { icon: string; label: string; count: number };

const DEFAULT_EMOJIS: EmojiReaction[] = [
  { icon: "🔥", label: "Fire", count: 0 },
  { icon: "💯", label: "Must have", count: 0 },
  { icon: "😍", label: "Love it", count: 0 },
  { icon: "🤔", label: "Unsure", count: 0 },
  { icon: "💰", label: "Good deal", count: 0 },
];

function normalizeEmojis(raw: any): EmojiReaction[] {
  if (Array.isArray(raw)) {
    return raw.map((r, i) => ({ icon: (r && r.icon) || DEFAULT_EMOJIS[i]?.icon || "", label: (r && r.label) || DEFAULT_EMOJIS[i]?.label || "", count: Number((r && r.count) || 0) }));
  }
  const out = DEFAULT_EMOJIS.map((d) => ({ ...d }));
  if (raw && typeof raw === 'object') {
    Object.keys(raw).forEach((k) => {
      const idx = Number(k);
      if (!Number.isNaN(idx) && out[idx]) out[idx].count = Number(raw[k]) || 0;
    });
  }
  return out;
}

interface Props {
  subjectType?: string; // e.g. "listings" or "sections"
  subjectId: string;
  fetchBase?: string; // optional override for fetch endpoint base
  className?: string;
}

export default function ReactionSection({ subjectType = "listings", subjectId, fetchBase, className }: Props) {
  const [myVote, setMyVote] = useState<ReactionType>(null);
  const [ups, setUps] = useState<number>(0);
  const [emojis, setEmojis] = useState<EmojiReaction[]>(() => normalizeEmojis(DEFAULT_EMOJIS));
  const [myEmoji, setMyEmoji] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const base = fetchBase || `/${subjectType}/${subjectId}`;

  useEffect(() => {
    let mounted = true;
    const fetchReactions = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('unimart:token') : null;
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await apiFetch(`/public${base}/reactions`, { headers });
        if (!mounted) return;
        if (res?.data) {
          setUps(res.data.up || 0);
          if (res.data.emojis) setEmojis(normalizeEmojis(res.data.emojis));
          if (res.data.userVote) setMyVote(res.data.userVote);
          if (res.data.userEmoji !== undefined) setMyEmoji(res.data.userEmoji);
        }
      } catch (err) {
        console.error('ReactionSection: failed to fetch', err);
      }
    };
    fetchReactions();
    return () => { mounted = false; };
  }, [subjectType, subjectId, fetchBase]);

  const vote = async () => {
    if (isLoading) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('unimart:token') : null;
    if (!token) { try { window.dispatchEvent(new Event('unimart:requireAuth')); } catch (e) {} ; return; }
    setIsLoading(true);
    try {
      const prev = myVote;
      let newUps = ups;
      if (prev === 'up') {
        newUps = Math.max(0, newUps - 1);
        setMyVote(null);
      } else {
        newUps = newUps + 1;
        setMyVote('up');
      }
      setUps(newUps);

      const headers: any = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
      const serverVote = prev === 'up' ? 'remove' : 'up';
      const res = await apiFetch(`${base}/vote`, {
        method: 'POST', body: JSON.stringify({ vote: serverVote }), headers,
      });
      if (res?.data) {
        setUps(res.data.up || 0);
        if (res.data.userVote !== undefined) setMyVote(res.data.userVote);
      }
    } catch (err) {
      console.error('ReactionSection: failed to submit vote', err);
    } finally { setIsLoading(false); }
  };

  const reactEmoji = async (i: number) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('unimart:token') : null;
      if (!token) { try { window.dispatchEvent(new Event('unimart:requireAuth')); } catch (e) {} ; setIsLoading(false); return; }
      const prev = myEmoji;
      const newEmojis = emojis.map((em) => ({ ...em }));
      if (prev === i) {
        newEmojis[i].count = Math.max(0, (newEmojis[i].count || 0) - 1);
        setMyEmoji(null);
      } else {
        if (prev !== null && newEmojis[prev]) newEmojis[prev].count = Math.max(0, (newEmojis[prev].count || 0) - 1);
        newEmojis[i].count = (newEmojis[i].count || 0) + 1;
        setMyEmoji(i);
      }
      setEmojis(newEmojis);

      const headers: any = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
      const res = await apiFetch(`${base}/emoji`, {
        method: 'POST', body: JSON.stringify({ emojiIndex: i }), headers,
      });
      if (res?.data) {
        if (res.data.emojis) setEmojis(normalizeEmojis(res.data.emojis));
        if (res.data.userEmoji !== undefined) setMyEmoji(res.data.userEmoji);
      }
    } catch (err) {
      console.error('ReactionSection: failed to submit emoji', err);
    } finally { setIsLoading(false); }
  };

  return (
    <div className={className}>
      <style>{`
        .rs-container { display:flex; flex-direction:column; gap:12px; }
        .rs-up { display:flex; align-items:center; gap:12px; }
        .rs-vote-btn { display:flex; align-items:center; gap:8px; padding:8px 12px; border-radius:10px; border:1px solid #e2e8f0; background:#fff; cursor:pointer; }
        .rs-vote-btn.rs-on { background:#e6ffef; border-color:#16a34a; color:#16a34a; }
        .rs-em-row { display:flex; flex-wrap:wrap; gap:8px; }
        .rs-em-btn { padding:8px 12px; border-radius:999px; border:1px solid #e2e8f0; background:#fff; cursor:pointer; }
        .rs-em-btn.rs-on { background:#e6ffef; border-color:#16a34a; color:#16a34a; }
      `}</style>

      <div className="rs-container">
        <div className="rs-up">
          <button className={`rs-vote-btn ${myVote === 'up' ? 'rs-on' : ''}`} onClick={vote} disabled={isLoading} aria-label="Upvote">
            <svg viewBox="0 0 24 24" width="18" height="18" fill={myVote === 'up' ? '#16a34a' : 'none'} stroke={myVote === 'up' ? '#16a34a' : 'currentColor'} strokeWidth="1.3"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>
            <strong>{ups > 0 ? ups.toLocaleString() : '0'}</strong>
          </button>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700 }}>Rate this section</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Was this helpful?</div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>How are you feeling?</div>
          <div className="rs-em-row">
            {emojis.map((e, i) => (
              <button key={i} className={`rs-em-btn ${myEmoji === i ? 'rs-on' : ''}`} onClick={() => reactEmoji(i)} disabled={isLoading}>
                <span style={{ marginRight: 8 }}>{e.icon}</span>
                <span style={{ marginRight: 8 }}>{e.label}</span>
                <strong>{e.count}</strong>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
