import type { MetadataRoute } from "next";
import atlasData from "@/src/generated/awards-atlas.generated.json";
import { getRequiredSiteUrl } from "@/src/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getRequiredSiteUrl();

  const now = new Date();

  return [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/awards/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/people/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...atlasData.awards.map((award: { slug: string }) => ({
      url: `${siteUrl}/awards/${award.slug}/`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...atlasData.people.map((person: { slug: string }) => ({
      url: `${siteUrl}/people/${person.slug}/`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
