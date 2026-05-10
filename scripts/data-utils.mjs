export const ensureArray = (value) => (Array.isArray(value) ? value : []);

const validSeoPriorities = new Set(["primary", "high", "medium", "low"]);
const slugPattern = /^[a-z0-9-]+$/;

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidUrl(value) {
  if (!isNonEmptyString(value)) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => isNonEmptyString(item));
}

export function validateAward(award) {
  if (!slugPattern.test(award.slug)) {
    throw new Error(`Award ${award.slug ?? "unknown"} must use a route-safe 'slug'`);
  }

  for (const field of ["slug", "name", "category", "awarding_body", "founded_year", "description"]) {
    if (!(field in award)) {
      throw new Error(`Award ${award.slug ?? "unknown"} is missing required field '${field}'`);
    }
  }

  for (const field of ["slug", "name", "category", "awarding_body", "description", "cadence", "scope", "region"]) {
    if (!isNonEmptyString(award[field])) {
      throw new Error(`Award ${award.slug ?? "unknown"} must provide a non-empty string for '${field}'`);
    }
  }

  if (typeof award.founded_year !== "number" || !Number.isInteger(award.founded_year)) {
    throw new Error(`Award ${award.slug ?? "unknown"} must provide integer field 'founded_year'`);
  }

  if (!isValidUrl(award.official_url)) {
    throw new Error(`Award ${award.slug ?? "unknown"} must provide a valid 'official_url'`);
  }

  if (!validSeoPriorities.has(award.seo_priority)) {
    throw new Error(`Award ${award.slug ?? "unknown"} must provide a valid 'seo_priority'`);
  }

  if (award.featured_topics !== undefined && !isStringArray(award.featured_topics)) {
    throw new Error(`Award ${award.slug ?? "unknown"} must use non-empty strings in 'featured_topics'`);
  }
}

export function validateEvent(event) {
  if (!isNonEmptyString(event.id)) {
    throw new Error("Event is missing required string field 'id'");
  }

  if (!slugPattern.test(event.id)) {
    throw new Error(`Event ${event.id} must use a route-safe 'id'`);
  }

  if (typeof event.year !== "number" || !Number.isInteger(event.year)) {
    throw new Error(`Event ${event.id} is missing integer field 'year'`);
  }

  for (const field of ["award_slug", "title", "significance"]) {
    if (!isNonEmptyString(event[field])) {
      throw new Error(`Event ${event.id} is missing required string field '${field}'`);
    }
  }

  if (!Array.isArray(event.person_names) || event.person_names.length === 0) {
    throw new Error(`Event ${event.id} must include at least one person in 'person_names'`);
  }

  if (event.person_names.some((name) => !isNonEmptyString(name))) {
    throw new Error(`Event ${event.id} contains an invalid entry in 'person_names'`);
  }

  if (!Array.isArray(event.person_slugs) || event.person_slugs.length !== event.person_names.length) {
    throw new Error(`Event ${event.id} must include 'person_slugs' aligned with 'person_names'`);
  }

  if (event.person_slugs.some((slug) => !isNonEmptyString(slug))) {
    throw new Error(`Event ${event.id} contains an invalid entry in 'person_slugs'`);
  }

  if (event.person_slugs.some((slug) => !slugPattern.test(slug))) {
    throw new Error(`Event ${event.id} contains a non-route-safe entry in 'person_slugs'`);
  }

  if (event.topics !== undefined && !isStringArray(event.topics)) {
    throw new Error(`Event ${event.id} must use non-empty strings in 'topics'`);
  }

  if (event.institutions !== undefined && !isStringArray(event.institutions)) {
    throw new Error(`Event ${event.id} must use non-empty strings in 'institutions'`);
  }

  if (event.related_works !== undefined) {
    if (!Array.isArray(event.related_works)) {
      throw new Error(`Event ${event.id} must use an array for 'related_works'`);
    }

    for (const work of event.related_works) {
      if (!isNonEmptyString(work.title) || !isNonEmptyString(work.type)) {
        throw new Error(`Event ${event.id} has a related work missing 'title' or 'type'`);
      }
      if (typeof work.year !== "number" || !Number.isInteger(work.year)) {
        throw new Error(`Event ${event.id} has a related work with invalid 'year'`);
      }
      if (!isValidUrl(work.url)) {
        throw new Error(`Event ${event.id} has a related work with invalid 'url'`);
      }
    }
  }
}
