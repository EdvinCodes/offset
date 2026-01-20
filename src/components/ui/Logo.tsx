export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* El Icono SVG exacto que aprobaste */}
      <svg
        width="48"
        height="48"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shadow-2xl shadow-indigo-500/20 rounded-2xl"
      >
        {/* Fondo del icono (Zinc 900) */}
        <rect
          width="60"
          height="60"
          rx="16"
          fill="#18181B"
          stroke="#27272A"
          strokeWidth="1"
        />
        {/* Barra 1 (Blanca) */}
        <rect x="18" y="15" width="8" height="30" rx="4" fill="white" />
        {/* Barra 2 (Indigo - El Offset) */}
        <rect x="34" y="10" width="8" height="30" rx="4" fill="#6366F1" />
      </svg>

      {/* El Texto con la tipografía ajustada */}
      <h1 className="text-3xl font-bold tracking-tighter text-white">
        offset<span className="text-[#6366F1]">.</span>
      </h1>
    </div>
  );
}
