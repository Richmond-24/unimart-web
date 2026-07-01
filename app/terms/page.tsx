import React from "react";

export default function Page() {
  return (
    <main className="min-h-screen py-12">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow">
        <h1 className="text-2xl font-bold mb-4">Terms & Conditions</h1>

        <p className="text-sm text-stone-600 mb-4">
          Welcome to UniMart. These Terms & Conditions ("Terms") govern your access to and use of the UniMart web
          and mobile experiences (the "Service") operated by UniMart. By using the Service you agree to be bound by
          these Terms. If you do not agree, do not use the Service.
        </p>

        <h2 className="text-lg font-semibold mt-4">1. Who can use UniMart</h2>
        <p className="text-sm text-stone-600 mb-3">
          UniMart is intended for use by university students and campus communities. You must be 16+ (or the minimum
          legal age in your jurisdiction) to create an account. You agree to provide accurate information when creating
          an account and to keep your account credentials secure.
        </p>

        <h2 className="text-lg font-semibold mt-4">2. Marketplace Rules</h2>
        <p className="text-sm text-stone-600 mb-3">
          UniMart connects buyers and sellers on campus. When listing items, sellers must honestly describe the
          condition, price and any defects. Prohibited items (illegal goods, weapons, stolen property, or items that
          violate campus rules) are not allowed. Buyers and sellers are responsible for verifying identity, arranging
          payment and delivery, and complying with local laws.
        </p>

        <h2 className="text-lg font-semibold mt-4">3. Payments and Fees</h2>
        <p className="text-sm text-stone-600 mb-3">
          UniMart may surface payment or fulfillment options but is not the payment processor unless otherwise
          stated. Users are responsible for payment processing fees charged by third parties. UniMart does not
          guarantee payment or delivery — transactions are between users unless a UniMart service is clearly
          identified.
        </p>

        <h2 className="text-lg font-semibold mt-4">4. Safety, Disputes, and Reviews</h2>
        <p className="text-sm text-stone-600 mb-3">
          We encourage safe meetups in public spaces. UniMart may provide safety tips but is not responsible for
          personal injury, property damage, or disputes arising from transactions. Users should try to resolve
          disputes directly; reports can be submitted to UniMart for moderation.
        </p>

        <h2 className="text-lg font-semibold mt-4">5. Content and Conduct</h2>
        <p className="text-sm text-stone-600 mb-3">
          Users retain ownership of the content they post, but by posting you grant UniMart a license to display that
          content. Do not post abusive, harassing, defamatory, or infringing material. UniMart may remove content
          that violates these Terms or community guidelines.
        </p>

        <h2 className="text-lg font-semibold mt-4">6. Privacy</h2>
        <p className="text-sm text-stone-600 mb-3">
          Our Privacy Policy explains how we collect and use personal information. By using UniMart you consent to
          the collection, use and sharing of data as described in that policy.
        </p>

        <h2 className="text-lg font-semibold mt-4">7. Limitation of Liability</h2>
        <p className="text-sm text-stone-600 mb-3">
          To the fullest extent permitted by law, UniMart and its affiliates are not liable for indirect, incidental,
          special, exemplary or consequential damages arising out of your use of the Service.
        </p>

        <h2 className="text-lg font-semibold mt-4">8. Changes to These Terms</h2>
        <p className="text-sm text-stone-600 mb-6">
          We may modify these Terms. When changes are material, we will provide notice. Continued use of the
          Service after changes implies acceptance of the updated Terms.
        </p>

        <p className="text-sm text-stone-500">If you have questions about these Terms, please contact support@unimart.example</p>
      </div>
    </main>
  );
}
