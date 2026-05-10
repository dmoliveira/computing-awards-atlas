import atlasData from "@/src/generated/awards-atlas.generated.json";

export function getAwardBySlug(slug: string) {
  return atlasData.awards.find((award) => award.slug === slug) ?? null;
}

export function getEventsForAward(slug: string) {
  return atlasData.events.filter((event) => event.award_slug === slug);
}
