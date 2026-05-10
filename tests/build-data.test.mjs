import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { validateEvent } from "../scripts/data-utils.mjs";

test("build-data generates a usable static dataset", () => {
  execFileSync("node", ["scripts/build-data.mjs"], { stdio: "pipe" });

  const payload = JSON.parse(readFileSync("src/generated/awards-atlas.generated.json", "utf8"));
  const publicPayload = JSON.parse(readFileSync("public/data/awards-atlas.json", "utf8"));

  assert.ok(payload.stats.award_count >= 10);
  assert.ok(payload.stats.event_count >= 25);
  assert.ok(payload.awards.some((award) => award.slug === "turing-award"));
  assert.ok(payload.events.some((event) => event.id === "turing-2018-deep-learning"));
  assert.ok(payload.events.some((event) => event.id === "acm-prize-2025-zaharia"));
  assert.ok(payload.awards.some((award) => award.slug === "grace-murray-hopper-award" && award.event_count >= 1));
  assert.ok(payload.people.every((person) => typeof person.slug === "string" && person.slug.length > 0));
  assert.ok(payload.people.every((person) => !Object.hasOwn(person, "institutions")));
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
