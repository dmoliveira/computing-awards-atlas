import type { Metadata } from "next";
import { Suspense } from "react";
import atlasData from "@/src/generated/awards-atlas.generated.json";
import AwardsDirectoryClient from "@/src/components/awards-directory-client";
import { SiteFooter, SiteHeader } from "@/src/components/site-chrome";
import { getSiteUrl, getSocialImageUrl, siteName } from "@/src/lib/site";

const siteUrl = getSiteUrl();
const socialImageUrl = getSocialImageUrl();

export const metadata: Metadata = {
  title: "Awards Directory",
  description:
    "Browse major computing award programs, sample laureates, recent representative winners, and related topical coverage.",
  ...(siteUrl
    ? {
        alternates: { canonical: `${siteUrl}/awards/` },
        openGraph: {
          title: `Awards Directory | ${siteName}`,
          description: "Browse major computing award programs, sample laureates, recent representative winners, and related topical coverage.",
          url: `${siteUrl}/awards/`,
          siteName,
          type: "website",
          images: [{ url: socialImageUrl }],
        },
        twitter: {
          title: `Awards Directory | ${siteName}`,
          description: "Browse major computing award programs, sample laureates, recent representative winners, and related topical coverage.",
          images: [socialImageUrl],
        },
      }
    : {}),
};

function AwardsDirectoryFallback() {
  return (
    <section className="section-block awards-directory-grid">
      {atlasData.awards.slice(0, 4).map((award) => (
        <article className="award-directory-card" key={award.slug}>
          <div className="award-directory-header">
            <div>
              <p className="eyebrow">{award.category.replaceAll("_", " ")}</p>
              <h2>{award.short_name ?? award.name}</h2>
            </div>
            <span className="year-pill">{award.founded_year}</span>
          </div>
          <p className="hero-text compact-copy">{award.description}</p>
        </article>
      ))}
    </section>
  );
}

export default function AwardsPage() {
  const personSlugByName = Object.fromEntries(atlasData.people.map((person) => [person.name, person.slug]));

  return (
    <main className="page-shell">
      <SiteHeader
        navItems={[
          { href: "/", label: "Home" },
          { href: "/#explorer", label: "Timeline" },
          { href: "/awards/", label: "Awards" },
          { href: "/people/", label: "People" },
          { href: "/method/", label: "Method" },
        ]}
      />

      <section className="section-block directory-hero">
        <p className="eyebrow">Award programs</p>
        <h1 className="page-title">Browse the awards behind the atlas</h1>
        <p className="hero-text">
          This directory shows which award programs are already represented in the atlas, their scope, founding year,
          current sample coverage, and direct jump-offs back into the searchable timeline.
        </p>
      </section>

      <Suspense fallback={<AwardsDirectoryFallback />}>
        <AwardsDirectoryClient awards={atlasData.awards} personSlugByName={personSlugByName} />
      </Suspense>

      <SiteFooter />
    </main>
  );
}
