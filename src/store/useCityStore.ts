import { create } from "zustand";
import { persist } from "zustand/middleware";
import { City } from "@/data/cities";

interface CityStore {
  savedCities: City[];
  addCity: (city: City) => void;
  removeCity: (cityId: string) => void;
  reorderCities: (newOrder: City[]) => void;
  // NUEVO: Función para restaurar backup completo
  restoreBackup: (cities: City[]) => void;
}

export const useCityStore = create<CityStore>()(
  persist(
    (set) => ({
      savedCities: [],

      addCity: (city) =>
        set((state) => {
          if (state.savedCities.find((c) => c.id === city.id)) return state;
          return { savedCities: [...state.savedCities, city] };
        }),

      removeCity: (cityId) =>
        set((state) => ({
          savedCities: state.savedCities.filter((c) => c.id !== cityId),
        })),

      reorderCities: (newOrder) =>
        set(() => ({
          savedCities: newOrder,
        })),

      // Simplemente reemplaza el estado actual con el backup
      restoreBackup: (cities) =>
        set(() => ({
          savedCities: cities,
        })),
    }),
    {
      name: "offset-storage",
    },
  ),
);
