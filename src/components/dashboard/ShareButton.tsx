"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { useCityStore } from "@/store/useCityStore";
import { generateShareUrl } from "@/lib/share";

export default function ShareButton() {
  const savedCities = useCityStore((state) => state.savedCities);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = generateShareUrl(savedCities);
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#27272A] flex items-center justify-center text-zinc-500 dark:text-[#A1A1AA] hover:text-[#6366F1] dark:hover:text-white hover:border-[#6366F1] transition-all group shadow-sm active:scale-95"
      title="Compartir configuración"
    >
      {copied ? (
        <Check className="w-5 h-5 text-emerald-500" />
      ) : (
        <Share2 className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
      )}
    </button>
  );
}
