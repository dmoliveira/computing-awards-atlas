import { readFile } from "node:fs/promises";

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

const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/`;
const awardsUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/awards/`;
const peopleUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/people/`;
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

console.log(JSON.stringify({ canonicalUrl, awardsUrl, peopleUrl, sitemapUrl, assetPathMarker, hostOrigin }));
