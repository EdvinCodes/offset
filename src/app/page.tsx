"use client";

import { useTime } from "@/hooks/useTime";
import ClockCard from "@/components/dashboard/ClockCard";
import { Logo } from "@/components/ui/Logo"; // Importamos TU logo
import { INITIAL_CITIES } from "@/data/cities";
import { Plus } from "lucide-react";

export default function Home() {
  const now = useTime();
  const heroCity = INITIAL_CITIES[0];
  const otherCities = INITIAL_CITIES.slice(1, 3);

  return (
    // Fondo exacto #09090B (Background)
    <main className="min-h-screen p-8 md:p-16 bg-[#09090B] font-sans selection:bg-[#6366F1] selection:text-white">
      {/* Header con el Logo SVG Original */}
      <header className="flex items-center justify-between mb-16 max-w-[1400px] mx-auto">
        <div className="cursor-pointer hover:opacity-90 transition-opacity">
          <Logo />
        </div>

        {/* Botón de configuración minimalista */}
        <button className="w-12 h-12 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#A1A1AA] hover:text-white hover:border-[#6366F1] transition-colors group">
          <svg
            className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500"
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

        {/* Otras Ciudades */}
        {otherCities.map((city) => (
          <ClockCard
            key={city.id}
            city={city.name}
            country={city.country}
            timezone={city.timezone}
            now={now}
          />
        ))}

        {/* Card "Add City" - Estilo Wireframe Zinc */}
        <div className="h-64 rounded-3xl border-2 border-dashed border-[#27272A] flex flex-col items-center justify-center text-[#A1A1AA] hover:text-[#6366F1] hover:border-[#6366F1] hover:bg-[#6366F1]/5 transition-all cursor-pointer group">
          <div className="p-4 bg-[#18181B] rounded-full mb-4 group-hover:scale-110 transition-transform border border-[#27272A]">
            <Plus className="w-8 h-8" />
          </div>
          <span className="text-sm font-bold tracking-widest uppercase">
            Añadir Ciudad
          </span>
        </div>
      </div>
    </main>
  );
}
