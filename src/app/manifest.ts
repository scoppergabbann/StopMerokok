import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StopMerokok",
    short_name: "StopMerokok",
    description:
      "Teman harian untuk mencatat progress berhenti merokok tanpa menghakimi.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F6F8F7",
    theme_color: "#4FAE7B",
    orientation: "portrait",
    icons: [
      {
        src: "/images/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/images/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
