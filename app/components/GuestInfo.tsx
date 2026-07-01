"use client";

import React from "react";

export default function GuestInfo({
  onContinueGuest,
  onSignup,
  onClose,
}: {
  onContinueGuest: () => void;
  onSignup: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-white/30 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">Guest</h3>
            <p className="text-sm text-slate-500 mt-1">Browse now without an account.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold text-slate-800 mb-2">Features you can enjoy</h4>
            <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
              <li>Browse products and categories</li>
              <li>View product images, prices, and descriptions</li>
              <li>Search and filter listings</li>
              <li>Save items locally (temporary)</li>
              <li>View public seller information</li>
            </ul>
          </div>

          <div className="p-4 bg-rose-50 rounded-lg">
            <h4 className="font-semibold text-slate-800 mb-2">Limitations as a guest</h4>
            <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
              <li>Can't place orders or checkout</li>
              <li>Can't save persistent carts or wishlists</li>
              <li>Can't leave verified reviews</li>
              <li>No order history or tracking</li>
              <li>No personalized recommendations</li>
            </ul>
          </div>
        </div>

        <div className="mb-4 text-sm text-slate-600">
          <p>
            Create an account for checkout, orders, and saved items.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSignup}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg"
          >
            Create Account
          </button>

          <button
            onClick={onContinueGuest}
            className="flex-1 py-3 px-4 border border-slate-200 text-slate-700 rounded-xl font-medium bg-white hover:bg-slate-50"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
