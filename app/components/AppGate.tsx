"use client";

import React, { useEffect, useState } from 'react';

export default function AppGate({ children }: { children: React.ReactNode }) {
  // Previously the app gated rendering until initialization completed. To
  // avoid pages disappearing while the app runs background init, render
  // children immediately and keep any splash/overlay logic in
  // AppInitializer instead.
  return <>{children}</>;
}
