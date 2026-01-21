"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "sonner";

import { useTime } from "@/hooks/useTime";
import ClockCard from "@/components/dashboard/ClockCard";
import SearchModal from "@/components/dashboard/SearchModal";
import SettingsModal from "@/components/dashboard/SettingsModal";
import MeetingPlannerModal from "@/components/dashboard/MeetingPlannerModal";
import WorldMap from "@/components/dashboard/WorldMap";
import { TimeSlider } from "@/components/dashboard/TimeSlider";
import { SortableItem } from "@/components/dashboard/SortableItem";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import { Logo } from "@/components/ui/Logo";
import { City, AVAILABLE_CITIES } from "@/data/cities";
import { useCityStore } from "@/store/useCityStore";
import { Plus, CalendarRange } from "lucide-react";

import { useSearchParams } from "next/navigation";
import ShareButton from "@/components/dashboard/ShareButton";
import { parseShareUrl } from "@/lib/share";

// IMPORTAMOS EL HOOK
import { useTranslation } from "@/hooks/useTranslation";

export default function Home() {
  const { t } = useTranslation(); // Inicializamos el hook

  const realTime = useTime();
  const [timeOffset, setTimeOffset] = useState(0);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);

  const { savedCities, removeCity, reorderCities, overrideCities, addCity } =
    useCityStore();
  const searchParams = useSearchParams();

  const [isLoaded, setIsLoaded] = useState(false);
  const [heroCity, setHeroCity] = useState<City>({
    id: "loading",
    name: t.loading, // "Cargando..."
    country: "...",
    timezone: "UTC",
    lat: 0,
    lng: 0,
    countryCode: "US",
  });

  const simulatedTime = realTime
    ? new Date(realTime.getTime() + timeOffset * 60 * 1000)
    : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // --- LEER URL COMPARTIDA ---
  useEffect(() => {
    if (searchParams.size > 0 && isLoaded) {
      const sharedCities = parseShareUrl(searchParams);

      if (sharedCities && sharedCities.length > 0) {
        overrideCities(sharedCities);

        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);

        // USAMOS TRADUCCIONES PARA EL ÉXITO
        toast.success(t.dashboardLoaded, {
          description: t.dashboardImportDesc,
          icon: "🔗",
        });
      } else if (searchParams.get("d")) {
        // USAMOS TRADUCCIONES PARA EL ERROR
        toast.error(t.linkInvalid, {
          description: t.linkInvalidDesc,
        });
      }
    }
  }, [searchParams, overrideCities, isLoaded, t]); // Añadimos 't' a dependencias por buenas prácticas

  // --- LÓGICA DE UBICACIÓN ---
  useEffect(() => {
    const initLocation = async () => {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // 1. CACHÉ
      const cached = localStorage.getItem("user_hero_location");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          // Si cargamos de caché, tal vez queramos actualizar el nombre traducido
          // pero por simplicidad usamos el guardado.
          // Opcional: Podríamos sobrescribir el nombre aquí con t.localLocation si es el ID "local-user"
          if (parsed.id === "local-user") {
            parsed.name = t.localLocation;
            parsed.country = t.yourLocation;
          }
          setHeroCity(parsed);
          setIsLoaded(true);
          return;
        } catch {
          localStorage.removeItem("user_hero_location");
        }
      }

      // 2. API
      try {
        const ipRes = await fetch("https://ipwho.is/");
        const ipData = await ipRes.json();

        if (ipData.success) {
          const newHero = {
            id: "local-user",
            name: ipData.city || t.localLocation, // Fallback traducido
            country: ipData.country || t.yourLocation, // Fallback traducido
            timezone: userTimezone,
            lat: ipData.latitude,
            lng: ipData.longitude,
            countryCode: ipData.country_code,
          };

          setHeroCity(newHero);
          localStorage.setItem("user_hero_location", JSON.stringify(newHero));
          setIsLoaded(true);
          return;
        }
      } catch (error) {
        console.warn("Fallo API IP", error);
      }

      // 3. FALLBACK ZONA HORARIA
      const cityQuery = userTimezone.split("/").pop()?.replace(/_/g, " ") || "";
      if (cityQuery) {
        try {
          const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityQuery)}&count=1&language=es&format=json`,
          );
          const data = await response.json();
          if (data.results?.[0]) {
            const r = data.results[0];
            const fallbackHero = {
              id: "local-user",
              name: r.name,
              country: r.country || t.yourLocation,
              timezone: userTimezone,
              lat: r.latitude,
              lng: r.longitude,
              countryCode: r.country_code,
            };
            setHeroCity(fallbackHero);
            localStorage.setItem(
              "user_hero_location",
              JSON.stringify(fallbackHero),
            );
          }
        } catch (e) {
          console.error(e);
        }
      }

      // 4. ÚLTIMO RECURSO SI TODO FALLA
      if (!heroCity.lat) {
        // Si no hemos setteado nada aún
        setHeroCity((prev) => ({
          ...prev,
          name: t.localLocation,
          country: t.yourLocation,
        }));
      }

      setIsLoaded(true);
    };

    const timer = setTimeout(initLocation, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]); // Dependencia 't' para refrescar si cambia el idioma (aunque requeriría recarga completa del efecto)

  const allMapPoints = [
    heroCity,
    ...AVAILABLE_CITIES.filter((c) => c.id !== heroCity.id),
  ];

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = savedCities.findIndex((c) => c.id === active.id);
      const newIndex = savedCities.findIndex((c) => c.id === over.id);
      reorderCities(arrayMove(savedCities, oldIndex, newIndex));
    }
  }

  // --- HELPER PARA BORRAR ---
  const handleRemoveCity = (cityToDelete: City) => {
    removeCity(cityToDelete.id);

    toast.info(t.removed, {
      description: `${cityToDelete.name} se ha quitado del dashboard.`,
      action: {
        label: t.undo,
        onClick: () => addCity(cityToDelete),
      },
      duration: 4000,
    });
  };

  if (!isLoaded) {
    return <DashboardSkeleton />;
  }

  return (
    <main className="min-h-screen p-4 sm:p-8 md:p-16 bg-zinc-50 dark:bg-[#09090B] font-sans transition-colors duration-300 pb-32 animate-in fade-in duration-500">
      {/* HEADER */}
      <header className="flex items-center justify-between mb-8 sm:mb-16 max-w-[1400px] mx-auto">
        <div className="cursor-pointer hover:opacity-90 transition-opacity">
          <Logo className="scale-75 sm:scale-100 origin-left" />
        </div>

        <div className="flex items-center gap-3">
          <ShareButton />

          <button
            onClick={() => setIsPlannerOpen(true)}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#27272A] flex items-center justify-center text-zinc-500 dark:text-[#A1A1AA] hover:text-[#6366F1] dark:hover:text-white hover:border-[#6366F1] transition-colors group shadow-sm"
            title={t.plannerTitle}
          >
            <CalendarRange className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#27272A] flex items-center justify-center text-zinc-500 dark:text-[#A1A1AA] hover:text-[#6366F1] dark:hover:text-white hover:border-[#6366F1] transition-colors group shadow-sm"
            title={t.settings}
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
        </div>
      </header>

      {/* MAPA */}
      <div className="max-w-[1400px] mx-auto mb-8">
        <WorldMap cities={allMapPoints} time={simulatedTime} />
      </div>

      {/* GRID */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-[1400px] mx-auto">
          {/* HERO CARD */}
          <div className="col-span-1 sm:col-span-2 xl:col-span-2 xl:row-span-2 h-full min-h-[250px]">
            <ClockCard
              city={heroCity.name}
              country={heroCity.country}
              timezone={heroCity.timezone}
              now={simulatedTime}
              lat={heroCity.lat}
              lng={heroCity.lng}
              countryCode={heroCity.countryCode}
              isHero={true}
            />
          </div>

          <SortableContext
            items={savedCities.map((c) => c.id)}
            strategy={rectSortingStrategy}
          >
            {savedCities.map((city) => (
              <SortableItem key={city.id} id={city.id}>
                <ClockCard
                  city={city.name}
                  country={city.country}
                  timezone={city.timezone}
                  now={simulatedTime}
                  lat={city.lat}
                  lng={city.lng}
                  countryCode={city.countryCode}
                  onDelete={() => handleRemoveCity(city)}
                />
              </SortableItem>
            ))}
          </SortableContext>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="h-64 rounded-3xl border-2 border-dashed border-zinc-300 dark:border-[#27272A] flex flex-col items-center justify-center text-zinc-400 dark:text-[#A1A1AA] hover:text-[#6366F1] hover:border-[#6366F1] hover:bg-[#6366F1]/5 transition-all cursor-pointer group w-full"
          >
            <div className="p-4 bg-white dark:bg-[#18181B] rounded-full mb-4 group-hover:scale-110 transition-transform border border-zinc-200 dark:border-[#27272A] shadow-sm">
              <Plus className="w-8 h-8" />
            </div>
            <span className="text-xs sm:text-sm font-bold tracking-widest uppercase">
              {t.addClock}
            </span>
          </button>
        </div>
      </DndContext>

      <TimeSlider
        offsetMinutes={timeOffset}
        onChange={setTimeOffset}
        onReset={() => setTimeOffset(0)}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {isPlannerOpen && (
        <MeetingPlannerModal
          isOpen={true}
          onClose={() => setIsPlannerOpen(false)}
        />
      )}
    </main>
  );
}
