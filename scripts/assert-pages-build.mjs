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

const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/`;
const awardsUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/awards/`;
const peopleUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/people/`;
const turingAwardUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/awards/turing-award/`;
const andrewBartoUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/people/andrew-g-barto/`;
const sitemapUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`;
const assetPathMarker = `${process.env.PAGES_BASE_PATH}/_next/`;
const hostOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL).origin;

if (!indexHtml.includes(canonicalUrl)) {
  throw new Error(`Expected canonical URL ${canonicalUrl} in out/index.html`);
}

if (!indexHtml.includes(assetPathMarker)) {
  throw new Error(`Expected asset path marker ${assetPathMarker} in out/index.html`);
}

if (!awardsHtml.includes(awardsUrl)) {
  throw new Error(`Expected awards URL ${awardsUrl} in out/awards/index.html`);
}

if (!peopleHtml.includes(peopleUrl)) {
  throw new Error(`Expected people URL ${peopleUrl} in out/people/index.html`);
}

if (!turingAwardHtml.includes(turingAwardUrl)) {
  throw new Error(`Expected award detail URL ${turingAwardUrl} in out/awards/turing-award/index.html`);
}

if (!andrewBartoHtml.includes(andrewBartoUrl)) {
  throw new Error(`Expected person detail URL ${andrewBartoUrl} in out/people/andrew-g-barto/index.html`);
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
