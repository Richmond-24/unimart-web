"use client";

import React, { Suspense } from "react";
import MessagesClient from "./MessagesClient";

export const dynamic = "force-dynamic";

export default function SellerMessagesPage() {
  return (
    <Suspense fallback={<div>Loading messages…</div>}>
      <MessagesClient />
    </Suspense>
  );
}
