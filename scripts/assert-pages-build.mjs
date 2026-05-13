import { readFile } from "node:fs/promises";
import atlasData from "../src/generated/awards-atlas.generated.json" with { type: "json" };

const requiredEnv = ["PAGES_BASE_PATH", "NEXT_PUBLIC_SITE_URL"];

for (const name of requiredEnv) {
  if (!process.env[name]) {
    throw new Error(`Missing required env ${name} for Pages build assertions.`);
  }
}

const [indexHtml, awardsHtml, peopleHtml, robotsTxt, sitemapXml] = await Promise.all([
  readFile("out/index.html", "utf8"),
  readFile("out/awards/index.html", "utf8"),
  readFile("out/people/index.html", "utf8"),
  readFile("out/robots.txt", "utf8"),
  readFile("out/sitemap.xml", "utf8"),
]);
const turingAwardHtml = await readFile("out/awards/turing-award/index.html", "utf8");
const andrewBartoHtml = await readFile("out/people/andrew-g-barto/index.html", "utf8");
const acmPrizeHtml = await readFile("out/awards/acm-prize-in-computing/index.html", "utf8");
const torstenHoeflerHtml = await readFile("out/people/torsten-hoefler/index.html", "utf8");
const methodHtml = await readFile("out/method/index.html", "utf8");
const timelineHtml = await readFile("out/timeline/index.html", "utf8");

