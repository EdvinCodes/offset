"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
// 1. Importar Locale type
import { format, type Locale } from "date-fns";
import { toZonedTime } from "date-fns-tz";
// 2. Importar locales soportados
import { es, enUS, fr, de } from "date-fns/locale";
import {
  Sun,
  Moon,
  Trash2,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Loader2,
} from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useTranslation } from "@/hooks/useTranslation"; // 3. Hook traducción

interface ClockCardProps {
  city: string;
  country: string;
  timezone: string;
  now: Date | null;
  lat?: number;
  lng?: number;
  countryCode?: string;
  isHero?: boolean;
  onDelete?: () => void;
}

export default function ClockCard({
  city,
  country,
  timezone,
  now,
  lat,
  lng,
  countryCode,
  isHero = false,
  onDelete,
}: ClockCardProps) {
  const { t, language } = useTranslation(); // 4. Usar hook
  const { use24HourFormat, showSeconds } = useSettingsStore();
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(
    null,
  );
  const [loadingWeather, setLoadingWeather] = useState(false);

  // 5. Configurar locale dinámico
  const dateLocales: Record<string, Locale> = { es, en: enUS, fr, de };
  const currentLocale = dateLocales[language] || es;

  // FETCH CLIMA
  useEffect(() => {
    if (!lat || !lng) return;

    const fetchWeather = async () => {
      setLoadingWeather(true);
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&timezone=auto`,
        );
        const data = await res.json();
        if (data.current) {
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            code: data.current.weather_code,
          });
        }
      } catch (e) {
        console.error("Error clima", e);
      } finally {
        setLoadingWeather(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 1000 * 60 * 30);
    return () => clearInterval(interval);
  }, [lat, lng]);

  const getWeatherIcon = (code: number) => {
    if (code <= 1) return <Sun className="w-4 h-4 text-amber-500" />;
    if (code <= 3) return <Cloud className="w-4 h-4 text-zinc-400" />;
    if (code <= 48) return <CloudFog className="w-4 h-4 text-zinc-400" />;
    if (code <= 67) return <CloudRain className="w-4 h-4 text-blue-400" />;
    if (code <= 77) return <CloudSnow className="w-4 h-4 text-cyan-200" />;
    if (code <= 99)
      return <CloudLightning className="w-4 h-4 text-purple-400" />;
    return <Sun className="w-4 h-4 text-zinc-400" />;
  };

  if (!now) {
    return (
      <div
        className={`bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#27272A] rounded-3xl p-6 animate-pulse ${isHero ? "col-span-1 md:col-span-2 h-full" : "h-64"}`}
      />
    );
  }

  const zonedDate = toZonedTime(now, timezone);
  const timeFormat = use24HourFormat ? "HH:mm" : "h:mm";
  const timeString = format(zonedDate, timeFormat);
  const period = use24HourFormat ? "" : format(zonedDate, "aa");
  const secondsString = format(zonedDate, "ss");
  // 6. Usar currentLocale para la fecha
  const dateString = format(zonedDate, "EEE, d MMM", { locale: currentLocale });

  const localHours = parseInt(format(now, "H"));
  const targetHours = parseInt(format(zonedDate, "H"));
  let diff = targetHours - localHours;
  if (diff > 12) diff -= 24;
  if (diff < -12) diff += 24;

  // 7. Usar traducción para "Local"
  const offsetString =
    diff === 0 ? t.localTime : `${diff > 0 ? "+" : ""}${diff}h`;
  const hour = parseInt(format(zonedDate, "H"));
  const isDay = hour >= 6 && hour < 18;

  return (
    <div
      className={`
        relative overflow-hidden group transition-all duration-300
        bg-white dark:bg-[#18181B] 
        border border-zinc-200 dark:border-[#27272A]
        shadow-sm hover:shadow-md dark:shadow-none
        hover:border-zinc-300 dark:hover:border-[#6366F1]/50
        rounded-3xl p-5 sm:p-6 md:p-8 flex flex-col justify-between
        ${isHero ? "col-span-1 md:col-span-2 min-h-[250px] md:h-full shadow-lg dark:shadow-none" : "h-64 hover:-translate-y-1"}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* --- CABECERA --- */}
      <div className="relative z-10 flex justify-between items-start">
        <div className="overflow-hidden flex-1">
          <div className="flex items-center gap-2 sm:gap-3">
            <h2
              className={`font-bold text-zinc-900 dark:text-white truncate ${isHero ? "text-2xl sm:text-3xl md:text-4xl tracking-tight" : "text-xl sm:text-2xl"}`}
            >
              {city}
            </h2>

            {/* TAG DIFERENCIA HORARIA */}
            {!isHero && diff !== 0 && (
              <span className="text-[10px] sm:text-xs font-bold bg-zinc-100 dark:bg-[#27272A] text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md border border-zinc-200 dark:border-zinc-700 whitespace-nowrap">
                {offsetString}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            {countryCode && (
              <Image
                src={`https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`}
                alt={countryCode}
                width={24}
                height={18}
                className="w-4 h-3 object-cover rounded-[1px]"
              />
            )}
            <p className="text-zinc-500 dark:text-[#A1A1AA] text-xs sm:text-sm font-medium tracking-wider uppercase truncate">
              {country}
            </p>
          </div>
        </div>

        {/* --- WIDGET CLIMA --- */}
        <div className="flex flex-col items-end gap-1">
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-zinc-300 dark:text-zinc-700 hover:text-red-500 dark:hover:text-red-500 transition-colors p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {weather ? (
            <div className="flex items-center gap-1.5 mt-1 bg-zinc-50 dark:bg-white/5 px-2 py-1 rounded-full border border-zinc-100 dark:border-white/5">
              {getWeatherIcon(weather.code)}
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {weather.temp}°
              </span>
            </div>
          ) : loadingWeather ? (
            <Loader2 className="w-4 h-4 animate-spin text-zinc-300" />
          ) : null}
        </div>
      </div>

      {/* --- RELOJ --- */}
      <div className="relative z-10 mt-auto">
        <div className="flex items-baseline font-mono text-zinc-900 dark:text-white tracking-tighter leading-none whitespace-nowrap">
          <span
            className={`font-bold ${isHero ? "text-6xl sm:text-7xl md:text-8xl lg:text-9xl" : "text-4xl sm:text-5xl md:text-6xl"}`}
          >
            {timeString}
          </span>
          {!use24HourFormat && (
            <span
              className={`font-bold ml-1 sm:ml-2 text-zinc-400 dark:text-[#A1A1AA] ${isHero ? "text-xl sm:text-2xl md:text-3xl" : "text-lg sm:text-xl md:text-2xl"}`}
            >
              {period}
            </span>
          )}
          {showSeconds && (
            <span
              className={`font-medium ml-1 sm:ml-2 text-zinc-400 dark:text-[#A1A1AA] ${isHero ? "text-xl sm:text-2xl md:text-3xl" : "text-lg sm:text-xl md:text-2xl"}`}
            >
              {secondsString}
            </span>
          )}
        </div>

        <div className="flex justify-between items-end mt-2 sm:mt-4">
          <p className="text-zinc-500 dark:text-[#A1A1AA] font-medium capitalize text-sm sm:text-lg truncate">
            {dateString}
          </p>

          <div className="opacity-50 group-hover:opacity-100 transition-opacity">
            {isDay ? (
              <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500/80" />
            ) : (
              <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500/80" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
