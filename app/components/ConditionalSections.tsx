"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function ConditionalSections() {
  const pathname = usePathname();

  // Only render header/footer on the home page
  if (pathname !== "/") return null;

  return (
    <>
      {/* Mobile-only header (hidden on md and larger) */}
      <div className="md:hidden">
        <Header />
      </div>

      {/* Mobile-only footer is already hidden on md+ inside Footer component */}
      <Footer />
    </>
  );
}
