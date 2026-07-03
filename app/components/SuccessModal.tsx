"use client";

import React from "react";

type Props = {
  userName?: string;
  message?: string;
  type?: "signup" | "login";
  isOpen: boolean;
  onClose: () => void;
};

export default function SuccessModal({ userName = "", message = "", type = "signup", isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="um-modal-backdrop" role="dialog" aria-modal="true">
      <div className="um-modal-card um-anim-pop" style={{ maxWidth: 420, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--um-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
            ✓
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>
              {type === 'signup' ? `Welcome${userName ? `, ${userName}` : ''}!` : 'Welcome back!'}
            </div>
            <div style={{ marginTop: 6, color: 'var(--um-text-2)' }}>{message || (type === 'signup' ? 'Account created successfully.' : 'Logged in successfully.')}</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <button className="um-btn-primary" onClick={onClose}>Continue</button>
        </div>
      </div>

      <style jsx>{`
        .um-modal-backdrop {
          position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.45); z-index: 11000; padding: 20px;
        }
        .um-modal-card { background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.12); }
      `}</style>
    </div>
  );
}
