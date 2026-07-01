
"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiFetch from '../../../lib/apiClient';

const STATUS_CONFIG: Record<string, { label: string; stripe: string; badge: string }> = {
  active:   { label: 'Active',   stripe: '#0F6E56', badge: 'bg-teal-50 text-teal-800' },
  pending:  { label: 'Pending',  stripe: '#B45309', badge: 'bg-amber-50 text-amber-800' },
  inactive: { label: 'Inactive', stripe: '#CBD5E1', badge: 'bg-slate-100 text-slate-500' },
};

function getStatus(p: any) {
  return p.status || 'inactive';
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.inactive;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
      {cfg.label}
    </span>
  );
}

export default function SellerProducts() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [selected, setSelected] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', stock: '1' });
  const [saving, setSaving] = useState(false);
  const [local, setLocal] = useState<any>(null);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('unimart:user') || 'null');
      setUser(u);
      if (!u || u.role !== 'seller') router.push('/');
    } catch {
      router.push('/');
    }
  }, []);

  useEffect(() => { if (user) load(); }, [user]);

  useEffect(() => {
    const fetchFull = async () => {
      if (!selected) return setLocal(null);
      if (selected._type === 'listing') {
        try {
          const res = await apiFetch(`/listings/${selected._id}`);
          if (res?.data) setLocal({ ...res.data, _type: 'listing' });
          else setLocal({ ...selected });
        } catch (e) { setLocal({ ...selected }); }
      } else {
        setLocal({ ...selected });
      }
    };
    fetchFull();
  }, [selected]);

  const load = async () => {
    try {
      const [prodRes, sellerRes] = await Promise.allSettled([
        apiFetch('/products/mine'),
        apiFetch('/sellers/me'),
      ]);
      let prods: any[] = [];
      if (prodRes.status === 'fulfilled' && prodRes.value?.data)
        prods = prods.concat(prodRes.value.data.map((p: any) => ({ ...p, _type: 'product' })));
      if (sellerRes.status === 'fulfilled' && sellerRes.value?.data) {
        const listings = sellerRes.value.data.products || [];
        prods = prods.concat(listings.map((l: any) => ({
          _id: l._id || l.id, name: l.title || l.name,
          price: l.price, status: l.status, views: l.views, _type: 'listing',
        })));
      }
      setProducts(prods);
    } catch (e) { console.error(e); }
  };

  const handleCreate = async () => {
    try {
      const payload = {
        name: form.name, title: form.name, description: form.description,
        price: Number(form.price || 0), category: form.category, stock: Number(form.stock || 1),
      };
      await apiFetch('/products', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
      await load();
      setForm({ name: '', description: '', price: '', category: '', stock: '1' });
      setCreateOpen(false);
    } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    if (!local) return;
    setSaving(true);
    try {
      const endpoint = local._type === 'product' ? `/products/${local._id}` : `/listings/${local._id}`;
      await apiFetch(endpoint, { method: 'PATCH', body: JSON.stringify(local), headers: { 'Content-Type': 'application/json' } });
      await load();
      setSelected(null);
      setEditMode(false);
    } catch { alert('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, type: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      try { await apiFetch(`/products/${id}`, { method: 'DELETE' }); }
      catch { await apiFetch(`/listings/${id}`, { method: 'DELETE' }); }
      await load();
      setSelected(null);
    } catch { alert('Delete failed'); }
  };

  const visible = filter === 'all' ? products : products.filter(p => getStatus(p) === filter);
  const totalViews = products.reduce((a, p) => a + (p.views || 0), 0);
  const avgPrice = products.length ? Math.round(products.reduce((a, p) => a + (p.price || 0), 0) / products.length) : 0;

  if (user === null) return (
    <div className="min-h-screen bg-slate-50 animate-pulse">
      <div className="fixed top-0 left-0 right-0 z-40 bg-teal-700 px-6 py-4">
        <div className="h-6 bg-teal-600 w-32 rounded" />
      </div>
      <div className="h-[76px]" />
      <div className="grid grid-cols-4 gap-3 px-6 py-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-white rounded-xl border border-slate-200" />
        ))}
      </div>
      <div className="px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-white rounded-xl border border-slate-200" />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-teal-700 border-b border-teal-800 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/seller/dashboard')}
            className="w-9 h-9 rounded-full bg-teal-600 hover:bg-teal-500 flex items-center justify-center text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold text-white">Products</h1>
            <p className="text-sm text-teal-100">Manage your listings and inventory</p>
          </div>
        </div>
        <button
          onClick={() => {
            try {
              const base = process.env.NEXT_PUBLIC_EXTERNAL_LISTING || 'https://unimart-listing.vercel.app';
              const sellerId = user?._id || user?.id || '';
              const backend = (process.env.NEXT_PUBLIC_BACKEND_URL || (typeof window !== 'undefined' ? window.location.origin : ''));
              const callback = encodeURIComponent(`${backend.replace(/\/$/, '')}/api/webhooks/external-listing`);
              const url = `${base}?sellerId=${encodeURIComponent(sellerId)}&callbackUrl=${callback}`;
              window.open(url, '_blank');
            } catch (e) {
              setCreateOpen(true);
            }
          }}
          className="flex items-center gap-2 bg-white hover:bg-teal-50 text-teal-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          New product
        </button>
      </div>

      {/* Spacer to offset the fixed header's height so content isn't hidden underneath it */}
      <div className="h-[76px]" />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 px-6 py-5">
        {[
          { label: 'Total products', value: products.length },
          { label: 'Active', value: products.filter(p => getStatus(p) === 'active').length },
          { label: 'Total views', value: totalViews },
          { label: 'Avg. price', value: `₵${avgPrice}` },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className="text-2xl font-semibold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between px-6 mb-3">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">All products</p>
        <div className="flex gap-2">
          {['all', 'active', 'pending', 'inactive'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                filter === f
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-6 pb-12">
        {visible.length === 0 && (
          <div className="col-span-3 text-center py-16 text-slate-400">
            <div className="text-4xl mb-2">📦</div>
            <p className="text-sm">No products here yet</p>
          </div>
        )}
        {visible.map(p => {
          const status = getStatus(p);
          const stripe = STATUS_CONFIG[status]?.stripe || '#CBD5E1';
          return (
            <div
              key={p._id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors cursor-pointer"
              onClick={() => { setSelected(p); setEditMode(false); }}
            >
              {/* Status stripe */}
              <div style={{ height: 3, background: stripe }} />

              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-slate-900 leading-snug">{p.name || p.title}</p>
                  <StatusBadge status={status} />
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">
                  {p.description || 'No description provided.'}
                </p>

                {/* Meta row */}
                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                  {[
                    { label: 'Price', value: `₵${p.price ?? '—'}` },
                    { label: 'Views', value: p.views ?? 0 },
                    { label: 'Sold', value: p.sold ?? 0 },
                  ].map(m => (
                    <div key={m.label}>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">{m.label}</p>
                      <p className="text-sm font-semibold text-slate-800">{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 px-4 py-2 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={e => { e.stopPropagation(); setSelected(p); setEditMode(false); }}
                  className="flex-1 text-xs text-slate-600 border border-slate-200 bg-white rounded-lg py-1.5 hover:bg-slate-50 transition-colors"
                >
                  View
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setSelected(p); setEditMode(true); }}
                  className="flex-1 text-xs text-white bg-teal-700 rounded-lg py-1.5 hover:bg-teal-800 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(p._id, p._type); }}
                  className="flex-1 text-xs text-red-600 border border-red-100 bg-white rounded-lg py-1.5 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail / Edit Drawer */}
      {selected && local && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => { setSelected(null); setEditMode(false); }}>
          <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>

            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">{editMode ? 'Edit product' : 'Product details'}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditMode(m => !m)}
                  className="text-sm text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50"
                >
                  {editMode ? 'Cancel' : 'Edit'}
                </button>
                <button
                  onClick={() => { setSelected(null); setEditMode(false); }}
                  className="text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg px-2 py-1.5"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Status stripe */}
            <div style={{ height: 3, background: STATUS_CONFIG[getStatus(selected)]?.stripe || '#CBD5E1' }} />

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Images */}
              <div>
                {local.imageUrls && local.imageUrls.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {local.imageUrls.map((src: string, i: number) => (
                      <img key={i} src={src} alt={`${local.title || local.name} ${i+1}`} className="w-32 h-32 object-cover rounded-lg border border-slate-100" />
                    ))}
                  </div>
                ) : (
                  <div className="w-full rounded-lg bg-slate-50 border border-slate-100 h-36 flex items-center justify-center text-slate-400">No images</div>
                )}
              </div>

              {/* Seller card + quick stats */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{local.title || local.name}</p>
                  <p className="text-xs text-slate-500">{local.brand ? `${local.brand} · ${local.condition || ''}` : (local.condition || '')}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 rounded-lg px-3 py-2">
                    <p className="text-sm font-semibold">{selected.views ?? 0}</p>
                    <p className="text-[11px] text-slate-400">Views</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg px-3 py-2">
                    <p className="text-sm font-semibold">{selected.sales ?? selected.sold ?? 0}</p>
                    <p className="text-[11px] text-slate-400">Sold</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg px-3 py-2">
                    <p className="text-sm font-semibold">{local.stock ?? '—'}</p>
                    <p className="text-[11px] text-slate-400">Stock</p>
                  </div>
                </div>
              </div>

              {/* Seller info */}
              <div className="bg-white border border-slate-100 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-2">Seller information</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{local.sellerName || local.businessName || '—'}</p>
                    <p className="text-xs text-slate-500">{local.userType ? local.userType.charAt(0).toUpperCase() + local.userType.slice(1) : ''}</p>
                  </div>
                  <div className="text-sm text-slate-700">
                    <div>{local.sellerEmail || local.contactEmail || '—'}</div>
                    <div className="text-xs text-slate-400">{local.sellerPhone || local.contactPhone || ''}</div>
                  </div>
                </div>
              </div>

              {/* Tags & metadata */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Category</p>
                  <div className="text-sm border border-slate-100 bg-slate-50 rounded-lg px-3 py-2">{local.category || local.subcategory || '—'}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Price</p>
                    <div className="text-lg font-semibold">₵{local.price ?? '—'}</div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Condition</p>
                    <div className="text-sm border border-slate-100 bg-slate-50 rounded-lg px-3 py-2">{local.condition || '—'}</div>
                  </div>
                </div>

                {local.tags && local.tags.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Tags</p>
                    <div className="flex gap-2 flex-wrap">
                      {local.tags.map((t: string, i: number) => (
                        <div key={i} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">{t}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specs */}
                {local.specs && Object.keys(local.specs).length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Specifications</p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-700">
                      {Object.entries(local.specs).map(([k, v]: any) => (
                        <div key={k} className="flex items-center gap-2">
                          <div className="text-xs text-slate-400 w-28">{k}</div>
                          <div className="font-medium">{v || '—'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delivery & payment */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Delivery</p>
                    <div className="text-sm border border-slate-100 bg-slate-50 rounded-lg px-3 py-2">{local.deliveryType || 'self'}</div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Payment</p>
                    <div className="text-sm border border-slate-100 bg-slate-50 rounded-lg px-3 py-2">{local.paymentMethod || 'mtn'}</div>
                  </div>
                </div>

                {/* Extra fields */}
                <div>
                  <p className="text-xs text-slate-500 mb-1">Website / Contact</p>
                  <div className="text-sm text-slate-700">{local.website || local.contactEmail || '—'}</div>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-1">Description</p>
                  {editMode ? (
                    <textarea rows={4} value={local.description || ''} onChange={e => setLocal({ ...local, description: e.target.value })}
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-600 resize-none" />
                  ) : (
                    <div className="text-sm border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-slate-700 leading-relaxed min-h-[60px]">{local.description || 'No description provided.'}</div>
                  )}
                </div>

                {local.dimensions && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Dimensions</p>
                    <div className="text-sm">{`${local.dimensions.width || '—'} x ${local.dimensions.height || '—'} x ${local.dimensions.depth || '—'} ${local.dimensions.unit || ''}`}</div>
                  </div>
                )}

                {local.adminNotes && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Admin notes</p>
                    <div className="text-sm text-slate-700">{local.adminNotes}</div>
                  </div>
                )}

                <div className="text-xs text-slate-400">Submitted: {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : '—'}</div>
              </div>
            </div>

            {/* Drawer footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-slate-200">
              <button
                onClick={() => {
                  try {
                    const frontend = process.env.NEXT_PUBLIC_FRONTEND_URL || (typeof window !== 'undefined' ? window.location.origin : '');
                    const url = `${frontend.replace(/\/$/, '')}/listings/${selected._id}`;
                    window.open(url, '_blank');
                  } catch (e) { /* ignore */ }
                }}
                className="flex-1 bg-white border border-slate-200 text-slate-700 text-sm font-medium py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                View public listing
              </button>
              {editMode && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              )}
              <button
                onClick={() => handleDelete(selected._id, selected._type)}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setCreateOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">New product</h2>
              <button onClick={() => setCreateOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Product name</label>
                  <input placeholder="e.g. Engineering Textbook" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-600" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Price (₵)</label>
                  <input type="number" placeholder="0.00" value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-600" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Category</label>
                  <input placeholder="e.g. Books" value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-600" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Stock quantity</label>
                  <input type="number" placeholder="1" value={form.stock}
                    onChange={e => setForm({ ...form, stock: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-600" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Description</label>
                <textarea rows={3} placeholder="Describe your product…" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-600 resize-none" />
              </div>
            </div>
            <div className="px-6 pb-5 flex gap-3">
              <button onClick={handleCreate}
                className="flex-1 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
                Create product
              </button>
              <button onClick={() => setCreateOpen(false)}
                className="flex-1 border border-slate-200 text-slate-600 text-sm py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, editing, onChange, type = 'text' }: {
  label: string; value: any; editing: boolean; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      {editing ? (
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-600" />
      ) : (
        <div className="text-sm border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-slate-700">
          {value || '—'}
        </div>
      )}
    </div>
  );
}