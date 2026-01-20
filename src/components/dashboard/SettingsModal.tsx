"use client";

import { useEffect } from "react";
import { X, Clock, Zap } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { use24HourFormat, showSeconds, toggleFormat, toggleSeconds } =
    useSettingsStore();

  // Cerrar con ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Ventana */}
      <div className="relative w-full max-w-md bg-[#18181B] border border-[#27272A] rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Configuración</h2>
          <button
            onClick={onClose}
            className="text-[#A1A1AA] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Opción 1: Formato 24h */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#09090B] border border-[#27272A]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#27272A] rounded-lg text-[#6366F1]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-medium">Formato 24 Horas</p>
                <p className="text-xs text-[#A1A1AA]">
                  {use24HourFormat ? "Ejemplo: 14:30" : "Ejemplo: 02:30 PM"}
                </p>
              </div>
            </div>
            {/* Toggle Switch Casero */}
            <button
              onClick={toggleFormat}
              className={`w-12 h-6 rounded-full transition-colors relative ${use24HourFormat ? "bg-[#6366F1]" : "bg-[#27272A]"}`}
            >
              <div
                className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${use24HourFormat ? "translate-x-6" : "translate-x-0"}`}
              />
            </button>
          </div>

          {/* Opción 2: Segundos */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#09090B] border border-[#27272A]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#27272A] rounded-lg text-amber-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-medium">Mostrar Segundos</p>
                <p className="text-xs text-[#A1A1AA]">
                  Mayor precisión, mayor consumo.
                </p>
              </div>
            </div>
            <button
              onClick={toggleSeconds}
              className={`w-12 h-6 rounded-full transition-colors relative ${showSeconds ? "bg-[#6366F1]" : "bg-[#27272A]"}`}
            >
              <div
                className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${showSeconds ? "translate-x-6" : "translate-x-0"}`}
              />
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-[#52525B]">
          offset. v0.2.0 — Local Browser Time
        </div>
      </div>
    </div>
  );
}
