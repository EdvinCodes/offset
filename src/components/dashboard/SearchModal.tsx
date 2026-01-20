"use client";

import { useState, useEffect } from "react";
import { X, Search, Plus, Check } from "lucide-react";
import { AVAILABLE_CITIES } from "@/data/allCities";
import { useCityStore } from "@/store/useCityStore";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const addCity = useCityStore((state) => state.addCity);
  const savedCities = useCityStore((state) => state.savedCities);

  // Lógica para cerrar con ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCities = AVAILABLE_CITIES.filter(
    (city) =>
      city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.country.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAdd = (city: (typeof AVAILABLE_CITIES)[0]) => {
    addCity(city);
    onClose();
    setSearchTerm("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#27272A] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[70vh]">
        {/* Header Fijo */}
        <div className="flex items-center gap-4 p-4 border-b border-zinc-200 dark:border-[#27272A] shrink-0">
          <Search className="w-5 h-5 text-zinc-400 dark:text-[#A1A1AA]" />
          <input
            autoFocus
            type="text"
            placeholder="Buscar ciudad..."
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

        {/* Lista con Scroll custom */}
        <div className="overflow-y-auto p-2 scrollbar-thin">
          {filteredCities.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 dark:text-[#52525B]">
              {`Sin resultados para "${searchTerm}"`}
            </div>
          ) : (
            filteredCities.map((city) => {
              const isAlreadyAdded = savedCities.some((c) => c.id === city.id);
              return (
                <button
                  key={city.id}
                  disabled={isAlreadyAdded}
                  onClick={() => handleAdd(city)}
                  className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-zinc-100 dark:hover:bg-[#27272A] transition-colors group disabled:opacity-50 text-left"
                >
                  <div>
                    <h3 className="text-zinc-900 dark:text-white font-medium group-hover:text-indigo-600 dark:group-hover:text-[#6366F1] transition-colors">
                      {city.name}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-[#A1A1AA]">
                      {city.country}
                    </p>
                  </div>
                  {isAlreadyAdded ? (
                    <Check className="w-5 h-5 text-indigo-600 dark:text-[#6366F1]" />
                  ) : (
                    <Plus className="w-5 h-5 text-zinc-400 dark:text-[#52525B] group-hover:text-zinc-900 dark:group-hover:text-white" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-50 dark:bg-[#09090B] border-t border-zinc-200 dark:border-[#27272A] text-xs text-zinc-500 dark:text-[#52525B] text-center shrink-0">
          Presiona{" "}
          <kbd className="bg-white dark:bg-[#27272A] border border-zinc-200 dark:border-transparent px-1.5 py-0.5 rounded text-zinc-600 dark:text-white font-mono shadow-sm">
            ESC
          </kbd>{" "}
          para cerrar
        </div>
      </div>
    </div>
  );
}
