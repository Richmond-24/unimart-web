"use client";

import { useEffect } from "react";

export default function ListingsLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Zero out header/footer height CSS vars so the product detail page
    // has no padding-top gap (the header is hidden on listing pages).
    const root = document.documentElement;
    const prevHeader = root.style.getPropertyValue("--header-height");
    const prevFooter = root.style.getPropertyValue("--footer-height");
    root.style.setProperty("--header-height", "0px");
    root.style.setProperty("--footer-height", "0px");
    return () => {
      root.style.setProperty("--header-height", prevHeader || "");
      root.style.setProperty("--footer-height", prevFooter || "");
    };
  }, []);

  return (
    <div className="listing-full-bleed w-full max-w-none px-0 -mx-4 sm:-mx-6 lg:-mx-8">
      {children}
    </div>
  );
}
