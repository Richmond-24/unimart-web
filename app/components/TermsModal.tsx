"use client";

import React, { useEffect } from "react";

export default function TermsModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative max-w-3xl w-full mx-4 bg-white rounded-2xl shadow-2xl overflow-auto max-h-[85vh] z-10">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-bold">Terms &amp; Conditions</h2>
            <button onClick={onClose} className="text-stone-500 hover:text-stone-700">
              ✕
            </button>
          </div>

          <div className="mt-4 space-y-4 text-sm text-stone-700">
            <p>
              Welcome to UniMart. These Terms &amp; Conditions ("Terms") govern your access to and use of the UniMart
              web and mobile experiences (the "Service") operated by UniMart. By using the Service you agree to be bound
              by these Terms. If you do not agree, do not use the Service.
            </p>

            <h3 className="font-semibold">1. Who can use UniMart</h3>
            <p>
              UniMart is intended for use by university students and campus communities. You must be 16+ (or the
              minimum legal age in your jurisdiction) to create an account. You agree to provide accurate information
              when creating an account and to keep your account credentials secure.
            </p>

            <h3 className="font-semibold">2. Marketplace Rules</h3>
            <p>
              UniMart connects buyers and sellers on campus. When listing items, sellers must honestly describe the
              condition, price and any defects. Prohibited items (illegal goods, weapons, stolen property, or items
              that violate campus rules) are not allowed. Buyers and sellers are responsible for verifying identity,
              arranging payment and delivery, and complying with local laws.
            </p>

            <h3 className="font-semibold">3. Payments and Fees</h3>
            <p>
              UniMart may surface payment or fulfillment options but is not the payment processor unless otherwise
              stated. Users are responsible for payment processing fees charged by third parties.
            </p>

            <h3 className="font-semibold">4. Safety, Disputes, and Reviews</h3>
            <p>
              We encourage safe meetups in public spaces. UniMart may provide safety tips but is not responsible for
              personal injury, property damage, or disputes arising from transactions. Users should try to resolve
              disputes directly; reports can be submitted to UniMart for moderation.
            </p>

            <h3 className="font-semibold">5. Content and Conduct</h3>
            <p>
              Users retain ownership of the content they post, but by posting you grant UniMart a license to display
              that content. Do not post abusive, harassing, defamatory, or infringing material.
            </p>

            <h3 className="font-semibold">6. Privacy</h3>
            <p>
              Our Privacy Policy explains how we collect and use personal information. By using UniMart you consent to
              the collection, use and sharing of data as described in that policy.
            </p>

            <h3 className="font-semibold">7. Limitation of Liability</h3>
            <p>
              To the fullest extent permitted by law, UniMart and its affiliates are not liable for indirect, incidental,
              special, exemplary or consequential damages arising out of your use of the Service.
            </p>

            <h3 className="font-semibold">8. Changes to These Terms</h3>
            <p>
              We may modify these Terms. When changes are material, we will provide notice. Continued use of the
              Service after changes implies acceptance of the updated Terms.
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 bg-teal-600 text-white rounded-lg">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
