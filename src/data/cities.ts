export interface City {
  id: string;
  name: string;
  country: string;
  timezone: string;
  lat?: number; // Opcional por ahora para no romper el build
  lng?: number;
}

// Actualiza INITIAL_CITIES con coordenadas (Ejemplo rápido)
export const INITIAL_CITIES: City[] = [
  {
    id: "mad",
    name: "Madrid",
    country: "Spain",
    timezone: "Europe/Madrid",
    lat: 40.4168,
    lng: -3.7038,
  },
  {
    id: "nyc",
    name: "New York",
    country: "US",
    timezone: "America/New_York",
    lat: 40.7128,
    lng: -74.006,
  },
  {
    id: "tyo",
    name: "Tokyo",
    country: "JP",
    timezone: "Asia/Tokyo",
    lat: 35.6762,
    lng: 139.6503,
  },
];
