import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Language } from "@/data/i18n"; // Importar el tipo

interface SettingsState {
  use24HourFormat: boolean;
  showSeconds: boolean;
  language: Language; // <--- Nuevo campo

  toggleFormat: () => void;
  toggleSeconds: () => void;
  setLanguage: (lang: Language) => void; // <--- Nueva acción
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      use24HourFormat: true,
      showSeconds: false,
      language: "es", // Por defecto Español

      toggleFormat: () =>
        set((state) => ({ use24HourFormat: !state.use24HourFormat })),
      toggleSeconds: () =>
        set((state) => ({ showSeconds: !state.showSeconds })),
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: "offset-settings",
    },
  ),
);
