import type { MetadataRoute } from "next";
import { modulesConfig } from "../../modules.config";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified },
    { url: `${SITE_URL}/agenda`, lastModified },
    { url: `${SITE_URL}/portal`, lastModified },
  ];

  // `/tienda` no aparece si `ecommerce` está apagado — ver acceptance #1 de E3-T1.
  if (modulesConfig.ecommerce) {
    entries.push({ url: `${SITE_URL}/tienda`, lastModified });
  }

  return entries;
}
