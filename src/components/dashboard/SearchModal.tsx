"use client";

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { X, Search, Loader2, MapPin, Globe } from "lucide-react";
import { useCityStore } from "@/store/useCityStore";
import { City, AVAILABLE_CITIES } from "@/data/cities";
import { useTranslation } from "@/hooks/useTranslation";

// Definimos la interfaz para evitar el error de 'any'
interface OpenMeteoResult {
  id: number;
  name: string;
  country: string;
  timezone: string;
  latitude: number;
  longitude: number;
  country_code: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { t, language } = useTranslation();
  const { addCity, savedCities } = useCityStore();

  const [query, setQuery] = useState("");
  // 'results' almacena TODO lo encontrado (Local + API) sin filtrar por región
  const [results, setResults] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeRegion, setActiveRegion] = useState<string>("ALL");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      // Foco inmediato al input
      setTimeout(() => {
        document.getElementById("city-search-input")?.focus();
      }, 50);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // --- LÓGICA DE BÚSQUEDA ---
  useEffect(() => {
    const searchCities = async () => {
      // Limpiamos si es muy corto, pero NO mostramos "No results" todavía
      if (query.trim().length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const lowerQuery = query.toLowerCase().trim();

      // A) BÚSQUEDA LOCAL (Inmediata)
      const localMatches = AVAILABLE_CITIES.filter((city) => {
        const matchName = city.name.toLowerCase().includes(lowerQuery);
        const matchTrans = city.names
          ? Object.values(city.names).some((n) =>
              n.toLowerCase().includes(lowerQuery),
            )
          : false;
        return matchName || matchTrans;
      });

      // B) BÚSQUEDA API
      let apiMatches: City[] = [];
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=${language}&format=json`,
        );
        const data = await res.json();

        if (data.results) {
          apiMatches = data.results.map((item: OpenMeteoResult) => ({
            id: `api-${item.id}`,
            name: item.name,
            country: item.country,
            timezone: item.timezone,
            lat: item.latitude,
            lng: item.longitude,
            countryCode: item.country_code,
          }));
        }
      } catch (error) {
        console.error("Error API", error);
      }

      // C) FUSIÓN SIN DUPLICADOS
      // Si la ciudad API ya existe en LOCAL (mismo nombre y país), preferimos la LOCAL
      const uniqueApiMatches = apiMatches.filter(
        (apiCity) =>
          !localMatches.some(
            (localCity) =>
              localCity.name === apiCity.name &&
              localCity.country === apiCity.country,
          ),
      );

      // Combinamos y guardamos en el estado 'results' (Raw Data)
      setResults([...localMatches, ...uniqueApiMatches]);
      setLoading(false);
    };

    // Debounce de 300ms para no saturar
    const debounce = setTimeout(searchCities, 300);
    return () => clearTimeout(debounce);
  }, [query, language]);

  const handleAddCity = (city: City) => {
    const existingLocal = AVAILABLE_CITIES.find(
      (c) => c.name === city.name && c.countryCode === city.countryCode,
    );
    addCity(existingLocal || city);
    onClose();
    setQuery("");
  };

  // --- 2. FILTRADO VISUAL ---
  // Filtramos 'results' según la región activa para mostrarlos
  const filteredResults = useMemo(() => {
    if (activeRegion === "ALL") return results;
    return results.filter((city) => {
      if (!city.timezone) return false;
      const region = city.timezone.split("/")[0];
      return region === activeRegion;
    });
  }, [results, activeRegion]);

  // --- 3. BOTONES DE REGIÓN ESTABLES ---
  // Calculamos las regiones disponibles basándonos en 'results' (TOTAL encontrado),
  // NO en 'filteredResults'. Así los botones no desaparecen si filtras mal.
  const availableRegions = useMemo(() => {
    const regions = new Set(
      results.map((r) => r.timezone?.split("/")[0]).filter(Boolean),
    );
    return Array.from(regions).sort();
  }, [results]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#27272A] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* INPUT */}
        <div className="flex items-center gap-3 p-4 border-b border-zinc-200 dark:border-[#27272A]">
          <Search className="w-5 h-5 text-zinc-400" />
          <input
            id="city-search-input"
            type="text"
            placeholder={t.searchPlaceholder || "Buscar ciudad..."}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveRegion("ALL"); // Reiniciamos el filtro directamente al escribir
            }}
            className="flex-1 bg-transparent text-lg text-zinc-900 dark:text-white placeholder-zinc-400 outline-none"
            autoComplete="off"
          />
          {loading && (
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-[#27272A] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* BOTONES DE FILTRO (Siempre visibles si hay resultados globales) */}
        {!loading && availableRegions.length > 0 && (
          <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide border-b border-zinc-100 dark:border-white/5">
            <button
              onClick={() => setActiveRegion("ALL")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                activeRegion === "ALL"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                  : "bg-zinc-100 dark:bg-[#27272A] text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {t.all} ({results.length})
            </button>
            {availableRegions.map((region) => {
              // Contamos cuántos hay en esta región para ponerlo en el botón
              const count = results.filter((r) =>
                r.timezone?.startsWith(region),
              ).length;
              return (
                <button
                  key={region}
                  onClick={() => setActiveRegion(region)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                    activeRegion === region
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30"
                      : "bg-zinc-100 dark:bg-[#27272A] text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {region} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* LISTA DE RESULTADOS */}
        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin">
          {!loading && filteredResults.length > 0 ? (
            <div className="p-2">
              {filteredResults.map((city) => {
                const isAdded = savedCities.some(
                  (c) => c.name === city.name && c.country === city.country,
                );

                const staticData = AVAILABLE_CITIES.find(
                  (c) => c.name === city.name,
                );
                const namesSource = staticData?.names || city.names;
                const displayName =
                  (namesSource as Record<string, string>)?.[language] ||
                  city.name;
                const isLocal = !city.id.startsWith("api-");

                return (
                  <button
                    key={`${city.lat}-${city.lng}`}
                    onClick={() => !isAdded && handleAddCity(city)}
                    disabled={isAdded}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${
                      isAdded
                        ? "opacity-50 cursor-default"
                        : "hover:bg-zinc-50 dark:hover:bg-[#27272A] cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div
                        className={`p-2 rounded-lg ${isLocal ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"}`}
                      >
                        {isLocal ? (
                          <MapPin className="w-5 h-5" />
                        ) : (
                          <Globe className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-zinc-900 dark:text-white flex items-center gap-2">
                          {displayName}
                          {isAdded && (
                            <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded font-bold uppercase">
                              {t.added || "Añadido"}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                          <span>{city.country}</span>
                          <span className="opacity-30">•</span>
                          <span className="text-xs opacity-70">
                            {city.timezone}
                          </span>
                        </div>
                      </div>
                    </div>

                    {city.countryCode && (
                      <Image
                        src={`https://flagcdn.com/w40/${city.countryCode.toLowerCase()}.png`}
                        alt="flag"
                        width={24}
                        height={16}
                        className="w-6 h-4 object-cover rounded opacity-50 group-hover:opacity-100 transition-opacity"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            // ESTADO VACÍO
            <div className="p-12 text-center text-zinc-500 dark:text-zinc-400">
              {loading ? (
                <p>{t.searching}</p>
              ) : query.length < 2 ? (
                <p className="text-sm">{t.startTyping}</p>
              ) : results.length > 0 && filteredResults.length === 0 ? (
                // CASO ESPECIAL: Hay resultados pero el filtro los oculta
                <div className="flex flex-col items-center gap-2">
                  <p>
                    {t.noResultsInRegion}{" "}
                    <span className="font-bold">{activeRegion}</span>
                  </p>
                  <button
                    onClick={() => setActiveRegion("ALL")}
                    className="text-indigo-500 hover:underline text-sm"
                  >
                    {t.viewAllResults}
                  </button>
                </div>
              ) : (
                <p>{t.noResults || "No se encontraron resultados"}</p>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-zinc-50 dark:bg-[#18181B] border-t border-zinc-200 dark:border-[#27272A] p-2 text-center text-[10px] text-zinc-400">
          {t.searchFooter}
        </div>
      </div>
    </div>
  );
}
