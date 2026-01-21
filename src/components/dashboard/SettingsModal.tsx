"use client";

import { useEffect, useRef } from "react";
import { X, Clock, Zap, Moon, Sun, Download, Upload } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useCityStore } from "@/store/useCityStore";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { use24HourFormat, showSeconds, toggleFormat, toggleSeconds } =
    useSettingsStore();
  const { savedCities, restoreBackup } = useCityStore();
  const { theme, setTheme } = useTheme();

  const { setLanguage } = useSettingsStore();
  const { t, language } = useTranslation();

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // --- FUNCIÓN EXPORTAR ---
  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(savedCities, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `offset-backup-${new Date().toISOString().slice(0, 10)}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      // TRADUCCIÓN: Éxito
      toast.success(t.exportSuccess);
    } catch {
      // TRADUCCIÓN: Error
      toast.error(t.exportError);
    }
  };

  // --- FUNCIÓN IMPORTAR (VERSIÓN ROBUSTA) ---
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files.length > 0) {
      fileReader.readAsText(e.target.files[0], "UTF-8");

      fileReader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          if (!content) return;

          const json = JSON.parse(content);

          if (Array.isArray(json)) {
            // Validamos que al menos tenga las propiedades básicas para no romper la store
            restoreBackup(json);
            toast.success(t.importSuccess, {
              description: t.importSuccessDesc,
            });
            onClose();
          } else {
            toast.error(t.invalidFile, {
              description: t.invalidFileDesc,
            });
          }
        } catch {
          // Si el JSON.parse falla (archivo corrupto o no es JSON)
          toast.error(t.readError, {
            description: t.readErrorDesc,
          });
        }
      };
      e.target.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#27272A] rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            {t.settings}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900 dark:text-[#A1A1AA] dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* SECCIÓN 1: APARIENCIA */}
          <div>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
              {t.appearance}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTheme("light")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${theme === "light" ? "bg-indigo-50 border-indigo-500 text-indigo-700" : "border-zinc-200 dark:border-[#27272A] text-zinc-500"}`}
              >
                <Sun className="w-4 h-4" />
                <span className="text-sm font-medium">{t.light}</span>
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${theme === "dark" ? "bg-[#27272A] border-[#6366F1] text-white" : "border-zinc-200 dark:border-[#27272A] text-zinc-500"}`}
              >
                <Moon className="w-4 h-4" />
                <span className="text-sm font-medium">{t.dark}</span>
              </button>
            </div>
          </div>

          {/* SECCIÓN: IDIOMA (Con los 4 botones) */}
          <div>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
              {t.language}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {/* ESPAÑOL */}
              <button
                onClick={() => setLanguage("es")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                  language === "es"
                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300"
                    : "border-zinc-200 dark:border-[#27272A] text-zinc-500"
                }`}
              >
                <span className="text-lg">🇪🇸</span>
                <span className="text-sm font-medium">Español</span>
              </button>

              {/* INGLÉS */}
              <button
                onClick={() => setLanguage("en")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                  language === "en"
                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300"
                    : "border-zinc-200 dark:border-[#27272A] text-zinc-500"
                }`}
              >
                <span className="text-lg">🇬🇧</span>
                <span className="text-sm font-medium">English</span>
              </button>

              {/* FRANCÉS */}
              <button
                onClick={() => setLanguage("fr")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                  language === "fr"
                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300"
                    : "border-zinc-200 dark:border-[#27272A] text-zinc-500"
                }`}
              >
                <span className="text-lg">🇫🇷</span>
                <span className="text-sm font-medium">Français</span>
              </button>

              {/* ALEMÁN */}
              <button
                onClick={() => setLanguage("de")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                  language === "de"
                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300"
                    : "border-zinc-200 dark:border-[#27272A] text-zinc-500"
                }`}
              >
                <span className="text-lg">🇩🇪</span>
                <span className="text-sm font-medium">Deutsch</span>
              </button>
            </div>
          </div>

          {/* SECCIÓN 2: PREFERENCIAS */}
          <div>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
              {t.clock}
            </h3>
            <div className="space-y-2">
              {/* Toggle 24h */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-[#09090B] border border-zinc-200 dark:border-[#27272A]">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#6366F1]" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                    {t.format24}
                  </span>
                </div>
                <button
                  onClick={toggleFormat}
                  className={`w-10 h-5 rounded-full transition-colors relative ${use24HourFormat ? "bg-[#6366F1]" : "bg-zinc-300 dark:bg-[#27272A]"}`}
                >
                  <div
                    className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${use24HourFormat ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </div>

              {/* Toggle Segundos */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-[#09090B] border border-zinc-200 dark:border-[#27272A]">
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                    {t.seconds}
                  </span>
                </div>
                <button
                  onClick={toggleSeconds}
                  className={`w-10 h-5 rounded-full transition-colors relative ${showSeconds ? "bg-[#6366F1]" : "bg-zinc-300 dark:bg-[#27272A]"}`}
                >
                  <div
                    className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${showSeconds ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: DATOS (Backup) */}
          <div>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
              {t.data}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExport}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-zinc-200 dark:border-[#27272A] hover:bg-zinc-50 dark:hover:bg-[#27272A] transition-colors group"
              >
                <Download className="w-5 h-5 text-zinc-500 group-hover:text-[#6366F1]" />
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {t.export}
                </span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-zinc-200 dark:border-[#27272A] hover:bg-zinc-50 dark:hover:bg-[#27272A] transition-colors group"
              >
                <Upload className="w-5 h-5 text-zinc-500 group-hover:text-[#6366F1]" />
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {t.import}
                </span>
              </button>
              {/* Input invisible para subir archivo */}
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleImport}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
