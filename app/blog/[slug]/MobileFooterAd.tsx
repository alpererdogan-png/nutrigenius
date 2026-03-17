"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function MobileFooterAd() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between h-[50px] px-3 border-t border-dashed border-[#CBD5E1] bg-[#F8FAFC]">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider leading-none">Advertisement</p>
          <p className="text-[9px] text-[#CBD5E1] mt-0.5">320×50</p>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Close advertisement"
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-[#CBD5E1] hover:text-[#94A3B8] transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
