"use client";

import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";
import { Sun, Moon } from "lucide-react";

interface ClockCardProps {
  city: string;
  country: string;
  timezone: string;
  now: Date | null;
  isHero?: boolean;
}

export default function ClockCard({
  city,
  country,
  timezone,
  now,
  isHero = false,
}: ClockCardProps) {
  // Skeleton Loader con tus colores
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
  const timeString = format(zonedDate, "HH:mm");
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
        /* AQUI: Usamos EXACTAMENTE tus colores Zinc 900 (#18181B) y borde Zinc 800 (#27272A) */
        bg-[#18181B] border border-[#27272A] hover:border-[#6366F1]/50
        rounded-3xl p-8 flex flex-col justify-between
        ${isHero ? "col-span-1 md:col-span-2 shadow-2xl shadow-black/80 h-full" : "h-64 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#6366F1]/10"}
      `}
    >
      {/* Efecto Glow Indigo solo al hacer hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Cabecera */}
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <h2
              className={`font-medium text-white ${isHero ? "text-4xl tracking-tight" : "text-2xl"}`}
            >
              {city}
            </h2>
            {!isHero && diff !== 0 && (
              <span className="text-xs font-bold bg-[#27272A] text-zinc-400 px-2 py-1 rounded-md border border-zinc-700">
                {offsetString}
              </span>
            )}
          </div>
          <p className="text-[#A1A1AA] text-sm font-medium tracking-wider mt-1 uppercase">
            {country}
          </p>
        </div>

        {isDay ? (
          <Sun className="w-6 h-6 text-amber-400" />
        ) : (
          <Moon className="w-6 h-6 text-[#6366F1]" />
        )}
      </div>

      {/* Hora */}
      <div className="relative z-10 mt-auto">
        <div className="flex items-baseline font-mono text-white tracking-tighter leading-none">
          <span
            className={`${isHero ? "text-8xl md:text-9xl font-bold" : "text-6xl font-semibold"}`}
          >
            {timeString}
          </span>
          <span
            className={`text-[#A1A1AA] ml-2 font-medium ${isHero ? "text-3xl" : "text-2xl"}`}
          >
            {secondsString}
          </span>
        </div>

        <div className="flex justify-between items-end mt-4">
          <p className="text-[#A1A1AA] font-medium capitalize text-lg">
            {dateString}
          </p>
          {isHero && (
            <div className="flex items-center gap-2 bg-[#27272A] px-3 py-1.5 rounded-full border border-zinc-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6366F1] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6366F1]"></span>
              </span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Tu Ubicación
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
