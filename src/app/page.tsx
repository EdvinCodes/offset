"use client";

import { useState, useEffect } from "react";
import { useTime } from "@/hooks/useTime";
import ClockCard from "@/components/dashboard/ClockCard";
import SearchModal from "@/components/dashboard/SearchModal";
import SettingsModal from "@/components/dashboard/SettingsModal";
import { Logo } from "@/components/ui/Logo";
import { INITIAL_CITIES, City } from "@/data/cities";
import { useCityStore } from "@/store/useCityStore";
import { Plus } from "lucide-react";

export default function Home() {
  const now = useTime();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { savedCities, removeCity } = useCityStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const [heroCity, setHeroCity] = useState<City>(INITIAL_CITIES[0]);

  useEffect(() => {
    setIsLoaded(true);
    const timer = setTimeout(() => {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      let cityName =
        userTimezone.split("/").pop()?.replace(/_/g, " ") || "Ubicación Local";
      if (cityName === "Canary") cityName = "Islas Canarias";

      if (userTimezone !== heroCity.timezone) {
        setHeroCity({
          id: "local-user",
          name: cityName,
          country: "Tu Ubicación",
          timezone: userTimezone,
        });
      }
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen p-4 sm:p-8 md:p-16 bg-[#09090B] font-sans selection:bg-[#6366F1] selection:text-white">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 sm:mb-16 max-w-[1400px] mx-auto">
        <div className="cursor-pointer hover:opacity-90 transition-opacity">
          <Logo className="scale-75 sm:scale-100 origin-left" />
        </div>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#A1A1AA] hover:text-white hover:border-[#6366F1] transition-colors group"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
        </button>
      </header>

      {/* GRID BENTO RE-AJUSTADO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-[1400px] mx-auto">
        {/* Reloj Principal (Hero) 
            - Móvil: 1 columna
            - Tablet (sm): 2 columnas (ocupa todo el ancho de la fila)
            - Escritorio (xl): 2 columnas de ancho x 2 filas de alto (Bento)
        */}
        <div className="col-span-1 sm:col-span-2 xl:col-span-2 xl:row-span-2 h-full min-h-[250px]">
          <ClockCard
            city={heroCity.name}
            country={heroCity.country}
            timezone={heroCity.timezone}
            now={now}
            isHero={true}
          />
        </div>

        {/* Ciudades Guardadas */}
        {isLoaded &&
          savedCities.map((city) => (
            <ClockCard
              key={city.id}
              city={city.name}
              country={city.country}
              timezone={city.timezone}
              now={now}
              onDelete={() => removeCity(city.id)}
            />
          ))}

        {/* Card Add City */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="h-64 rounded-3xl border-2 border-dashed border-[#27272A] flex flex-col items-center justify-center text-[#A1A1AA] hover:text-[#6366F1] hover:border-[#6366F1] hover:bg-[#6366F1]/5 transition-all cursor-pointer group w-full"
        >
          <div className="p-4 bg-[#18181B] rounded-full mb-4 group-hover:scale-110 transition-transform border border-[#27272A]">
            <Plus className="w-8 h-8" />
          </div>
          <span className="text-xs sm:text-sm font-bold tracking-widest uppercase">
            Añadir Ciudad
          </span>
        </button>
      </div>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </main>
  );
}
