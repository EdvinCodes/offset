"use client";

import { useState, useEffect } from "react";
import { X, Search, Plus, Check, Loader2, MapPin } from "lucide-react";
import { useCityStore } from "@/store/useCityStore";
import { City } from "@/data/cities";

interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  timezone?: string; // Puede ser undefined en países
  admin1?: string;
  feature_code?: string; // Para identificar si es país (PCLI) o ciudad
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const addCity = useCityStore((state) => state.addCity);
  const savedCities = useCityStore((state) => state.savedCities);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim().length > 2) {
        searchCities(searchTerm);
      } else {
        setResults([]);
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchCities = async (query: string) => {
    setIsLoading(true);
    setResults([]);
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=es&format=json`,
      );
      const data = await response.json();

      if (data.results) {
        // --- FILTRADO CLAVE ---
        const validResults = data.results.filter((item: GeocodingResult) => {
          // 1. Debe tener timezone (esto elimina el país "México" que daba error)
          if (!item.timezone) return false;
          // 2. Opcional: Podríamos filtrar feature_code === 'PCLI' si quisiéramos ser más estrictos
          return true;
        });

        const mappedCities: City[] = validResults.map(
          (item: GeocodingResult) => {
            // Construimos el subtítulo inteligente
            // Si hay región (admin1) y es diferente al nombre de la ciudad, la mostramos
            const parts = [];
            if (item.admin1 && item.admin1 !== item.name)
              parts.push(item.admin1);
            if (item.country) parts.push(item.country);

            const detailedLocation =
              parts.join(", ") || "Ubicación desconocida";

            return {
              id: item.id.toString(),
              name: item.name,
              country: detailedLocation,
              timezone: item.timezone!, // El ! es seguro gracias al filter de arriba
              lat: item.latitude,
              lng: item.longitude,
            };
          },
        );
        setResults(mappedCities);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Error searching:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleAdd = (city: City) => {
    addCity(city);
    onClose();
    setSearchTerm("");
    setResults([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#27272A] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[70vh]">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b border-zinc-200 dark:border-[#27272A] shrink-0">
          <Search className="w-5 h-5 text-zinc-400 dark:text-[#A1A1AA]" />
          <input
            autoFocus
            type="text"
            placeholder="Buscar ciudad (ej: Ciudad de México, Tokio)..."
            className="flex-1 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-[#52525B] outline-none text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-[#27272A] rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400 dark:text-[#A1A1AA]" />
          </button>
        </div>

        {/* Resultados */}
        <div className="overflow-y-auto p-2 scrollbar-thin min-h-[150px] relative">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm animate-pulse">Consultando satélites...</p>
            </div>
          ) : (
            <>
              {searchTerm.length < 3 && results.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-[#52525B] gap-2 py-8">
                  <MapPin className="w-8 h-8 opacity-20" />
                  <p>Escribe al menos 3 letras</p>
                </div>
              )}

              {searchTerm.length >= 3 && results.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 dark:text-[#52525B] py-8">
                  <p>{`No encontramos "${searchTerm}"`}</p>
                </div>
              )}

              {results.length > 0 && (
                <div className="space-y-1">
                  {results.map((city) => {
                    const isAlreadyAdded = savedCities.some(
                      (c) => c.name === city.name && c.country === city.country,
                    );
                    return (
                      <button
                        key={city.id}
                        disabled={isAlreadyAdded}
                        onClick={() => handleAdd(city)}
                        className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl hover:bg-zinc-100 dark:hover:bg-[#27272A] transition-colors group disabled:opacity-50 text-left"
                      >
                        <div className="overflow-hidden">
                          <h3 className="text-zinc-900 dark:text-white font-medium group-hover:text-indigo-600 dark:group-hover:text-[#6366F1] transition-colors truncate">
                            {city.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-[#A1A1AA] truncate">
                            <span>{city.country}</span>
                            <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 rounded text-zinc-400 shrink-0">
                              {city.timezone}
                            </span>
                          </div>
                        </div>
                        {isAlreadyAdded ? (
                          <div className="shrink-0 flex items-center gap-2 text-indigo-600 dark:text-[#6366F1] text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-full">
                            <Check className="w-3 h-3" />
                            <span>Añadido</span>
                          </div>
                        ) : (
                          <Plus className="w-5 h-5 shrink-0 text-zinc-400 dark:text-[#52525B] group-hover:text-zinc-900 dark:group-hover:text-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-50 dark:bg-[#09090B] border-t border-zinc-200 dark:border-[#27272A] text-[10px] sm:text-xs text-zinc-500 dark:text-[#52525B] flex justify-between items-center shrink-0 px-4">
          <span>Búsqueda global por Open-Meteo</span>
          <span className="hidden sm:inline">
            <kbd className="bg-white dark:bg-[#27272A] border border-zinc-200 dark:border-transparent px-1.5 py-0.5 rounded text-zinc-600 dark:text-white font-mono shadow-sm mx-1">
              ESC
            </kbd>
            cerrar
          </span>
        </div>
      </div>
    </div>
  );
}
