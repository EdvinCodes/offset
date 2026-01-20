"use client";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icono SVG Adaptable */}
      <svg
        width="48"
        height="48"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shadow-2xl shadow-indigo-500/20 rounded-2xl"
      >
        {/* Fondo del icono: Negro en claro, Blanco en oscuro */}
        <rect
          width="60"
          height="60"
          rx="16"
          className="fill-zinc-900 dark:fill-white transition-colors duration-300"
          stroke="none"
        />
        {/* Barra 1: Blanca en claro, Negra en oscuro */}
        <rect
          x="18"
          y="15"
          width="8"
          height="30"
          rx="4"
          className="fill-white dark:fill-zinc-900 transition-colors duration-300"
        />
        {/* Barra 2: Indigo siempre (marca de la casa) */}
        <rect x="34" y="10" width="8" height="30" rx="4" fill="#6366F1" />
      </svg>

      {/* Texto Adaptable */}
      <h1 className="text-3xl font-bold tracking-tighter text-zinc-900 dark:text-white transition-colors duration-300">
        offset<span className="text-[#6366F1]">.</span>
      </h1>
    </div>
  );
}
