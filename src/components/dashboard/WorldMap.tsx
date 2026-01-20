"use client";

import { useEffect, useState, useMemo } from "react";
import * as d3 from "d3-geo";
import * as topojson from "topojson-client";
import { getNightPath } from "@/lib/solar";
import { City } from "@/data/cities";
import { useTime } from "@/hooks/useTime";
import { toZonedTime, format } from "date-fns-tz";

interface WorldFeature {
  type: "Feature";
  geometry: d3.GeoGeometryObjects;
  properties: Record<string, unknown>;
}

interface WorldData {
  type: "FeatureCollection";
  features: WorldFeature[];
}

interface WorldMapProps {
  cities: City[];
  className?: string;
}

export default function WorldMap({ cities, className = "" }: WorldMapProps) {
  const now = useTime();
  const [worldData, setWorldData] = useState<WorldData | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [hoverCityId, setHoverCityId] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((res) => res.json())
      .then((data) => {
        const countries = topojson.feature(
          data,
          data.objects.countries,
        ) as unknown as WorldData;
        setWorldData(countries);
      });

    const handleResize = () => {
      const container = document.getElementById("map-container");
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientWidth * 0.5,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const projection = useMemo(() => {
    const sphere: d3.GeoSphere = { type: "Sphere" };
    return d3
      .geoEquirectangular()
      .fitSize([dimensions.width, dimensions.height], sphere)
      .translate([dimensions.width / 2, dimensions.height / 2]);
  }, [dimensions]);

  const pathGenerator = useMemo(
    () => d3.geoPath().projection(projection),
    [projection],
  );

  // Encontramos la ciudad activa fuera del renderizado para pintarla al final
  const activeCity = useMemo(() => {
    return cities.find((c) => c.id === hoverCityId);
  }, [cities, hoverCityId]);

  if (!worldData || !now)
    return (
      <div
        id="map-container"
        className={`w-full aspect-[2/1] bg-[#18181B] rounded-3xl animate-pulse ${className}`}
      />
    );

  const nightFeature = getNightPath(now);
  const nightPath = pathGenerator(nightFeature as d3.GeoPermissibleObjects);

  return (
    <div
      id="map-container"
      className={`relative w-full bg-[#18181B] border border-[#27272A] rounded-3xl overflow-hidden ${className}`}
    >
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="block"
      >
        {/* CAPA 1: PAÍSES */}
        <g>
          {worldData.features.map((feature, i) => (
            <path
              key={`country-${i}`}
              d={pathGenerator(feature as d3.GeoPermissibleObjects) || ""}
              fill="#27272A"
              stroke="#09090B"
              strokeWidth={0.5}
              className="transition-colors hover:fill-[#3F3F46]"
            />
          ))}
        </g>

        {/* CAPA 2: NOCHE */}
        {nightPath && (
          <path
            d={nightPath}
            fill="rgba(0,0,0,0.4)"
            style={{ pointerEvents: "none" }}
            className="blur-[2px]"
          />
        )}

        {/* CAPA 3: PUNTOS DE CIUDADES (Sin Tooltips) */}
        {cities.map((city) => {
          if (!city.lat || !city.lng) return null;
          const [x, y] = projection([city.lng, city.lat]) || [0, 0];
          const isHovered = hoverCityId === city.id;

          return (
            <g
              key={city.id}
              onMouseEnter={() => setHoverCityId(city.id)}
              onMouseLeave={() => setHoverCityId(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Radar Effect */}
              {isHovered && (
                <circle
                  cx={x}
                  cy={y}
                  r={18}
                  fill="rgba(99, 102, 241, 0.3)"
                  className="animate-ping"
                />
              )}
              {/* Punto Físico */}
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 8 : 4}
                fill={isHovered ? "#FFFFFF" : "#6366F1"}
                stroke="#09090B"
                strokeWidth={2}
                className="transition-all duration-300"
              />
            </g>
          );
        })}

        {/* CAPA 4: TOOLTIP ACTIVO (Renderizado AL FINAL para estar ENCIMA DE TODO) */}
        {activeCity && activeCity.lat && activeCity.lng && (
          <g>
            {(() => {
              const [x, y] = projection([activeCity.lng, activeCity.lat]) || [
                0, 0,
              ];
              const cityTime = toZonedTime(now, activeCity.timezone);
              const timeStr = format(cityTime, "HH:mm");

              // Ajustes de diseño de la caja
              const boxHeight = 44; // Más alta para que quepa todo
              const textWidth = activeCity.name.length * 8 + 50;
              const boxY = y - 35; // Posición vertical de la caja

              return (
                <g style={{ pointerEvents: "none" }}>
                  {" "}
                  {/* pointerEvents none evita flickering */}
                  <filter id="shadow">
                    <feDropShadow
                      dx="0"
                      dy="4"
                      stdDeviation="4"
                      floodColor="black"
                      floodOpacity="0.5"
                    />
                  </filter>
                  {/* Caja Tooltip */}
                  <rect
                    x={x - textWidth / 2}
                    y={boxY - boxHeight}
                    width={textWidth}
                    height={boxHeight}
                    rx="8"
                    fill="#18181B"
                    stroke="#3F3F46"
                    strokeWidth="1"
                    filter="url(#shadow)"
                  />
                  {/* Texto Ciudad (Arriba) */}
                  <text
                    x={x}
                    y={boxY - boxHeight + 18} // 18px desde arriba de la caja
                    textAnchor="middle"
                    fill="#A1A1AA"
                    fontSize="11"
                    fontWeight="600"
                    style={{
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {activeCity.name}
                  </text>
                  {/* Texto Hora (Abajo) */}
                  <text
                    x={x}
                    y={boxY - 10} // 10px desde abajo de la caja
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="15"
                    fontWeight="bold"
                  >
                    {timeStr}
                  </text>
                </g>
              );
            })()}
          </g>
        )}
      </svg>

      <div className="absolute bottom-4 left-6 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/5 text-[10px] text-zinc-500 uppercase tracking-widest pointer-events-none">
        Live Satellite View
      </div>
    </div>
  );
}
