"use client";

import { RotateCcw } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation"; // 1. IMPORTAR HOOK

interface TimeSliderProps {
  offsetMinutes: number;
  onChange: (minutes: number) => void;
  onReset: () => void;
}

export function TimeSlider({
  offsetMinutes,
  onChange,
  onReset,
}: TimeSliderProps) {
  const { t } = useTranslation(); // 2. USAR HOOK

  // Convertir minutos totales a formato legible (ej: +2h 30m)
  const formatOffset = (mins: number) => {
    if (mins === 0) return t.now; // "Ahora" / "Now"
    const h = Math.floor(Math.abs(mins) / 60);
    const m = Math.abs(mins) % 60;
    const sign = mins > 0 ? "+" : "-";
    return `${sign}${h}h ${m > 0 ? `${m}m` : ""}`;
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-md">
      <div className="bg-white/90 dark:bg-[#18181B]/90 backdrop-blur-md border border-zinc-200 dark:border-[#27272A] p-4 rounded-2xl shadow-2xl flex flex-col gap-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {t.timeTravel} {/* "VIAJE EN EL TIEMPO" */}
          </span>
          <span
            className={`text-sm font-mono font-bold ${offsetMinutes !== 0 ? "text-indigo-600 dark:text-[#6366F1]" : "text-zinc-900 dark:text-white"}`}
          >
            {formatOffset(offsetMinutes)}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* El Slider */}
          <input
            type="range"
            min={-720} // -12 horas
            max={720} // +12 horas
            step={15} // Saltos de 15 mins
            value={offsetMinutes}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 bg-zinc-200 dark:bg-[#27272A] rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500"
          />

          {/* Botón Reset (solo visible si hay offset) */}
          <button
            onClick={onReset}
            disabled={offsetMinutes === 0}
            className={`p-2 rounded-full transition-all ${
              offsetMinutes === 0
                ? "opacity-0 pointer-events-none w-0 p-0"
                : "bg-zinc-100 dark:bg-[#27272A] text-zinc-600 dark:text-white hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
            }`}
            title={t.resetTime} // "Volver a ahora"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
