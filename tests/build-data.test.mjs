import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { filterTimelineGroups } from "../src/lib/timeline.ts";
import { validateEvent } from "../scripts/data-utils.mjs";

test("build-data generates a usable static dataset", () => {
  execFileSync("node", ["scripts/build-data.mjs"], { stdio: "pipe" });

  const payload = JSON.parse(readFileSync("src/generated/awards-atlas.generated.json", "utf8"));
  const publicPayload = JSON.parse(readFileSync("public/data/awards-atlas.json", "utf8"));
  const publicEventsJsonl = readFileSync("public/data/events.jsonl", "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));

  assert.ok(payload.stats.award_count >= 10);
  assert.ok(payload.stats.event_count >= 36);
  assert.ok(payload.awards.some((award) => award.slug === "turing-award"));
  assert.ok(payload.events.some((event) => event.id === "turing-2018-deep-learning"));
  assert.ok(payload.events.some((event) => event.id === "acm-prize-2025-zaharia"));
  assert.ok(payload.events.some((event) => event.id === "sigir-tot-2024-explicit-factor-models"));
  assert.ok(payload.events.some((event) => event.id === "icde-2018-k-anonymity-networks"));
  assert.ok(payload.events.some((event) => event.id === "aaai-classic-2020-junker"));
  assert.ok(payload.events.some((event) => event.id === "acm-prize-2024-hoefler"));
  assert.ok(payload.events.some((event) => event.id === "hopper-2023-mittal"));
  assert.ok(payload.events.some((event) => event.id === "godel-2024-williams"));
  assert.ok(payload.events.some((event) => event.id === "knuth-2023-tardos"));
  assert.ok(payload.events.some((event) => event.id === "vldb-2023-distributed-graphlab"));
  assert.ok(payload.events.some((event) => event.id === "ijcai-2024-dietterich"));
  assert.ok(payload.awards.some((award) => award.slug === "grace-murray-hopper-award" && award.event_count >= 1));
  assert.ok(payload.events.every((event) => typeof event.official_program_url === "string" && event.official_program_url.startsWith("http")));
  assert.ok(payload.events.every((event) => typeof event.official_program_label === "string" && event.official_program_label.length > 0));
  assert.ok(payload.events.some((event) => event.source_scope === "event-level"));
  assert.ok(payload.events.some((event) => event.citation_specificity === "year-specific-or-event-specific"));
  assert.ok(payload.events.every((event) => !event.related_works.some((work) => /wikipedia\.org|openlibrary\.org/.test(work.url))));
  assert.ok(payload.events.every((event) => event.related_works.every((work) => ["canonical", "contextual"].includes(work.source_quality))));
  assert.ok(publicEventsJsonl.some((event) => event.source_scope === "event-level"));
  assert.ok(publicEventsJsonl.some((event) => event.citation_specificity === "year-specific-or-event-specific"));
  assert.ok(publicEventsJsonl.every((event) => !event.related_works.some((work) => /wikipedia\.org|openlibrary\.org/.test(work.url))));
  assert.ok(publicEventsJsonl.every((event) => event.related_works.every((work) => ["canonical", "contextual"].includes(work.source_quality))));
  assert.ok(
    payload.events.every((event) =>
      event.event_source_url
        ? event.source_scope === "event-level" && event.citation_specificity === "year-specific-or-event-specific"
        : event.source_scope === "program-level" && event.citation_specificity === "not-year-specific",
    ),
  );
  assert.ok(payload.events.every((event) => !event.event_source_url || event.event_source_url !== event.official_program_url));
  assert.ok(payload.people.every((person) => typeof person.slug === "string" && person.slug.length > 0));
  assert.ok(payload.people.every((person) => !Object.hasOwn(person, "institutions")));
  assert.ok(
    payload.events.every((event) => payload.awards.some((award) => award.slug === event.award_slug)),
    "every event award_slug should resolve to an award",
  );
  assert.ok(
    payload.events.every((event) => event.person_slugs.every((slug) => payload.people.some((person) => person.slug === slug))),
    "every event person_slug should resolve to a person",
  );
  assert.deepEqual(payload, publicPayload);
  assert.equal(payload.events[0].award_name.length > 0, true);
});

test("validateEvent rejects malformed rows", () => {
  assert.throws(
    () => validateEvent({ id: "bad-row", award_slug: "turing-award", title: "Broken row", significance: "Missing year and people" }),
    /missing integer field 'year'/,
  );
});

test("validateEvent rejects malformed related works", () => {
  assert.throws(
    () =>
      validateEvent({
        id: "bad-work",
        year: 2001,
        award_slug: "turing-award",
        title: "Broken work row",
        significance: "Invalid related work URL",
        person_names: ["Example Person"],
        person_slugs: ["example-person"],
        related_works: [{ title: "Broken Link", type: "paper", year: 2001, url: "notaurl" }],
      }),
    /invalid 'url'/,
  );
});

test("validateEvent rejects malformed taxonomy arrays", () => {
  assert.throws(
    () =>
      validateEvent({
        id: "bad-topics",
        year: 2002,
        award_slug: "turing-award",
        title: "Broken taxonomy row",
        significance: "Invalid topics entry",
        person_names: ["Example Person"],
        person_slugs: ["example-person"],
        topics: ["algorithms", ""],
      }),
    /non-empty strings in 'topics'/,
  );
});

test("validateEvent rejects missing aligned person slugs", () => {
  assert.throws(
    () =>
      validateEvent({
        id: "bad-person-slugs",
        year: 2003,
        award_slug: "turing-award",
        title: "Broken person slug row",
        significance: "Missing aligned person slugs",
        person_names: ["Example Person"],
      }),
    /person_slugs/,
  );
});

test("validateEvent rejects non-route-safe person slugs", () => {
  assert.throws(
    () =>
      validateEvent({
        id: "bad-route-safe-slug",
        year: 2004,
        award_slug: "turing-award",
        title: "Broken route-safe slug",
        significance: "Contains slash in person slug",
        person_names: ["Example Person"],
        person_slugs: ["example/person"],
      }),
    /non-route-safe entry in 'person_slugs'/,
  );
});

test("filterTimelineGroups applies query and decade filters", () => {
  const filtered = filterTimelineGroups(
    [
      {
        decade: "2020s",
        years: [
          {
            year: 2024,
            events: [
              {
                id: "e1",
                year: 2024,
                decade: "2020s",
                award_slug: "turing-award",
                award_name: "Turing Award",
                title: "Reinforcement learning foundations",
                person_names: ["Andrew G. Barto", "Richard S. Sutton"],
                person_slugs: ["andrew-g-barto", "richard-s-sutton"],
                person_label: "Andrew G. Barto, Richard S. Sutton",
                significance: "RL foundations",
                topics: ["artificial intelligence", "reinforcement learning"],
              },
            ],
          },
        ],
      },
      {
        decade: "2010s",
        years: [
          {
            year: 2018,
            events: [
              {
                id: "e2",
                year: 2018,
                decade: "2010s",
                award_slug: "turing-award",
                award_name: "Turing Award",
                title: "Deep learning renaissance",
                person_names: ["Yoshua Bengio", "Geoffrey Hinton", "Yann LeCun"],
                person_slugs: ["yoshua-bengio", "geoffrey-hinton", "yann-lecun"],
                person_label: "Yoshua Bengio, Geoffrey Hinton, Yann LeCun",
                significance: "Deep learning",
                topics: ["artificial intelligence", "deep learning"],
              },
            ],
          },
        ],
      },
    ],
    "deep learning",
    "2010s",
  );

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].decade, "2010s");
  assert.equal(filtered[0].years[0].events[0].id, "e2");
});
