import type { Metadata } from "next";
import { Suspense } from "react";
import atlasData from "@/src/generated/awards-atlas.generated.json";
import PeopleDirectoryClient from "@/src/components/people-directory-client";
import { SiteFooter, SiteHeader } from "@/src/components/site-chrome";
import { getSiteUrl, getSocialImageUrl, siteName } from "@/src/lib/site";

const siteUrl = getSiteUrl();
const socialImageUrl = getSocialImageUrl();

export const metadata: Metadata = {
  title: "People Directory",
  description:
    "Browse the people currently represented in the Computing Awards Atlas, including sample award counts, latest representative events, and topical coverage.",
  ...(siteUrl
    ? {
        alternates: { canonical: `${siteUrl}/people/` },
        openGraph: {
          title: `People Directory | ${siteName}`,
          description: "Browse the people currently represented in the Computing Awards Atlas, including sample award counts, latest representative events, and topical coverage.",
          url: `${siteUrl}/people/`,
          siteName,
          type: "website",
          images: [{ url: socialImageUrl }],
        },
        twitter: {
          title: `People Directory | ${siteName}`,
          description: "Browse the people currently represented in the Computing Awards Atlas, including sample award counts, latest representative events, and topical coverage.",
          images: [socialImageUrl],
        },
      }
    : {}),
};

function PeopleDirectoryFallback() {
  return (
    <section className="section-block people-directory-grid">
      {atlasData.people.slice(0, 4).map((person) => (
        <article className="person-directory-card" key={person.slug}>
          <div className="person-directory-header">
            <div>
              <p className="eyebrow">{person.award_count > 1 ? "multi-award coverage" : "current sample"}</p>
              <h2>{person.name}</h2>
            </div>
            <span className="year-pill">{person.latest_year}</span>
          </div>
          <p className="meta-line compact-copy">
            <strong>Awards:</strong> {person.awards.join(", ")}
          </p>
        </article>
      ))}
    </section>
  );
}

export default function PeoplePage() {
  const awardSlugByName = Object.fromEntries(
    atlasData.awards.flatMap((award) => [
      [award.name, award.slug],
      [award.short_name ?? award.name, award.slug],
    ]),
  );

  return (
    <main className="page-shell">
      <SiteHeader
        navItems={[
          { href: "/", label: "Home" },
          { href: "/timeline/", label: "Timeline" },
          { href: "/awards/", label: "Awards" },
          { href: "/people/", label: "People" },
          { href: "/method/", label: "Method" },
        ]}
      />

      <section className="section-block directory-hero">
        <p className="eyebrow">People</p>
        <h1 className="page-title">Browse the people represented in the atlas</h1>
        <p className="hero-text">
          This directory highlights the current sample of laureates, paper authors, and influential computing figures in
          the atlas, with their topical footprint, latest representative recognition, and quick paths back into the
          timeline explorer.
        </p>
      </section>

      <Suspense fallback={<PeopleDirectoryFallback />}>
        <PeopleDirectoryClient people={atlasData.people} awardSlugByName={awardSlugByName} />
      </Suspense>

      <SiteFooter />
    </main>
  );
}
