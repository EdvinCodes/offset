"use client";

import { useState, useEffect } from "react";
import { useTime } from "@/hooks/useTime";
import ClockCard from "@/components/dashboard/ClockCard";
import SearchModal from "@/components/dashboard/SearchModal"; // Importar modal
import { Logo } from "@/components/ui/Logo";
import { INITIAL_CITIES, City } from "@/data/cities";
import { useCityStore } from "@/store/useCityStore"; // Importar estado
import { Plus } from "lucide-react"; // Icono de basura para borrar

export default function Home() {
  const now = useTime();

  // Estado local para el modal
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Estado global (ciudades guardadas)
  const { savedCities, removeCity } = useCityStore();

  // Estado para evitar problemas de hidratación con LocalStorage
  const [isLoaded, setIsLoaded] = useState(false);

  // Estado del Hero (tu ubicación)
  const [heroCity, setHeroCity] = useState<City>(INITIAL_CITIES[0]);

  useEffect(() => {
    setIsLoaded(true); // Marcamos que ya estamos en el cliente

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
    <main className="min-h-screen p-8 md:p-16 bg-[#09090B] font-sans selection:bg-[#6366F1] selection:text-white">
      {/* Header */}
      <header className="flex items-center justify-between mb-16 max-w-[1400px] mx-auto">
        <div className="cursor-pointer hover:opacity-90 transition-opacity">
          <Logo />
        </div>
        <button className="w-12 h-12 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#A1A1AA] hover:text-white hover:border-[#6366F1] transition-colors">
          <div className="w-6 h-6 bg-current rounded-full opacity-20" />{" "}
          {/* Avatar placeholder */}
        </button>
      </header>

      {/* GRID BENTO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-[1400px] mx-auto">
        {/* Reloj Principal (Hero) */}
        <div className="col-span-1 md:col-span-2 md:row-span-2">
          <ClockCard
            city={heroCity.name}
            country={heroCity.country}
            timezone={heroCity.timezone}
            now={now}
            isHero={true}
          />
        </div>

        {/* Ciudades Guardadas (Dinámicas) */}
        {isLoaded &&
          savedCities.map((city) => (
            <ClockCard
              key={city.id}
              city={city.name}
              country={city.country}
              timezone={city.timezone}
              now={now}
              // Pasamos la función de borrado directamente al componente
              onDelete={() => removeCity(city.id)}
            />
          ))}

        {/* Botón "+ Añadir" (Abre el Modal) */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="h-64 rounded-3xl border-2 border-dashed border-[#27272A] flex flex-col items-center justify-center text-[#A1A1AA] hover:text-[#6366F1] hover:border-[#6366F1] hover:bg-[#6366F1]/5 transition-all cursor-pointer group w-full"
        >
          <div className="p-4 bg-[#18181B] rounded-full mb-4 group-hover:scale-110 transition-transform border border-[#27272A]">
            <Plus className="w-8 h-8" />
          </div>
          <span className="text-sm font-bold tracking-widest uppercase">
            Añadir Ciudad
          </span>
        </button>
      </div>

      {/* Modal de Búsqueda */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </main>
  );
}
