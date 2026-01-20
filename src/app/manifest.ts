import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Offset | World Clock",
    short_name: "Offset",
    description:
      "Viaje en el tiempo y conversor de zonas horarias minimalista.",
    start_url: "/",
    display: "standalone", // Esto quita la barra del navegador
    background_color: "#09090B",
    theme_color: "#09090B",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
