export const siteName = "Computing Awards Atlas";
export const siteDescription =
  "Search major computing awards, laureates, influential papers, and milestone works across AI, databases, theory, systems, networking, and related fields.";
export const repositoryUrl = "https://github.com/dmoliveira/computing-awards-atlas";
const fallbackSiteUrl = "http://localhost:3000";

export function getBasePath() {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? process.env.PAGES_BASE_PATH ?? "";
}

export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const owner = process.env.GITHUB_REPOSITORY_OWNER;
  const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];

  if (owner && repo) {
    return `https://${owner}.github.io/${repo}`;
  }

  return null;
}

export function getRequiredSiteUrl() {
  const siteUrl = getSiteUrl();

  const requiresStrictSiteUrl = process.env.STATIC_EXPORT === "true" || process.env.GITHUB_ACTIONS === "true";

  if (!requiresStrictSiteUrl) {
    return siteUrl ?? "http://localhost:3000";
  }

  if (!siteUrl) {
    throw new Error("NEXT_PUBLIC_SITE_URL or GitHub repository environment must be set for static export SEO routes.");
  }

  return siteUrl;
}

export function getEffectiveSiteUrl() {
  return getSiteUrl() ?? fallbackSiteUrl;
}

export function getSocialImageUrl() {
  return `${getEffectiveSiteUrl()}/hero-banner.svg`;
}

export function getTimelineQueryHref(q: string, decade?: string) {
  return {
    pathname: "/timeline/",
    query: {
      q,
      ...(decade ? { decade } : {}),
    },
  };
}
