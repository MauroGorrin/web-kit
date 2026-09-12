import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: `${SITE_URL}/`, lastModified },
    { url: `${SITE_URL}/agenda`, lastModified },
    { url: `${SITE_URL}/portal`, lastModified },
  ];
}
