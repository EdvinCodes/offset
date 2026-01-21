import { City } from "@/data/cities";

interface MinifiedCity {
  i: string;
  n: string;
  c: string;
  t: string;
  la: number;
  lo: number;
  cc?: string;
}

export const generateShareUrl = (cities: City[]) => {
  if (typeof window === "undefined") return "";

  const minified = cities.map((city) => ({
    i: city.id,
    n: city.name,
    c: city.country,
    t: city.timezone,
    // CORRECCIÓN AQUÍ: (city.lat || 0) para evitar el error de 'possibly undefined'
    la: Number((city.lat || 0).toFixed(4)),
    lo: Number((city.lng || 0).toFixed(4)),
    cc: city.countryCode,
  }));

  try {
    const jsonString = JSON.stringify(minified);
    const encoded = btoa(
      encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16)),
      ),
    );

    const url = new URL(window.location.href);
    url.searchParams.set("d", encoded);
    return url.toString();
  } catch (e) {
    console.error("Error generating URL", e);
    return "";
  }
};

export const parseShareUrl = (searchParams: URLSearchParams): City[] | null => {
  const data = searchParams.get("d");
  if (!data) return null;

  try {
    const jsonString = decodeURIComponent(
      Array.prototype.map
        .call(
          atob(data),
          (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2),
        )
        .join(""),
    );

    const minified: MinifiedCity[] = JSON.parse(jsonString);

    if (!Array.isArray(minified)) return null;

    return minified.map((m) => ({
      id: m.i,
      name: m.n,
      country: m.c,
      timezone: m.t,
      lat: m.la,
      lng: m.lo,
      countryCode: m.cc,
    }));
  } catch (e) {
    console.error("Error parsing shared URL", e);
    return null;
  }
};
