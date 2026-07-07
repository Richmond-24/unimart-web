"use client";

import React, { useEffect, useState } from 'react';
import RiriChat from './RiriChat';

export default function RiriHost() {
  const [open, setOpen] = useState<any | null>(null);

  useEffect(() => {
    const onOpen = (e: any) => {
      const detail = e?.detail || {};
      setOpen(detail);
    };

    window.addEventListener('unimart:openRiri', onOpen as any);
    return () => window.removeEventListener('unimart:openRiri', onOpen as any);
  }, []);

  if (!open) return null;

  return <RiriChat onClose={() => setOpen(null)} init={open} />;
}
