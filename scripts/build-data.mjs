import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
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

const canonicalHostPatterns = [
  "doi.org",
  "dl.acm.org",
  "ieeexplore.ieee.org",
  "vldb.org",
  "research.google",
  "sciencedirect.com",
  "shop.elsevier.com",
  "mitpress.mit.edu",
  "cambridge.org",
  "informit.com",
  "aaai.org",
  "sigact.org",
  "iacr.org",
  "spark.apache.org",
  "latex-project.org",
  "aclanthology.org",
  "deeplearningbook.org",
];

const contextualHostPatterns = [
  "archive.org",
  "cs.yale.edu",
  "cs.princeton.edu",
  "spcl.inf.ethz.ch",
  "incompleteideas.net",
];

const blockedHostPatterns = ["wikipedia.org", "openlibrary.org"];

function hostMatchesPattern(hostname, pattern) {
  return hostname === pattern || hostname.endsWith(`.${pattern}`);
}

function classifyRelatedWorkQuality(url) {
  const host = new URL(url).hostname.toLowerCase();
  if (blockedHostPatterns.some((pattern) => hostMatchesPattern(host, pattern))) {
    throw new Error(`Blocked low-confidence related work host '${host}' in exported dataset`);
  }
  if (canonicalHostPatterns.some((pattern) => hostMatchesPattern(host, pattern))) {
    return "canonical";
  }
  if (contextualHostPatterns.some((pattern) => hostMatchesPattern(host, pattern))) {
    return "contextual";
  }
  throw new Error(`Unapproved related work host '${host}' in exported dataset`);
}

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
    const relatedWorks = ensureArray(event.related_works).map((work) => ({
      ...work,
      source_quality: classifyRelatedWorkQuality(work.url),
    }));
    const decadeStart = Math.floor(event.year / 10) * 10;
    const hasDistinctEventSource = Boolean(event.event_source_url) && event.event_source_url !== award.official_url;

    return {
      ...event,
      award_name: award.short_name ?? award.name,
      award_category: award.category,
      official_program_label: "Official awards page / index",
      official_program_url: award.official_url,
      event_source_label: hasDistinctEventSource ? event.event_source_label : null,
      event_source_url: hasDistinctEventSource ? event.event_source_url : null,
      source_scope: hasDistinctEventSource ? "event-level" : "program-level",
      citation_specificity: hasDistinctEventSource ? "year-specific-or-event-specific" : "not-year-specific",
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
  event.person_names.forEach((person, index) => {
    const personSlug = event.person_slugs[index];

    if (!peopleMap.has(personSlug)) {
      peopleMap.set(personSlug, {
        slug: personSlug,
        name: person,
        award_slugs: new Set(),
        award_names: new Set(),
        topics: new Set(),
        years: [],
        events: [],
      });
    }

    const current = peopleMap.get(personSlug);

    if (current.name !== person) {
      throw new Error(`Person slug '${personSlug}' is reused with conflicting display names '${current.name}' and '${person}'`);
    }

    current.award_slugs.add(event.award_slug);
    current.award_names.add(event.award_name);
    event.topics.forEach((topic) => current.topics.add(topic));
    current.years.push(event.year);
    current.events.push({
      year: event.year,
      award_name: event.award_name,
      title: event.title,
      person_label: event.person_label,
    });
  });
}

const people = [...peopleMap.values()]
  .map((value) => ({
    slug: value.slug,
    name: value.name,
    award_count: value.award_slugs.size,
    awards: [...value.award_names].sort(),
    earliest_year: Math.min(...value.years),
    latest_year: Math.max(...value.years),
    topics: [...value.topics].sort(),
    latest_event: value.events.sort((left, right) => right.year - left.year || left.award_name.localeCompare(right.award_name))[0],
  }))
  .sort((left, right) => left.name.localeCompare(right.name));

if (new Set(people.map((person) => person.slug)).size !== people.length) {
  throw new Error("Generated duplicate person slugs in people directory output");
}

const personDisplayBySlug = new Map(people.map((person) => [person.slug, person.name]));

const topicCounts = new Map();
for (const event of normalizedEvents) {
  for (const topic of event.topics) {
    topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1);
  }
}

const awardsWithCounts = awards
  .map((award) => {
    const awardEvents = normalizedEvents.filter((event) => event.award_slug === award.slug);
    const latestEvent = awardEvents[0];
    const uniqueRecipientSlugs = [...new Set(awardEvents.flatMap((event) => event.person_slugs))];

    return {
      ...award,
      event_count: awardEvents.length,
      recipient_count: uniqueRecipientSlugs.length,
      featured_topics: ensureArray(award.featured_topics),
      sample_recipients: uniqueRecipientSlugs
        .map((slug) => personDisplayBySlug.get(slug))
        .filter(Boolean)
        .slice(0, 4),
      latest_event:
        latestEvent !== undefined
          ? {
              year: latestEvent.year,
              title: latestEvent.title,
              person_label: latestEvent.person_label,
            }
          : null,
    };
  })
  .sort((left, right) => {
    if (right.seo_priority === left.seo_priority) {
      return left.name.localeCompare(right.name);
    }
    return ["primary", "high", "medium", "low"].indexOf(left.seo_priority) - ["primary", "high", "medium", "low"].indexOf(right.seo_priority);
  });

const output = {
  generated_at: new Date().toISOString(),
  coverage_note:
    "Expanded sample: curated Turing Award history plus representative laureates and influential-paper winners across major computing awards and retrospectives.",
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
const eventsJsonlContent = `${normalizedEvents.map((event) => JSON.stringify(event)).join("\n")}\n`;
await writeFile(path.join(root, "src/generated/awards-atlas.generated.json"), content, "utf8");
await writeFile(path.join(root, "public/data/awards-atlas.json"), content, "utf8");
await copyFile(path.join(root, "data/awards.jsonl"), path.join(root, "public/data/awards.jsonl"));
await writeFile(path.join(root, "public/data/events.jsonl"), eventsJsonlContent, "utf8");

console.log(
  `Built dataset with ${output.stats.event_count} events, ${output.stats.people_count} people, and ${output.stats.award_count} awards.`,
);
