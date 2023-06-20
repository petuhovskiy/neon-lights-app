import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: "https://neon-lights-app.vercel.app",
      lastModified: new Date(),
    }
  ];
}
