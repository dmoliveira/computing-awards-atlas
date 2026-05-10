import { readFile } from "node:fs/promises";

const requiredEnv = ["PAGES_BASE_PATH", "NEXT_PUBLIC_SITE_URL"];

for (const name of requiredEnv) {
  if (!process.env[name]) {
    throw new Error(`Missing required env ${name} for Pages build assertions.`);
  }
}

const [indexHtml, robotsTxt, sitemapXml] = await Promise.all([
  readFile("out/index.html", "utf8"),
  readFile("out/robots.txt", "utf8"),
  readFile("out/sitemap.xml", "utf8"),
]);

const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/`;
const sitemapUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`;
const assetPathMarker = `${process.env.PAGES_BASE_PATH}/_next/`;

if (!indexHtml.includes(canonicalUrl)) {
  throw new Error(`Expected canonical URL ${canonicalUrl} in out/index.html`);
}

if (!indexHtml.includes(assetPathMarker)) {
  throw new Error(`Expected asset path marker ${assetPathMarker} in out/index.html`);
}

if (!robotsTxt.includes(`Sitemap: ${sitemapUrl}`)) {
  throw new Error(`Expected sitemap URL ${sitemapUrl} in out/robots.txt`);
}

if (!sitemapXml.includes(`<loc>${canonicalUrl}</loc>`)) {
  throw new Error(`Expected canonical location ${canonicalUrl} in out/sitemap.xml`);
}

console.log(JSON.stringify({ canonicalUrl, sitemapUrl, assetPathMarker }));
