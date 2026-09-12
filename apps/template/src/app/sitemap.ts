import type { MetadataRoute } from "next";
import { modulesConfig } from "../../modules.config";
import { env } from "../lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: `${env.siteUrl}/`, lastModified },
    { url: `${env.siteUrl}/agenda`, lastModified },
    { url: `${env.siteUrl}/portal`, lastModified },
  ];

  // `/tienda` no aparece si `ecommerce` está apagado — ver acceptance #1 de E3-T1.
  if (modulesConfig.ecommerce) {
    entries.push({ url: `${env.siteUrl}/tienda`, lastModified });
  }

  return entries;
}
