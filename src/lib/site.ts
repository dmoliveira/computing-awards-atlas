export const siteName = "Computing Awards Atlas";
export const siteDescription =
  "Search major computing awards, laureates, influential papers, and milestone works across AI, databases, theory, systems, networking, and related fields.";

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
