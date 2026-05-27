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
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
