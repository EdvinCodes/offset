export interface City {
  id: string;
  name: string;
  country: string;
  timezone: string;
  lat?: number; // Coordenadas para el clima
  lng?: number; // Coordenadas para el clima
  countryCode?: string; // Código ISO para la bandera (ej: "ES", "US")
}

// Datos iniciales actualizados con coordenadas y códigos de país
export const INITIAL_CITIES: City[] = [
  {
    id: "1",
    name: "Madrid",
    country: "España",
    timezone: "Europe/Madrid",
    lat: 40.4165,
    lng: -3.7026,
    countryCode: "ES",
  },
  {
    id: "2",
    name: "New York",
    country: "Estados Unidos",
    timezone: "America/New_York",
    lat: 40.7143,
    lng: -74.006,
    countryCode: "US",
  },
  {
    id: "3",
    name: "Tokyo",
    country: "Japón",
    timezone: "Asia/Tokyo",
    lat: 35.6895,
    lng: 139.6917,
    countryCode: "JP",
  },
  {
    id: "4",
    name: "Sydney",
    country: "Australia",
    timezone: "Australia/Sydney",
    lat: -33.8678,
    lng: 151.2073,
    countryCode: "AU",
  },
];
