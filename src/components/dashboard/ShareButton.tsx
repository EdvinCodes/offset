"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { useCityStore } from "@/store/useCityStore";
import { generateShareUrl } from "@/lib/share";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation"; // 1. IMPORTAR HOOK

export default function ShareButton() {
  const { t } = useTranslation(); // 2. USAR HOOK
  const savedCities = useCityStore((state) => state.savedCities);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = generateShareUrl(savedCities);
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);

      // --- 3. USAR TRADUCCIONES EN TOAST ---
      toast.success(t.shareCopied, {
        description: t.shareDesc,
        icon: "🔗",
      });

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
      // Usamos nueva clave de error
      toast.error(t.shareError);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#27272A] flex items-center justify-center text-zinc-500 dark:text-[#A1A1AA] hover:text-[#6366F1] dark:hover:text-white hover:border-[#6366F1] transition-all group shadow-sm active:scale-95"
      title={t.shareTitle} // 4. TÍTULO TRADUCIDO
    >
      {copied ? (
        <Check className="w-5 h-5 text-emerald-500" />
      ) : (
        <Share2 className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
      )}
    </button>
  );
}
