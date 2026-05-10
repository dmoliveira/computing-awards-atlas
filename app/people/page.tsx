import type { Metadata } from "next";
import Link from "next/link";
import atlasData from "@/src/generated/awards-atlas.generated.json";
import { SiteFooter, SiteHeader } from "@/src/components/site-chrome";
import { getSiteUrl } from "@/src/lib/site";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "People Directory",
  description:
    "Browse the people currently represented in the Computing Awards Atlas, including sample award counts, latest representative events, and topical coverage.",
  ...(siteUrl
    ? {
        alternates: { canonical: `${siteUrl}/people/` },
        openGraph: { url: `${siteUrl}/people/` },
      }
    : {}),
};

export default function PeoplePage() {
  return (
    <main className="page-shell">
      <SiteHeader
        navItems={[
          { href: "/", label: "Home" },
          { href: "/#explorer", label: "Timeline" },
          { href: "/awards/", label: "Awards" },
          { href: "/people/", label: "People" },
          { href: "/#method", label: "Method" },
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

      <section className="section-block people-directory-grid">
        {atlasData.people.map((person) => (
          <article className="person-directory-card" key={person.slug}>
            <div className="person-directory-header">
              <div>
                <p className="eyebrow">{person.award_count > 1 ? "multi-award coverage" : "current sample"}</p>
                <h2>{person.name}</h2>
              </div>
              <span className="year-pill">{person.latest_year}</span>
            </div>

            <div className="directory-stats-row">
              <div className="stat-card">
                <strong>{person.award_count}</strong>
                <span>award programs</span>
              </div>
              <div className="stat-card">
                <strong>
                  {person.earliest_year}–{person.latest_year}
                </strong>
                <span>sample range</span>
              </div>
            </div>

            {person.latest_event ? (
              <div className="award-highlight-box">
                <p className="eyebrow">Latest representative sample</p>
                <h3>
                  {person.latest_event.year} · {person.latest_event.award_name}
                </h3>
                <p className="meta-line">{person.latest_event.title}</p>
              </div>
            ) : null}

            <p className="meta-line compact-copy">
              <strong>Awards:</strong> {person.awards.join(", ")}
            </p>

            <div className="browse-values">
              {person.topics.slice(0, 5).map((topic) => (
                <span key={`${person.name}-${topic}`}>{topic}</span>
              ))}
            </div>

            <div className="award-card-actions">
              <Link href={`/?q=${encodeURIComponent(person.name)}`} className="text-link">
                Search this person in the timeline
              </Link>
              {person.awards[0] ? (
                <Link href={`/?q=${encodeURIComponent(person.awards[0])}`} className="text-link">
                  Jump to related award
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </section>

      <SiteFooter />
    </main>
  );
}
