import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { validateEvent } from "../scripts/data-utils.mjs";

test("build-data generates a usable static dataset", () => {
  execFileSync("node", ["scripts/build-data.mjs"], { stdio: "pipe" });

  const payload = JSON.parse(readFileSync("src/generated/awards-atlas.generated.json", "utf8"));

  assert.ok(payload.stats.award_count >= 10);
  assert.ok(payload.stats.event_count >= 10);
  assert.ok(payload.awards.some((award) => award.slug === "turing-award"));
  assert.ok(payload.events.some((event) => event.id === "turing-2018-deep-learning"));
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
        related_works: [{ title: "Broken Link", type: "paper", year: 2001, url: "notaurl" }],
      }),
    /invalid 'url'/,
  );
});
