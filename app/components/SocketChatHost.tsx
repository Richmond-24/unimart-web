"use client";

import React, { useEffect, useState } from "react";
import SocketChat from "./SocketChat";

export default function SocketChatHost() {
  const [conv, setConv] = useState<any | null>(null);

  useEffect(() => {
    const onOpen = (e: any) => {
      const detail = e?.detail || e;
      setConv(detail);
    };

    window.addEventListener('unimart:openChat', onOpen as any);
    return () => window.removeEventListener('unimart:openChat', onOpen as any);
  }, []);

  if (!conv) return null;

  return (
    <SocketChat conv={conv} onClose={() => setConv(null)} />
  );
}
