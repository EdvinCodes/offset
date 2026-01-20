import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  use24HourFormat: boolean;
  showSeconds: boolean;
  toggleFormat: () => void;
  toggleSeconds: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      use24HourFormat: true, // Por defecto 24h (ej: 14:00)
      showSeconds: true, // Por defecto mostramos segundos

      toggleFormat: () =>
        set((state) => ({ use24HourFormat: !state.use24HourFormat })),
      toggleSeconds: () =>
        set((state) => ({ showSeconds: !state.showSeconds })),
    }),
    {
      name: "offset-settings",
    },
  ),
);
