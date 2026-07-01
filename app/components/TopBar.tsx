"use client";

import React from "react";

export default function TopBar() {
  return (
    <div className="w-full bg-teal-50 text-teal-800 border-b border-teal-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between text-sm h-9">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-teal-700" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <strong>UniMart</strong>
            </span>
            <span>Location not set</span>
            <a className="text-teal-700 underline" href="#">Select delivery location</a>
          </div>

          <div className="flex items-center gap-4">
            <a className="hover:underline" href="#">Login</a>
            <a className="hover:underline" href="#">More</a>
            <a className="flex items-center gap-1" href="#">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 3h18v4H3z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Cart
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
