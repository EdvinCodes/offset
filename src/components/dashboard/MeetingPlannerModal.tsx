"use client";

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { X, Calendar, Clock, Copy, Check } from "lucide-react";
import { useCityStore } from "@/store/useCityStore";
import { format, addHours, startOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";

interface MeetingPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MeetingPlannerModal({
  isOpen,
  onClose,
}: MeetingPlannerModalProps) {
  const savedCities = useCityStore((state) => state.savedCities);
  const [baseDate, setBaseDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

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
    let text = `📅 Reunión propuesta: ${format(selectedDate, "dd/MM/yyyy")}\n\n`;

    savedCities.forEach((city) => {
      const cityTime = toZonedTime(selectedDate, city.timezone);
      text += `📍 ${city.name}: ${format(cityTime, "HH:mm")}\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-5xl h-[85vh] bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#27272A] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-[#27272A] shrink-0 bg-white dark:bg-[#18181B] z-20">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                Planificador de Reuniones
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 hidden sm:block">
                Encuentra el hueco perfecto cruzando zonas horarias
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="date"
                value={format(baseDate, "yyyy-MM-dd")}
                onChange={(e) => setBaseDate(new Date(e.target.value))}
                className="bg-zinc-100 dark:bg-[#27272A] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-[#27272A] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-zinc-500" />
            </button>
          </div>
        </div>

        {/* GRID */}
        <div className="flex-1 overflow-auto relative scrollbar-thin">
          <div className="min-w-[1000px] p-6">
            {/* Cabecera de Horas - CAMBIO AQUI: grid-cols-[repeat(24,minmax(0,1fr))] */}
            <div className="flex mb-2 sticky top-0 z-10 bg-white dark:bg-[#18181B] pb-2 shadow-sm">
              <div className="w-48 shrink-0 font-bold text-zinc-400 text-xs uppercase tracking-wider flex items-end pb-2 pl-2">
                Ciudades / Hora Local
              </div>
              <div className="flex-1 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-1">
                {hoursColumns.map((date, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSlot(i)}
                    className={`
                      flex flex-col items-center justify-center py-2 rounded-lg transition-all text-xs font-medium border
                      ${
                        selectedSlot === i
                          ? "bg-indigo-600 text-white border-indigo-600 scale-110 shadow-lg z-10"
                          : "bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }
                    `}
                  >
                    <span>{format(date, "HH")}</span>
                    <span className="opacity-50 text-[10px]">00</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filas de Ciudades */}
            <div className="space-y-3">
              {savedCities.map((city) => (
                <div key={city.id} className="flex items-center group">
                  {/* Info Ciudad */}
                  <div className="w-48 shrink-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      {city.countryCode && (
                        <Image
                          src={`https://flagcdn.com/20x15/${city.countryCode.toLowerCase()}.png`}
                          alt="flag"
                          width={20}
                          height={15}
                          className="w-4 h-3 object-cover rounded-[1px] opacity-70"
                        />
                      )}
                      <span className="font-bold text-zinc-800 dark:text-white truncate">
                        {city.name}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-500 truncate">
                      {city.timezone}
                    </div>
                  </div>

                  {/* Celdas de Hora - CAMBIO AQUI TAMBIEN */}
                  <div className="flex-1 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-1">
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
                            relative h-10 rounded-md flex items-center justify-center text-xs border cursor-pointer transition-all
                            ${getStatusColor(status, isSelected)}
                            ${isSelected ? "ring-2 ring-offset-2 ring-indigo-500 z-10 scale-105" : "hover:opacity-80"}
                          `}
                        >
                          <span className="font-semibold">{hour}</span>
                          {isNewDay && !isSelected && (
                            <span className="absolute -top-2 left-0 text-[8px] bg-indigo-100 dark:bg-indigo-900 text-indigo-600 px-1 rounded">
                              {format(cityTime, "dd MMM", { locale: es })}
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
            <div className="mt-8 flex items-center gap-6 text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30"></div>
                <span>Horario Laboral (09 - 17)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/30"></div>
                <span>Extendido (07-09 / 17-20)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"></div>
                <span>Fuera de oficina</span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        {selectedSlot !== null && (
          <div className="p-4 border-t border-zinc-200 dark:border-[#27272A] bg-zinc-50 dark:bg-[#18181B] flex justify-between items-center animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  Hora seleccionada para la reunión
                </p>
                <p className="text-xs text-zinc-500">
                  Se resaltan las horas en cada ciudad arriba
                </p>
              </div>
            </div>

            <button
              onClick={handleCopySummary}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-lg shadow-indigo-500/20 font-medium text-sm"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "¡Copiado!" : "Copiar Resumen"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
