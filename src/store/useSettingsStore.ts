import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Language } from "@/data/i18n"; // Importar el tipo

interface SettingsState {
  use24HourFormat: boolean;
  showSeconds: boolean;
  language: Language;

  businessStart: number;
  businessEnd: number;

  extendedStart: number;
  extendedEnd: number;

  toggleFormat: () => void;
  toggleSeconds: () => void;
  setLanguage: (lang: Language) => void;

  setBusinessHours: (start: number, end: number) => void;

  setExtendedHours: (start: number, end: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      use24HourFormat: true,
      showSeconds: false,
      language: "es", // Por defecto Español

      businessStart: 9,
      businessEnd: 17,

      extendedStart: 7,
      extendedEnd: 20,

      toggleFormat: () =>
        set((state) => ({ use24HourFormat: !state.use24HourFormat })),
      toggleSeconds: () =>
        set((state) => ({ showSeconds: !state.showSeconds })),
      setLanguage: (lang) => set({ language: lang }),

      // Lógica para actualizar las horas
      setBusinessHours: (start, end) =>
        set({ businessStart: start, businessEnd: end }),

      setExtendedHours: (start, end) =>
        set({ extendedStart: start, extendedEnd: end }),
    }),

    {
      name: "offset-settings",
    },
  ),
);
