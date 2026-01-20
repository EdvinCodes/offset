// Calcula la posición del sol y genera el GeoJSON de la sombra nocturna
import { geoCircle } from "d3-geo";

export function getNightPath(date: Date) {
  // 1. Calcular la posición del sol (subsolar point)
  // Basado en ecuaciones astronómicas simplificadas
  const sunPos = getSunPosition(date);

  // 2. El "antipoda" del sol es el centro de la noche
  const antipodalLat = -sunPos.latitude;
  const antipodalLng = (sunPos.longitude + 180) % 360;

  // 3. Generar un círculo de 90 grados alrededor del centro de la noche
  const circleGenerator = geoCircle()
    .center([antipodalLng, antipodalLat])
    .radius(90); // 90 grados cubre la mitad de la tierra

  return circleGenerator();
}

function getSunPosition(date: Date) {
  const PI = Math.PI;
  const RAD = PI / 180;

  // Día del año (0-365)
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Hora UTC en decimal
  const hours =
    date.getUTCHours() +
    date.getUTCMinutes() / 60 +
    date.getUTCSeconds() / 3600;

  // Declinación del sol (latitud)
  const declination = 23.45 * Math.sin(RAD * (360 / 365) * (dayOfYear - 81));

  // Ecuación del tiempo (para ajustar la longitud)
  const B = (360 / 365) * (dayOfYear - 81);
  const eot =
    9.87 * Math.sin(2 * B * RAD) -
    7.53 * Math.cos(B * RAD) -
    1.5 * Math.sin(B * RAD);

  // Longitud del sol (donde es mediodía ahora mismo)
  // (12:00 UTC - Hora actual + Ecuación del tiempo) * 15 grados/hora
  const longitude = -(hours - 12 + eot / 60) * 15;

  return { latitude: declination, longitude: longitude };
}
