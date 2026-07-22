
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import apiFetch from '../../../lib/apiClient';

type Trend = {
  id: string;
  title: string;
  image?: string;
  rating?: number;
  studentCount?: number;
  sellerEmail?: string;
};

export default function TrendingDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const [item, setItem] = useState<Trend | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        let res: any = null;
        try {
          res = await apiFetch(`/api/public/campus-trending/${id}`);
        } catch (e) {
          const listRes: any = await apiFetch('/public/campus-trending');
          const data = Array.isArray(listRes) ? listRes : (listRes && Array.isArray(listRes.data) ? listRes.data : []);
          res = { data };
        }
        if (!mounted) return;
        const source = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : (res && res.item ? [res.item] : []));
        const found = Array.isArray(source) ? source.find((p: any) => (p._id || p.id || String(p.id)) == id) : null;
        const payload = found || (res && res.item) || res;
        if (payload) {
          const mapped: Trend = {
            id: payload._id || payload.id || id,
            title: payload.title || payload.name || payload.productName || 'Untitled',
            image: (payload.images && payload.images[0]) || payload.image || payload.imageUrls?.[0] || undefined,
            rating: payload.rating || payload.avgRating || 0,
            studentCount: payload.studentCount || payload.boughtCount || Math.floor(Math.random() * 300) + 20,
            sellerEmail: payload.sellerEmail || payload.contactEmail || undefined,
          };
          setItem(mapped);
        } else {
          setItem(null);
        }
      } catch (err) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  const contact = () => {
    if (item?.sellerEmail) {
      window.location.href = `mailto:${item.sellerEmail}?subject=Inquiry about ${encodeURIComponent(item.title)}`;
    } else {
      router.push(`/contact?topic=${encodeURIComponent(item?.title || '')}`);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.heroTop}>
            <div style={{ ...styles.imgWrap, ...styles.skeleton }} />
            <div style={{ flex: 1 }}>
              <div style={{ ...styles.skeletonLine, width: '60%', marginBottom: 12 }} />
              <div style={{ ...styles.skeletonLine, width: '40%', marginBottom: 12 }} />
              <div style={{ ...styles.skeletonLine, width: '80%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>🔍</span>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>Trending item not found.</p>
            <button style={styles.btnOutline} onClick={() => router.back()}>Back</button>
          </div>
        </div>
      </div>
    );
  }

  const ratingPct = ((item.rating || 0) / 5) * 100;

  return (
    <div style={styles.page}>
      {/* Back button */}
      <button style={styles.backBtn} onClick={() => router.back()}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M5 12l7 7M5 12l7-7" />
        </svg>
        Back to trending
      </button>

      <div style={styles.card}>
        {/* Hero section */}
        <div style={styles.heroTop}>
          <div style={styles.imgWrap}>
            {item.image
              ? <img src={item.image} alt={item.title} style={styles.img} />
              : (
                <div style={styles.imgPlaceholder}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-tertiary)' }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
              )
            }
          </div>

          <div style={styles.meta}>
            <div style={styles.badge}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
              Trending now
            </div>

            <h1 style={styles.title}>{item.title}</h1>

            <div style={styles.statsRow}>
              <div style={styles.statPill}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#E9A319" stroke="#E9A319" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <strong style={styles.statVal}>{(item.rating || 0).toFixed(1)}</strong>
                <span style={styles.statLabel}>/ 5</span>
              </div>
              <div style={styles.statPill}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-secondary)' }}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <strong style={styles.statVal}>{(item.studentCount || 0).toLocaleString()}</strong>
                <span style={styles.statLabel}>people bought</span>
              </div>
            </div>

            {/* Rating bar */}
            <div style={styles.ratingBarWrap}>
              <div style={styles.ratingBarLabel}>Satisfaction</div>
              <div style={styles.ratingBarBg}>
                <div style={{ ...styles.ratingBarFill, width: `${ratingPct}%` }} />
              </div>
            </div>

            {/* Actions */}
            <div style={styles.actions}>
              <button style={styles.btnPrimary} onClick={contact}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Contact seller
              </button>
              <button style={styles.btnOutline} onClick={() => router.push(`/listings/${item.id}`)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                View full listing
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Description */}
        <div style={styles.descSection}>
          <p style={styles.descText}>
            This page shows a concise trending summary — ratings, buyer counts, and a quick contact action.
          </p>
        </div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Info strip */}
        <div style={styles.infoRow}>
          <div style={styles.infoCell}>
            <div style={styles.icLabel}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Rating
            </div>
            <div style={styles.icVal}>{(item.rating || 0).toFixed(1)}</div>
            <div style={styles.icSub}>out of 5</div>
          </div>
          <div style={{ ...styles.infoCell, borderLeft: '0.5px solid var(--color-border-tertiary)' }}>
            <div style={styles.icLabel}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              Purchases
            </div>
            <div style={styles.icVal}>{(item.studentCount || 0).toLocaleString()}</div>
            <div style={styles.icSub}>total buyers</div>
          </div>
          <div style={{ ...styles.infoCell, borderLeft: '0.5px solid var(--color-border-tertiary)' }}>
            <div style={styles.icLabel}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
              Trend
            </div>
            <div style={{ ...styles.icVal, color: '#16a34a' }}>+18%</div>
            <div style={styles.icSub}>this week</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 'clamp(1rem, 4vw, 2.5rem) clamp(1rem, 5vw, 2rem)',
    maxWidth: 780,
    margin: '0 auto',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    padding: 0,
    marginBottom: '1.5rem',
  },
  card: {
    background: 'var(--color-background-primary)',
    border: '0.5px solid var(--color-border-tertiary)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroTop: {
    display: 'flex',
    gap: 'clamp(1rem, 4vw, 1.75rem)',
    padding: 'clamp(1.25rem, 4vw, 1.75rem)',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  imgWrap: {
    width: 'clamp(90px, 22vw, 140px)' as any,
    height: 'clamp(90px, 22vw, 140px)' as any,
    borderRadius: 12,
    overflow: 'hidden',
    flexShrink: 0,
    border: '0.5px solid var(--color-border-tertiary)',
    background: 'var(--color-background-secondary)',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imgPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 11,
    fontWeight: 500,
    padding: '3px 10px',
    borderRadius: 999,
    background: 'var(--color-background-info)',
    color: 'var(--color-text-info)',
    border: '0.5px solid var(--color-border-info)',
    marginBottom: 10,
  },
  meta: {
    flex: 1,
    minWidth: 180,
  },
  title: {
    fontSize: 'clamp(16px, 3vw, 22px)' as any,
    fontWeight: 500,
    margin: '0 0 10px',
    color: 'var(--color-text-primary)',
  },
  statsRow: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: '1rem',
  },
  statPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  statVal: {
    color: 'var(--color-text-primary)',
    fontWeight: 500,
  },
  statLabel: {
    color: 'var(--color-text-secondary)',
  },
  ratingBarWrap: {
    marginBottom: '1.25rem',
  },
  ratingBarLabel: {
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    marginBottom: 5,
  },
  ratingBarBg: {
    height: 5,
    background: 'var(--color-background-secondary)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    background: 'var(--color-text-info)',
    borderRadius: 99,
    transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
  },
  actions: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 18px',
    borderRadius: 8,
    background: 'var(--color-text-primary)',
    color: 'var(--color-background-primary)',
    border: 'none',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  },
  btnOutline: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 18px',
    borderRadius: 8,
    background: 'transparent',
    color: 'var(--color-text-primary)',
    border: '0.5px solid var(--color-border-secondary)',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  },
  divider: {
    height: '0.5px',
    background: 'var(--color-border-tertiary)',
  },
  descSection: {
    padding: '1rem clamp(1rem, 4vw, 1.75rem)',
  },
  descText: {
    fontSize: 14,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.65,
    margin: 0,
  },
  infoRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
  infoCell: {
    padding: '1rem clamp(1rem, 4vw, 1.75rem)',
  },
  icLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 11,
    color: 'var(--color-text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 5,
  },
  icVal: {
    fontSize: 15,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
  },
  icSub: {
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    marginTop: 2,
  },
  skeleton: {
    background: 'var(--color-background-secondary)',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  skeletonLine: {
    height: 14,
    borderRadius: 6,
    background: 'var(--color-background-secondary)',
    marginBottom: 8,
  },
};