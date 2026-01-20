import { create } from "zustand";
import { persist } from "zustand/middleware";
import { City } from "@/data/cities";

interface CityStore {
  savedCities: City[];
  addCity: (city: City) => void;
  removeCity: (cityId: string) => void;
  // NUEVO: Función para reordenar
  reorderCities: (newOrder: City[]) => void;
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

      // Implementación simple: recibimos el array ya ordenado y lo guardamos
      reorderCities: (newOrder) =>
        set(() => ({
          savedCities: newOrder,
        })),
    }),
    {
      name: "offset-storage",
    },
  ),
);
