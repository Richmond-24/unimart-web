"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AuthFlow from "../AuthFlow";

export default function AuthPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        <AuthFlow onDone={(role) => {
          if (role === 'seller') return router.replace('/seller/dashboard');
          return router.replace('/');
        }} />
      </div>
    </div>
  );
}
