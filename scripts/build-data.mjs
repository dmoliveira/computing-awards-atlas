import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ensureArray, validateAward, validateEvent } from "./data-utils.mjs";

const root = process.cwd();

const readJsonl = async (relativePath) => {
  const raw = await readFile(path.join(root, relativePath), "utf8");
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new Error(`Failed to parse ${relativePath} line ${index + 1}: ${error.message}`);
      }
    });
};

const awards = await readJsonl("data/awards.jsonl");
const events = await readJsonl("data/events.jsonl");

const awardSlugSet = new Set();
const eventIdSet = new Set();

for (const award of awards) {
  validateAward(award);

  if (awardSlugSet.has(award.slug)) {
    throw new Error(`Duplicate award slug '${award.slug}' found in awards.jsonl`);
  }

  awardSlugSet.add(award.slug);
}

const awardsBySlug = new Map(awards.map((award) => [award.slug, award]));

const normalizedEvents = events
  .map((event) => {
    validateEvent(event);

    if (eventIdSet.has(event.id)) {
      throw new Error(`Duplicate event id '${event.id}' found in events.jsonl`);
    }

    eventIdSet.add(event.id);

    const award = awardsBySlug.get(event.award_slug);
    if (!award) {
      throw new Error(`Event ${event.id} references unknown award slug '${event.award_slug}'`);
    }

    const personNames = ensureArray(event.person_names);
    const topics = ensureArray(event.topics);
    const institutions = ensureArray(event.institutions);
    const relatedWorks = ensureArray(event.related_works);
    const decadeStart = Math.floor(event.year / 10) * 10;

    return {
      ...event,
      award_name: award.short_name ?? award.name,
      award_category: award.category,
      person_names: personNames,
      person_label: personNames.join(", "),
      topics,
      institutions,
      related_works: relatedWorks,
      decade: `${decadeStart}s`,
      featured: Boolean(event.featured),
      search_blob: [
        event.title,
        award.name,
        award.short_name,
        award.description,
        personNames.join(" "),
        topics.join(" "),
        institutions.join(" "),
        event.significance,
        relatedWorks.map((work) => work.title).join(" "),
        String(event.year),
        `${decadeStart}s`,
      ]
        .filter(Boolean)
        .join(" | "),
    };
  })
  .sort((left, right) => right.year - left.year || left.award_name.localeCompare(right.award_name));

const peopleMap = new Map();
for (const event of normalizedEvents) {
  for (const person of event.person_names) {
    if (!peopleMap.has(person)) {
      peopleMap.set(person, {
        name: person,
        award_slugs: new Set(),
        topics: new Set(),
        years: [],
      });
    }
    const current = peopleMap.get(person);
    current.award_slugs.add(event.award_slug);
    event.topics.forEach((topic) => current.topics.add(topic));
    current.years.push(event.year);
  }
}

const people = [...peopleMap.entries()]
  .map(([name, value]) => ({
    name,
    award_count: value.award_slugs.size,
    earliest_year: Math.min(...value.years),
    latest_year: Math.max(...value.years),
    topics: [...value.topics].sort(),
  }))
  .sort((left, right) => left.name.localeCompare(right.name));

const topicCounts = new Map();
for (const event of normalizedEvents) {
  for (const topic of event.topics) {
    topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1);
  }
}

const awardsWithCounts = awards
  .map((award) => ({
    ...award,
    recipient_count: normalizedEvents.filter((event) => event.award_slug === award.slug).reduce((count, event) => count + event.person_names.length, 0),
    featured_topics: ensureArray(award.featured_topics),
  }))
  .sort((left, right) => {
    if (right.seo_priority === left.seo_priority) {
      return left.name.localeCompare(right.name);
    }
    return ["primary", "high", "medium", "low"].indexOf(left.seo_priority) - ["primary", "high", "medium", "low"].indexOf(right.seo_priority);
  });

const output = {
  generated_at: new Date().toISOString(),
  coverage_note:
    "MVP sample: curated Turing Award timeline entries plus an expandable catalog of major computing awards and paper-recognition programs.",
  awards: awardsWithCounts,
  events: normalizedEvents,
  people,
  topics: [...topicCounts.entries()]
    .map(([topic, count]) => ({ topic, count }))
    .sort((left, right) => right.count - left.count || left.topic.localeCompare(right.topic)),
  stats: {
    award_count: awardsWithCounts.length,
    event_count: normalizedEvents.length,
    people_count: people.length,
    year_start: Math.min(...normalizedEvents.map((event) => event.year)),
    year_end: Math.max(...normalizedEvents.map((event) => event.year)),
  },
  featured_events: normalizedEvents.filter((event) => event.featured).slice(0, 6),
};

for (const relativeDir of ["src/generated", "public/data"]) {
  await mkdir(path.join(root, relativeDir), { recursive: true });
}

const content = `${JSON.stringify(output, null, 2)}\n`;
await writeFile(path.join(root, "src/generated/awards-atlas.generated.json"), content, "utf8");
await writeFile(path.join(root, "public/data/awards-atlas.json"), content, "utf8");

console.log(
  `Built dataset with ${output.stats.event_count} events, ${output.stats.people_count} people, and ${output.stats.award_count} awards.`,
);
