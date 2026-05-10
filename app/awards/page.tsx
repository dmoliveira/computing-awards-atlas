import type { Metadata } from "next";
import Link from "next/link";
import atlasData from "@/src/generated/awards-atlas.generated.json";
import { SiteFooter, SiteHeader } from "@/src/components/site-chrome";
import { getSiteUrl } from "@/src/lib/site";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Awards Directory",
  description:
    "Browse major computing award programs, sample laureates, recent representative winners, and related topical coverage.",
  ...(siteUrl
    ? {
        alternates: { canonical: `${siteUrl}/awards/` },
        openGraph: { url: `${siteUrl}/awards/` },
      }
    : {}),
};

export default function AwardsPage() {
  return (
    <main className="page-shell">
      <SiteHeader
        navItems={[
          { href: "/", label: "Home" },
          { href: "/#explorer", label: "Timeline" },
          { href: "/awards/", label: "Awards" },
          { href: "/#method", label: "Method" },
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

      <section className="section-block awards-directory-grid">
        {atlasData.awards.map((award) => (
          <article className="award-directory-card" key={award.slug}>
            <div className="award-directory-header">
              <div>
                <p className="eyebrow">{award.category.replaceAll("_", " ")}</p>
                <h2>{award.short_name ?? award.name}</h2>
              </div>
              <span className="year-pill">{award.founded_year}</span>
            </div>

            <p className="hero-text compact-copy">{award.description}</p>

            <div className="directory-stats-row">
              <div className="stat-card">
                <strong>{award.event_count}</strong>
                <span>sample events</span>
              </div>
              <div className="stat-card">
                <strong>{award.recipient_count}</strong>
                <span>sample recipients</span>
              </div>
            </div>

            <p className="meta-line">
              <strong>Awarding body:</strong> {award.awarding_body}
            </p>
            <p className="meta-line">
              <strong>Scope:</strong> {award.scope}
            </p>

            {award.latest_event ? (
              <div className="award-highlight-box">
                <p className="eyebrow">Latest representative sample</p>
                <h3>
                  {award.latest_event.year} · {award.latest_event.person_label}
                </h3>
                <p className="meta-line">{award.latest_event.title}</p>
              </div>
            ) : (
              <div className="award-highlight-box award-highlight-muted">
                <p className="meta-line">Recipient/event samples for this program are still queued for a later coverage pass.</p>
              </div>
            )}

            <div className="browse-values">
              {award.featured_topics.map((topic) => (
                <span key={`${award.slug}-${topic}`}>{topic}</span>
              ))}
            </div>

            {award.sample_recipients.length > 0 ? (
              <p className="meta-line compact-copy">
                <strong>Sample names:</strong> {award.sample_recipients.join(", ")}
              </p>
            ) : null}

            <div className="award-card-actions">
              <Link href={`/?q=${encodeURIComponent(award.short_name ?? award.name)}`} className="text-link">
                Search this award in the timeline
              </Link>
              <a href={award.official_url} target="_blank" rel="noreferrer" className="text-link">
                Official award page
              </a>
            </div>
          </article>
        ))}
      </section>

      <SiteFooter />
    </main>
  );
}
