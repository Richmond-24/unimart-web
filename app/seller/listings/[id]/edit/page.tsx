"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiFetch from '../../../../../lib/apiClient';

export default function SellerListingEdit() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({ title: '', price: '', originalPrice: '', category: '', description: '', stock: '', imageUrls: '', isActive: true });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await apiFetch(`/listings/${id}`);
        if (res?.data && mounted) {
          const l = res.data;
          setForm({
            title: l.title || '',
            price: l.price ?? '',
            originalPrice: l.originalPrice ?? '',
            category: l.category || '',
            description: l.description || '',
            stock: l.stock ?? '',
            imageUrls: (l.imageUrls || []).join(', '),
            isActive: !!l.isActive,
          });
        }
      } catch (e) {
        console.error('Failed to load listing', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        title: form.title,
        price: Number(form.price || 0),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        category: form.category,
        description: form.description,
        stock: form.stock !== '' ? Number(form.stock) : undefined,
        imageUrls: form.imageUrls ? form.imageUrls.split(',').map((s:string)=>s.trim()).filter(Boolean) : [],
        isActive: !!form.isActive,
      };

      const token = typeof window !== 'undefined' ? localStorage.getItem('unimart:token') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await apiFetch(`/listings/${id}`, { method: 'PATCH', body: JSON.stringify(payload), headers });
      // go back to products page
      router.push('/seller/products');
    } catch (e) {
      console.error('Failed to save listing', e);
      alert('Failed to save listing');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit listing</h1>
      <div className="bg-white p-4 rounded shadow space-y-3">
        <label className="block">
          <div className="text-sm font-semibold mb-1">Title</div>
          <input className="w-full p-2 border rounded" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <div className="text-sm font-semibold mb-1">Price</div>
            <input className="w-full p-2 border rounded" value={form.price} onChange={(e)=>setForm({...form,price:e.target.value})} />
          </label>
          <label className="block">
            <div className="text-sm font-semibold mb-1">Original Price</div>
            <input className="w-full p-2 border rounded" value={form.originalPrice} onChange={(e)=>setForm({...form,originalPrice:e.target.value})} />
          </label>
        </div>

        <label className="block">
          <div className="text-sm font-semibold mb-1">Category</div>
          <input className="w-full p-2 border rounded" value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} />
        </label>

        <label className="block">
          <div className="text-sm font-semibold mb-1">Stock</div>
          <input className="w-full p-2 border rounded" value={form.stock} onChange={(e)=>setForm({...form,stock:e.target.value})} />
        </label>

        <label className="block">
          <div className="text-sm font-semibold mb-1">Images (comma separated URLs)</div>
          <input className="w-full p-2 border rounded" value={form.imageUrls} onChange={(e)=>setForm({...form,imageUrls:e.target.value})} />
        </label>

        <label className="block">
          <div className="text-sm font-semibold mb-1">Description</div>
          <textarea className="w-full p-2 border rounded" rows={6} value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} />
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={!!form.isActive} onChange={(e)=>setForm({...form,isActive:e.target.checked})} />
          <span className="text-sm">Active (visible on the app)</span>
        </label>

        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-teal-600 text-white rounded">{saving ? 'Saving...' : 'Save'}</button>
          <button onClick={()=>router.back()} className="px-4 py-2 border rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
}




