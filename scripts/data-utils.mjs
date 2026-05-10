export const ensureArray = (value) => (Array.isArray(value) ? value : []);

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidUrl(value) {
  if (!isNonEmptyString(value)) {
    return false;
  }

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function validateAward(award) {
  for (const field of ["slug", "name", "category", "awarding_body", "founded_year", "description"]) {
    if (!(field in award)) {
      throw new Error(`Award ${award.slug ?? "unknown"} is missing required field '${field}'`);
    }
  }

  for (const field of ["slug", "name", "category", "awarding_body", "description"]) {
    if (!isNonEmptyString(award[field])) {
      throw new Error(`Award ${award.slug ?? "unknown"} must provide a non-empty string for '${field}'`);
    }
  }

  if (typeof award.founded_year !== "number" || !Number.isInteger(award.founded_year)) {
    throw new Error(`Award ${award.slug ?? "unknown"} must provide integer field 'founded_year'`);
  }

  if (award.official_url && !isValidUrl(award.official_url)) {
    throw new Error(`Award ${award.slug ?? "unknown"} has invalid 'official_url'`);
  }
}

export function validateEvent(event) {
  if (!isNonEmptyString(event.id)) {
    throw new Error("Event is missing required string field 'id'");
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
