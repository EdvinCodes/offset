"use client";

import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";
import { Sun, Moon, Trash2 } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";

interface ClockCardProps {
  city: string;
  country: string;
  timezone: string;
  now: Date | null;
  isHero?: boolean;
  onDelete?: () => void;
}

export default function ClockCard({
  city,
  country,
  timezone,
  now,
  isHero = false,
  onDelete,
}: ClockCardProps) {
  const { use24HourFormat, showSeconds } = useSettingsStore();

  if (!now) {
    return (
      <div
        className={`bg-[#18181B] border border-[#27272A] rounded-3xl p-6 animate-pulse ${isHero ? "col-span-1 md:col-span-2 h-full" : "h-64"}`}
      >
        <div className="h-6 w-32 bg-[#27272A] rounded mb-4"></div>
        <div className="h-16 w-48 bg-[#27272A] rounded"></div>
      </div>
    );
  }

  const zonedDate = toZonedTime(now, timezone);
  const timeFormat = use24HourFormat ? "HH:mm" : "h:mm";
  const timeString = format(zonedDate, timeFormat);
  const period = use24HourFormat ? "" : format(zonedDate, "aa");
  const secondsString = format(zonedDate, "ss");
  const dateString = format(zonedDate, "EEE, d MMM", { locale: es });

  const localHours = parseInt(format(now, "H"));
  const targetHours = parseInt(format(zonedDate, "H"));
  let diff = targetHours - localHours;
  if (diff > 12) diff -= 24;
  if (diff < -12) diff += 24;

  const offsetString =
    diff === 0 ? "Misma hora" : `${diff > 0 ? "+" : ""}${diff} HRS`;
  const hour = parseInt(format(zonedDate, "H"));
  const isDay = hour >= 6 && hour < 18;

  return (
    <div
      className={`
        relative overflow-hidden group transition-all duration-300
        bg-[#18181B] border border-[#27272A] hover:border-[#6366F1]/50
        /* FIX 1: Padding responsivo (menos padding en móvil) */
        rounded-3xl p-5 sm:p-6 md:p-8 flex flex-col justify-between
        ${isHero ? "col-span-1 md:col-span-2 shadow-2xl shadow-black/80 min-h-[250px] md:h-full" : "h-64 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#6366F1]/10"}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Cabecera */}
      <div className="relative z-10 flex justify-between items-start">
        <div className="overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3">
            <h2
              className={`font-medium text-white truncate ${isHero ? "text-2xl sm:text-3xl md:text-4xl tracking-tight" : "text-xl sm:text-2xl"}`}
            >
              {city}
            </h2>
            {!isHero && diff !== 0 && (
              <span className="text-[10px] sm:text-xs font-bold bg-[#27272A] text-zinc-400 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md border border-zinc-700 whitespace-nowrap">
                {offsetString}
              </span>
            )}
          </div>
          <p className="text-[#A1A1AA] text-xs sm:text-sm font-medium tracking-wider mt-1 uppercase truncate">
            {country}
          </p>
        </div>

        <div className="relative w-8 h-8 flex justify-end shrink-0">
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="absolute inset-0 flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 hover:scale-110"
            >
              <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
          <div
            className={`transition-opacity duration-200 ${onDelete ? "group-hover:opacity-0" : ""}`}
          >
            {isDay ? (
              <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-[#6366F1]" />
            )}
          </div>
        </div>
      </div>

      {/* Hora Modificada */}
      <div className="relative z-10 mt-auto">
        <div className="flex items-baseline font-mono text-white tracking-tighter leading-none whitespace-nowrap">
          {/* FIX 2: Tamaños de fuente responsivos para la hora */}
          <span
            className={`font-bold ${
              isHero
                ? "text-6xl sm:text-7xl md:text-8xl lg:text-9xl"
                : "text-4xl sm:text-5xl md:text-6xl"
            }`}
          >
            {timeString}
          </span>

          {/* FIX 3: Tamaños de fuente responsivos para segundos y AM/PM */}
          {!use24HourFormat && (
            <span
              className={`font-bold ml-1 sm:ml-2 text-[#A1A1AA] ${isHero ? "text-xl sm:text-2xl md:text-3xl" : "text-lg sm:text-xl md:text-2xl"}`}
            >
              {period}
            </span>
          )}

          {showSeconds && (
            <span
              className={`font-medium ml-1 sm:ml-2 text-[#A1A1AA] ${isHero ? "text-xl sm:text-2xl md:text-3xl" : "text-lg sm:text-xl md:text-2xl"}`}
            >
              {secondsString}
            </span>
          )}
        </div>

        <div className="flex justify-between items-end mt-2 sm:mt-4">
          <p className="text-[#A1A1AA] font-medium capitalize text-sm sm:text-lg truncate">
            {dateString}
          </p>
          {isHero && (
            <div className="flex items-center gap-2 bg-[#27272A] px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-zinc-700 shrink-0">
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6366F1] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-[#6366F1]"></span>
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider">
                Tu Ubicación
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
