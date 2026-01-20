export interface City {
  id: string;
  name: string;
  country: string;
  timezone: string; // ID de zona horaria IANA
}

export const INITIAL_CITIES: City[] = [
  { id: "mad", name: "Madrid", country: "ES", timezone: "Europe/Madrid" },
  { id: "nyc", name: "New York", country: "US", timezone: "America/New_York" },
  { id: "tyo", name: "Tokyo", country: "JP", timezone: "Asia/Tokyo" },
  { id: "lon", name: "London", country: "GB", timezone: "Europe/London" },
  { id: "syd", name: "Sydney", country: "AU", timezone: "Australia/Sydney" },
  {
    id: "lax",
    name: "Los Angeles",
    country: "US",
    timezone: "America/Los_Angeles",
  },
  { id: "dxb", name: "Dubai", country: "AE", timezone: "Asia/Dubai" },
];
