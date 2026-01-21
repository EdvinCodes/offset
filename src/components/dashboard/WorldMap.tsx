"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import * as d3 from "d3-geo";
import * as d3Zoom from "d3-zoom";
import * as d3Selection from "d3-selection";
import "d3-transition";
import * as topojson from "topojson-client";
import { getNightPath } from "@/lib/solar";
// 1. IMPORTAR AVAILABLE_CITIES PARA BUSCAR TRADUCCIONES
import { City, AVAILABLE_CITIES } from "@/data/cities";
import { useTime } from "@/hooks/useTime";
import { toZonedTime, format } from "date-fns-tz";
import { Plus, Minus, RotateCcw } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

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
  time?: Date | null;
}

export default function WorldMap({
  cities,
  className = "",
  time,
}: WorldMapProps) {
  // 2. SACAR 'language' DEL HOOK
  const { t, language } = useTranslation();
  const internalTime = useTime();
  const now = time || internalTime;

  const [worldData, setWorldData] = useState<WorldData | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [hoverCityId, setHoverCityId] = useState<string | null>(null);
  const [currentK, setCurrentK] = useState(1);

  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomBehavior = useRef<d3Zoom.ZoomBehavior<
    SVGSVGElement,
    unknown
  > | null>(null);

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

  useEffect(() => {
    if (!svgRef.current || !gRef.current || !worldData) return;

    const svg = d3Selection.select(svgRef.current);
    const g = d3Selection.select(gRef.current);

    const zoom = d3Zoom
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .translateExtent([
        [0, 0],
        [dimensions.width, dimensions.height],
      ])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setCurrentK(event.transform.k);
      });

    zoomBehavior.current = zoom;
    svg.call(zoom);
  }, [dimensions, worldData]);

  const handleZoomIn = () => {
    if (svgRef.current && zoomBehavior.current) {
      d3Selection
        .select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomBehavior.current.scaleBy, 1.5);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehavior.current) {
      d3Selection
        .select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomBehavior.current.scaleBy, 0.66);
    }
  };

  const handleReset = () => {
    if (svgRef.current && zoomBehavior.current) {
      d3Selection
        .select(svgRef.current)
        .transition()
        .duration(500)
        .call(zoomBehavior.current.transform, d3Zoom.zoomIdentity);
    }
  };

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

  const activeCity = useMemo(() => {
    return cities.find((c) => c.id === hoverCityId);
  }, [cities, hoverCityId]);

  if (!worldData || !now)
    return (
      <div
        id="map-container"
        className={`w-full aspect-[2/1] bg-transparent rounded-3xl animate-pulse ${className}`}
      />
    );

  const nightFeature = getNightPath(now);
  const nightPath = pathGenerator(nightFeature as d3.GeoPermissibleObjects);

  return (
    <div
      id="map-container"
      className={`relative w-full bg-zinc-50/50 dark:bg-[#18181B] border border-transparent dark:border-[#27272A] rounded-3xl overflow-hidden group ${className}`}
    >
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="block cursor-grab active:cursor-grabbing touch-none"
      >
        <g ref={gRef}>
          <g>
            {worldData.features.map((feature, i) => (
              <path
                key={`country-${i}`}
                d={pathGenerator(feature as d3.GeoPermissibleObjects) || ""}
                className="fill-zinc-300 dark:fill-[#27272A] stroke-white dark:stroke-[#09090B] stroke-[0.5] transition-colors hover:fill-zinc-400 dark:hover:fill-[#3F3F46]"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>

          {nightPath && (
            <path
              d={nightPath}
              fill="rgba(0,0,0,0.3)"
              style={{ pointerEvents: "none" }}
              className="blur-[2px]"
            />
          )}

          {/* CAPA 3: PUNTOS */}
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
                {isHovered && (
                  <circle
                    cx={x}
                    cy={y}
                    r={18 / currentK}
                    fill="rgba(99, 102, 241, 0.3)"
                    className="animate-ping"
                    vectorEffect="non-scaling-stroke"
                  />
                )}

                <circle
                  cx={x}
                  cy={y}
                  r={(isHovered ? 8 : 4) / Math.sqrt(currentK)}
                  fill={isHovered ? "#FFFFFF" : "#6366F1"}
                  stroke={isHovered ? "#000" : "#FFFFFF"}
                  strokeWidth={(isHovered ? 2 : 1) / currentK}
                  className="transition-all duration-300 drop-shadow-md"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            );
          })}

          {/* CAPA 4: TOOLTIP (AHORA CON TRADUCCIÓN) */}
          {activeCity && activeCity.lat && activeCity.lng && (
            <g>
              {(() => {
                // 3. LÓGICA DE TRADUCCIÓN DENTRO DEL TOOLTIP
                const staticData = AVAILABLE_CITIES.find(
                  (c) => c.name === activeCity.name,
                );
                const namesSource = staticData?.names || activeCity.names;
                const displayName =
                  (namesSource as Record<string, string>)?.[language] ||
                  activeCity.name;

                const [x, y] = projection([activeCity.lng, activeCity.lat]) || [
                  0, 0,
                ];
                const cityTime = toZonedTime(now, activeCity.timezone);
                const timeStr = format(cityTime, "HH:mm");
                const boxHeight = 44;

                // Calculamos ancho basado en el nombre traducido
                const textWidth = displayName.length * 8 + 50;
                const boxY = y - 35 / currentK;

                return (
                  <g
                    style={{ pointerEvents: "none" }}
                    transform={`translate(${x}, ${boxY}) scale(${1 / currentK})`}
                  >
                    <filter id="shadow">
                      <feDropShadow
                        dx="0"
                        dy="4"
                        stdDeviation="4"
                        floodColor="black"
                        floodOpacity="0.3"
                      />
                    </filter>
                    <rect
                      x={-textWidth / 2}
                      y={-boxHeight}
                      width={textWidth}
                      height={boxHeight}
                      rx="8"
                      fill="#18181B"
                      stroke="#3F3F46"
                      strokeWidth="1"
                      filter="url(#shadow)"
                    />
                    <text
                      y={-boxHeight + 18}
                      textAnchor="middle"
                      fill="#A1A1AA"
                      fontSize="11"
                      fontWeight="600"
                      style={{
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {/* 4. USAR EL NOMBRE TRADUCIDO */}
                      {displayName}
                    </text>
                    <text
                      y={-10}
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
        </g>
      </svg>

      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white dark:bg-[#27272A] rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 hover:text-indigo-600 dark:hover:text-white transition-colors"
        >
          <Plus className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white dark:bg-[#27272A] rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 hover:text-indigo-600 dark:hover:text-white transition-colors"
        >
          <Minus className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-white dark:bg-[#27272A] rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 hover:text-indigo-600 dark:hover:text-white transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
        </button>
      </div>

      <div className="absolute bottom-4 left-6 px-3 py-1 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-md border border-zinc-200 dark:border-white/5 text-[10px] text-zinc-600 dark:text-zinc-500 uppercase tracking-widest pointer-events-none">
        {t.interactiveMap}
      </div>
    </div>
  );
}
