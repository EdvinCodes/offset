"use client";

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { X, Calendar, Clock, Copy, Check, Globe } from "lucide-react";
import { useCityStore } from "@/store/useCityStore";
// 1. IMPORTAMOS EL TIPO 'Locale' AQUÍ
import { format, addHours, startOfDay, type Locale } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

// Importar locales
import { es, enUS, fr, de } from "date-fns/locale";

interface MeetingPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MeetingPlannerModal({
  isOpen,
  onClose,
}: MeetingPlannerModalProps) {
  const { t, language } = useTranslation();
  const savedCities = useCityStore((state) => state.savedCities);
  const [baseDate, setBaseDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // 2. CORREGIDO: Usamos Record<string, Locale> en lugar de 'any'
  const dateLocales: Record<string, Locale> = { es, en: enUS, fr, de };

  const currentLocale = dateLocales[language] || es;

  const hasCities = savedCities.length > 0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const hoursColumns = useMemo(() => {
    const start = startOfDay(baseDate);
    return Array.from({ length: 24 }, (_, i) => addHours(start, i));
  }, [baseDate]);

  const getTimeStatus = (hour: number) => {
    if (hour >= 9 && hour < 17) return "business";
    if ((hour >= 7 && hour < 9) || (hour >= 17 && hour < 20)) return "stretch";
    return "night";
  };

  const getStatusColor = (status: string, isSelected: boolean) => {
    if (status === "business")
      return isSelected
        ? "bg-emerald-500 text-white"
        : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
    if (status === "stretch")
      return isSelected
        ? "bg-amber-500 text-white"
        : "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30";
    return isSelected
      ? "bg-zinc-600 text-white"
      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700";
  };

  const handleCopySummary = () => {
    if (selectedSlot === null) return;
    const selectedDate = hoursColumns[selectedSlot];

    // TRADUCCIÓN: 'proposedMeeting'
    let text = `📅 ${t.proposedMeeting || "Reunión"}: ${format(selectedDate, "dd/MM/yyyy")}\n\n`;

    savedCities.forEach((city) => {
      const cityTime = toZonedTime(selectedDate, city.timezone);
      text += `📍 ${city.name}: ${format(cityTime, "HH:mm")}\n`;
    });

    navigator.clipboard.writeText(text);

    // TRADUCCIÓN: 'summaryCopied'
    toast.success(t.summaryCopied, {
      description: t.summaryCopiedDesc,
      icon: "📋",
    });

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-5xl h-auto max-h-[92vh] sm:h-[85vh] bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#27272A] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-zinc-200 dark:border-[#27272A] shrink-0 bg-white dark:bg-[#18181B] z-50 gap-4 sm:gap-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white leading-tight">
                {t.plannerTitle}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 hidden sm:block">
                {t.plannerSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {hasCities && (
              <div className="relative flex-1 sm:flex-none">
                <input
                  type="date"
                  value={format(baseDate, "yyyy-MM-dd")}
                  onChange={(e) => setBaseDate(new Date(e.target.value))}
                  className="w-full sm:w-auto bg-zinc-100 dark:bg-[#27272A] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-[#27272A] rounded-lg transition-colors shrink-0"
            >
              <X className="w-5 h-5 text-zinc-500" />
            </button>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {hasCities ? (
          /* --- MODO NORMAL --- */
          <>
            <div className="flex-1 overflow-auto relative scrollbar-thin bg-white dark:bg-[#18181B]">
              <div className="min-w-[800px] sm:min-w-[1000px] p-4 sm:p-6">
                {/* Cabecera Sticky */}
                <div className="flex mb-2 sticky top-0 z-50 bg-white dark:bg-[#18181B] pb-2 shadow-sm border-b border-zinc-100 dark:border-zinc-800/50">
                  <div className="w-32 sm:w-48 shrink-0 font-bold text-zinc-400 text-[10px] sm:text-xs uppercase tracking-wider flex items-end pb-2 pl-2 truncate">
                    {t.citiesLocalTime} {/* TRADUCCIÓN */}
                  </div>
                  <div className="flex-1 grid grid-cols-[repeat(24,minmax(0,1fr))]">
                    {hoursColumns.map((date, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedSlot(i)}
                        className={`
                          mx-[1px]
                          flex flex-col items-center justify-center py-2 rounded-lg transition-all text-[10px] sm:text-xs font-medium border
                          ${
                            selectedSlot === i
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-lg z-10"
                              : "bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          }
                        `}
                      >
                        <span>{format(date, "HH")}</span>
                        <span className="opacity-50 text-[8px] sm:text-[10px]">
                          00
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filas */}
                <div className="space-y-2 sm:space-y-3">
                  {savedCities.map((city) => (
                    <div
                      key={city.id}
                      className="flex items-center group relative"
                    >
                      <div className="w-32 sm:w-48 shrink-0 pr-2 sm:pr-4 sticky left-0 bg-white dark:bg-[#18181B] z-40 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900/50 transition-colors rounded-l-lg shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] py-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
                          {city.countryCode && (
                            <Image
                              src={`https://flagcdn.com/20x15/${city.countryCode.toLowerCase()}.png`}
                              alt="flag"
                              width={20}
                              height={15}
                              className="w-3.5 h-2.5 sm:w-4 sm:h-3 object-cover rounded-[1px] opacity-70 shrink-0"
                            />
                          )}
                          <span className="font-bold text-sm sm:text-base text-zinc-800 dark:text-white truncate">
                            {city.name}
                          </span>
                        </div>
                        <div className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-500 truncate pl-5 sm:pl-6">
                          {city.timezone}
                        </div>
                      </div>

                      <div className="flex-1 grid grid-cols-[repeat(24,minmax(0,1fr))]">
                        {hoursColumns.map((baseHour, i) => {
                          const cityTime = toZonedTime(baseHour, city.timezone);
                          const hour = parseInt(format(cityTime, "H"));
                          const status = getTimeStatus(hour);
                          const isSelected = selectedSlot === i;
                          const isNewDay = hour === 0;

                          return (
                            <div
                              key={i}
                              onClick={() => setSelectedSlot(i)}
                              className={`
                                mx-[1px]
                                relative h-9 sm:h-10 rounded-md flex items-center justify-center text-xs border cursor-pointer transition-all
                                ${getStatusColor(status, isSelected)}
                                ${
                                  isSelected
                                    ? "ring-2 ring-indigo-500 z-10"
                                    : "hover:opacity-80 z-0"
                                }
                              `}
                            >
                              <span className="font-semibold">{hour}</span>
                              {isNewDay && !isSelected && (
                                <span className="absolute -top-2.5 left-0 text-[8px] sm:text-[9px] bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-100 px-1.5 py-0.5 rounded-full font-bold shadow-sm whitespace-nowrap z-20 pointer-events-none">
                                  {/* FECHA LOCALE DINÁMICA */}
                                  {format(cityTime, "dd MMM", {
                                    locale: currentLocale,
                                  })}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Leyenda */}
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 pt-4 bg-white dark:bg-[#18181B] sticky bottom-0 z-30 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30"></div>
                    <span>{t.business} (09 - 17)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/30"></div>
                    <span>{t.extended} (07-09 / 17-20)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"></div>
                    <span>{t.offHours}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            {selectedSlot !== null && (
              <div className="p-4 border-t border-zinc-200 dark:border-[#27272A] bg-zinc-50 dark:bg-[#18181B] flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 animate-in slide-in-from-bottom-5 shrink-0 z-50">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white line-clamp-1">
                      {t.selectedTime}
                    </p>
                    <p className="text-xs text-zinc-500 line-clamp-1">
                      {t.checkLocal}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCopySummary}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-lg shadow-indigo-500/20 font-medium text-sm active:scale-95"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? t.copied : t.copySummary}
                </button>
              </div>
            )}
          </>
        ) : (
          /* --- EMPTY STATE --- */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-[#27272A] flex items-center justify-center mb-6">
              <Globe className="w-10 h-10 text-zinc-400" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
              {t.noCities}
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-8">
              {t.noCitiesDesc}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/20"
            >
              {t.back}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