const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/`;
const awardsUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/awards/`;
const peopleUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/people/`;
const turingAwardUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/awards/turing-award/`;
const andrewBartoUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/people/andrew-g-barto/`;
const methodUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/method/`;
const timelineUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/timeline/`;
const sitemapUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`;
const assetPathMarker = `${process.env.PAGES_BASE_PATH}/_next/`;
const hostOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL).origin;
const socialImageUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/hero-banner.svg`;

if (!indexHtml.includes(canonicalUrl)) {
  throw new Error(`Expected canonical URL ${canonicalUrl} in out/index.html`);
}

if (!indexHtml.includes(socialImageUrl)) {
  throw new Error(`Expected social image URL ${socialImageUrl} in out/index.html`);
}

if (!indexHtml.includes(assetPathMarker)) {
  throw new Error(`Expected asset path marker ${assetPathMarker} in out/index.html`);
}

if (!indexHtml.includes(`${process.env.PAGES_BASE_PATH}/awards/turing-award/`)) {
  throw new Error("Expected homepage browse index to include at least one award detail link");
}

if (!indexHtml.includes(`${process.env.PAGES_BASE_PATH}/people/alan-j-perlis/`)) {
  throw new Error("Expected homepage browse index to include at least one person detail link");
}

if (!indexHtml.includes("Official award pages act as the primary program sources in this atlas.")) {
  throw new Error("Expected homepage to include provenance guidance near the explorer");
}

if (!awardsHtml.includes(awardsUrl)) {
  throw new Error(`Expected awards URL ${awardsUrl} in out/awards/index.html`);
}

if (!awardsHtml.includes(`${process.env.PAGES_BASE_PATH}/awards/turing-award/`)) {
  throw new Error("Expected awards directory to include at least one award detail link");
}

if (!new RegExp(`${process.env.PAGES_BASE_PATH}/timeline/\\?q=Turing(?:%20|\\+)Award`).test(awardsHtml)) {
  throw new Error("Expected awards directory to include at least one timeline jump link");
}

if (!peopleHtml.includes(peopleUrl)) {
  throw new Error(`Expected people URL ${peopleUrl} in out/people/index.html`);
}

if (!methodHtml.includes(methodUrl)) {
  throw new Error(`Expected method URL ${methodUrl} in out/method/index.html`);
}

if (!timelineHtml.includes(timelineUrl)) {
  throw new Error(`Expected timeline URL ${timelineUrl} in out/timeline/index.html`);
}

if (!new RegExp(`${process.env.PAGES_BASE_PATH}/awards/[a-z0-9-]+/`).test(timelineHtml)) {
  throw new Error("Expected timeline page to include award detail links");
}

if (!new RegExp(`${process.env.PAGES_BASE_PATH}/people/[a-z0-9-]+/`).test(timelineHtml)) {
  throw new Error("Expected timeline page to include person detail links");
}

if (!methodHtml.includes(`${process.env.NEXT_PUBLIC_SITE_URL}/data/awards-atlas.json`)) {
  throw new Error("Expected method page to link to the public JSON dataset snapshot");
}

if (!methodHtml.includes(`${process.env.NEXT_PUBLIC_SITE_URL}/data/awards.jsonl`)) {
  throw new Error("Expected method page to link to the published awards.jsonl snapshot");
}

if (!methodHtml.includes(`${process.env.NEXT_PUBLIC_SITE_URL}/data/events.jsonl`)) {
  throw new Error("Expected method page to link to the published events.jsonl snapshot");
}

if (!methodHtml.includes("events currently have a distinct source page beyond the general award/program page") || !methodHtml.includes("events still rely only on broader program-level sources")) {
  throw new Error("Expected method page to surface provenance coverage counts");
}

if (!methodHtml.includes("Which events still rely on broader program-level sources")) {
  throw new Error("Expected method page to include a provenance coverage table");
}

if (!methodHtml.includes("Per-award provenance dashboard") || !methodHtml.includes("Coverage quality by award program")) {
  throw new Error("Expected method page to include a per-award provenance dashboard");
}

if (!methodHtml.includes("program-level") || !methodHtml.includes("event-level")) {
  throw new Error("Expected method page to explain exported provenance scope and specificity");
}

if (!methodHtml.includes("event-level") || !methodHtml.includes("specific award citation")) {
  throw new Error("Expected method page to describe event-level citation support");
}

if (!peopleHtml.includes(`${process.env.PAGES_BASE_PATH}/people/andrew-g-barto/`)) {
  throw new Error("Expected people directory to include at least one person detail link");
}

if (!new RegExp(`${process.env.PAGES_BASE_PATH}/timeline/\\?q=Andrew(?:%20|\\+)G\.(?:%20|\\+)Barto`).test(peopleHtml)) {
  throw new Error("Expected people directory to include at least one timeline jump link");
}

if (!turingAwardHtml.includes(turingAwardUrl)) {
  throw new Error(`Expected award detail URL ${turingAwardUrl} in out/awards/turing-award/index.html`);
}

if (!turingAwardHtml.includes("Related work / context") || !turingAwardHtml.includes("Official award page")) {
  throw new Error("Expected award detail page to include provenance labels");
}

if (!turingAwardHtml.includes("not a year-specific citation")) {
  throw new Error("Expected award detail page to include clarified program-level provenance labeling");
}

if (!acmPrizeHtml.includes("Event source") || !acmPrizeHtml.includes("year/event-specific")) {
  throw new Error("Expected at least one award detail page to include event-level source labeling");
}

if (!andrewBartoHtml.includes(andrewBartoUrl)) {
  throw new Error(`Expected person detail URL ${andrewBartoUrl} in out/people/andrew-g-barto/index.html`);
}

if (!andrewBartoHtml.includes("Related work / context")) {
  throw new Error("Expected person detail page to include provenance labels");
}

if (!andrewBartoHtml.includes("not a year-specific citation")) {
  throw new Error("Expected person detail page to include clarified program-level provenance labeling");
}

if (!torstenHoeflerHtml.includes("Event source") || !torstenHoeflerHtml.includes("year/event-specific")) {
  throw new Error("Expected at least one person detail page to include event-level source labeling");
}

if (
  !turingAwardHtml.includes(`${process.env.NEXT_PUBLIC_SITE_URL}/people/andrew-g-barto/`) &&
  !turingAwardHtml.includes(`${process.env.PAGES_BASE_PATH}/people/andrew-g-barto/`)
) {
  throw new Error("Expected award detail page to link to related person detail pages");
}

if (
  !andrewBartoHtml.includes(`${process.env.NEXT_PUBLIC_SITE_URL}/awards/turing-award/`) &&
  !andrewBartoHtml.includes(`${process.env.PAGES_BASE_PATH}/awards/turing-award/`)
) {
  throw new Error("Expected person detail page to link to related award detail pages");
}

if (
  !andrewBartoHtml.includes(`${process.env.NEXT_PUBLIC_SITE_URL}/people/richard-s-sutton/`) &&
  !andrewBartoHtml.includes(`${process.env.PAGES_BASE_PATH}/people/richard-s-sutton/`)
) {
  throw new Error("Expected person detail page to link to co-honoree detail pages");
}

if (!robotsTxt.includes(`Sitemap: ${sitemapUrl}`)) {
  throw new Error(`Expected sitemap URL ${sitemapUrl} in out/robots.txt`);
}

if (!robotsTxt.includes(`Host: ${hostOrigin}`)) {
  throw new Error(`Expected host origin ${hostOrigin} in out/robots.txt`);
}

if (!sitemapXml.includes(`<loc>${canonicalUrl}</loc>`)) {
  throw new Error(`Expected canonical location ${canonicalUrl} in out/sitemap.xml`);
}

if (!sitemapXml.includes(`<loc>${awardsUrl}</loc>`)) {
  throw new Error(`Expected awards location ${awardsUrl} in out/sitemap.xml`);
}

if (!sitemapXml.includes(`<loc>${peopleUrl}</loc>`)) {
  throw new Error(`Expected people location ${peopleUrl} in out/sitemap.xml`);
}

if (!sitemapXml.includes(`<loc>${methodUrl}</loc>`)) {
  throw new Error(`Expected method location ${methodUrl} in out/sitemap.xml`);
}

if (!sitemapXml.includes(`<loc>${timelineUrl}</loc>`)) {
  throw new Error(`Expected timeline location ${timelineUrl} in out/sitemap.xml`);
}

if (!sitemapXml.includes(`<loc>${turingAwardUrl}</loc>`)) {
  throw new Error(`Expected award detail location ${turingAwardUrl} in out/sitemap.xml`);
}

if (!sitemapXml.includes(`<loc>${andrewBartoUrl}</loc>`)) {
  throw new Error(`Expected person detail location ${andrewBartoUrl} in out/sitemap.xml`);
}

for (const award of atlasData.awards) {
  const awardUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/awards/${award.slug}/`;
  const detailHtml = await readFile(`out/awards/${award.slug}/index.html`, "utf8");

  if (!detailHtml.includes(awardUrl)) {
    throw new Error(`Expected award detail URL ${awardUrl} in out/awards/${award.slug}/index.html`);
  }

  if (!sitemapXml.includes(`<loc>${awardUrl}</loc>`)) {
    throw new Error(`Expected award detail location ${awardUrl} in out/sitemap.xml`);
  }
}

for (const person of atlasData.people) {
  const personUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/people/${person.slug}/`;
  const detailHtml = await readFile(`out/people/${person.slug}/index.html`, "utf8");

  if (!detailHtml.includes(personUrl)) {
    throw new Error(`Expected person detail URL ${personUrl} in out/people/${person.slug}/index.html`);
  }

  if (!sitemapXml.includes(`<loc>${personUrl}</loc>`)) {
    throw new Error(`Expected person detail location ${personUrl} in out/sitemap.xml`);
  }
}

console.log(JSON.stringify({ canonicalUrl, awardsUrl, peopleUrl, turingAwardUrl, andrewBartoUrl, sitemapUrl, assetPathMarker, hostOrigin }));
