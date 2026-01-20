import { create } from "zustand";
import { persist } from "zustand/middleware";
import { City } from "@/data/cities";

interface CityStore {
  savedCities: City[];
  addCity: (city: City) => void;
  removeCity: (cityId: string) => void;
}

export const useCityStore = create<CityStore>()(
  persist(
    (set) => ({
      // Empezamos vacíos (o podrías poner New York por defecto)
      savedCities: [],

      addCity: (city) =>
        set((state) => {
          // Evitar duplicados
          if (state.savedCities.find((c) => c.id === city.id)) return state;
          return { savedCities: [...state.savedCities, city] };
        }),

      removeCity: (cityId) =>
        set((state) => ({
          savedCities: state.savedCities.filter((c) => c.id !== cityId),
        })),
    }),
    {
      name: "offset-storage", // Nombre clave para localStorage
    },
  ),
);
