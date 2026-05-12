import type { Metadata } from "next";
import atlasData from "@/src/generated/awards-atlas.generated.json";
import { SiteFooter, SiteHeader } from "@/src/components/site-chrome";
import { getSiteUrl, getSocialImageUrl, repositoryUrl, siteName } from "@/src/lib/site";

const siteUrl = getSiteUrl();
const socialImageUrl = getSocialImageUrl();

export const metadata: Metadata = {
  title: "Method and Sources",
  description:
    "Understand the current scope, sample coverage, source model, and provenance approach behind the Computing Awards Atlas.",
  ...(siteUrl
    ? {
        alternates: { canonical: `${siteUrl}/method/` },
        openGraph: {
          title: `Method and Sources | ${siteName}`,
          description:
            "Understand the current scope, sample coverage, source model, and provenance approach behind the Computing Awards Atlas.",
          url: `${siteUrl}/method/`,
          siteName,
          type: "website",
          images: [{ url: socialImageUrl }],
        },
        twitter: {
          title: `Method and Sources | ${siteName}`,
          description:
            "Understand the current scope, sample coverage, source model, and provenance approach behind the Computing Awards Atlas.",
          images: [socialImageUrl],
        },
      }
    : {}),
};

export default function MethodPage() {
  const jsonUrl = siteUrl ? `${siteUrl}/data/awards-atlas.json` : "/data/awards-atlas.json";
  const awardsJsonlUrl = siteUrl ? `${siteUrl}/data/awards.jsonl` : "/data/awards.jsonl";
  const eventsJsonlUrl = siteUrl ? `${siteUrl}/data/events.jsonl` : "/data/events.jsonl";

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
        <p className="eyebrow">Method and sources</p>
        <h1 className="page-title">How this atlas is currently built</h1>
        <p className="hero-text">
          This public release is a curated, static-first sample of major computing awards and representative laureates or
          influential-paper winners. It is designed to grow safely over time while keeping exported GitHub Pages output
          crawlable, auditable, and easy to extend.
        </p>
      </section>

      <section className="section-block method-grid">
        <article>
          <p className="eyebrow">Current scope</p>
          <h2>Representative coverage, not full historical completion yet</h2>
          <p className="hero-text compact-copy">{atlasData.coverage_note}</p>
          <ul className="method-list">
            <li>{atlasData.stats.award_count} award programs in the current public sample</li>
            <li>{atlasData.stats.event_count} representative events across laureates and influential-paper recognitions</li>
            <li>{atlasData.stats.people_count} currently modeled people with slug-based identity handling</li>
            <li>Current published snapshot generated at {new Date(atlasData.generated_at).toUTCString()}</li>
            <li>{atlasData.stats.event_level_source_count} events currently have a distinct source page beyond the general award/program page</li>
            <li>{atlasData.stats.program_level_source_count} events still rely only on broader program-level sources</li>
          </ul>
        </article>

        <article>
          <p className="eyebrow">Source model</p>
          <h2>JSONL authoring, static JSON publishing</h2>
          <p className="hero-text compact-copy">
            Source records live in JSONL so changes remain diff-friendly in git. Build-time normalization generates the
            public JSON used by the static site and also validates identifiers, URLs, and route-safety constraints.
            Published event snapshots are normalized exports rather than raw authoring rows.
          </p>
          <div className="award-card-actions">
            <a href={jsonUrl} className="text-link">
              Public JSON dataset
            </a>
            <a href={awardsJsonlUrl} className="text-link">
              awards.jsonl source snapshot
            </a>
            <a href={eventsJsonlUrl} className="text-link">
              events.jsonl normalized snapshot
            </a>
            <a href={repositoryUrl} className="text-link">
              Repository
            </a>
          </div>
        </article>
      </section>

      <section className="section-block method-grid">
        <article>
          <p className="eyebrow">Provenance approach</p>
          <h2>Official award pages plus representative related works</h2>
          <p className="hero-text compact-copy">
            Each award record links to an official program page. Each representative event can also carry related books,
            papers, software, or articles that help explain why the recognition matters. This is an interpretive public
            atlas, so provenance is surfaced as explanatory context rather than a raw archive dump.
          </p>
          <p className="meta-line compact-copy">
            In page-level UI, program-level source links identify the broader official award page or awards index, while
            books, papers, software, and articles are editorial context for why a recognition matters. Where available,
            event citations now point to year- or recipient-specific source material.
          </p>
          <p className="meta-line compact-copy">
            The exported JSON now distinguishes between <code>program-level</code> and <code>event-level</code> source
            scope so downstream consumers can tell whether a link is a broad award page or a specific award citation.
          </p>
          <p className="meta-line compact-copy">
            Related works are also tagged as <code>canonical</code> or <code>contextual</code> to distinguish stronger
            publisher/DOI/archive sources from lighter explanatory references.
          </p>
        </article>

        <article>
          <p className="eyebrow">What is next</p>
          <ul className="method-list">
            <li>Deeper recipient coverage for the highest-priority awards</li>
            <li>Conference 10-year / test-of-time expansion across more venues</li>
            <li>Stronger provenance surfacing directly in cards and detail pages</li>
            <li>Per-event official citation fields for recipient- and year-specific verification</li>
            <li>Continue replacing remaining secondary-reference links with more canonical publisher/archive pages</li>
          </ul>
        </article>
      </section>

      <section className="section-block method-grid">
        <article>
          <p className="eyebrow">Citation coverage</p>
          <h2>Which events still rely on broader program-level sources</h2>
          <p className="hero-text compact-copy">
            The table below lists every current sample event that still relies on a broader official award or awards-index
            source instead of a narrower event-specific source page.
          </p>
        </article>

        <article>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Person</th>
                  <th>Award</th>
                  <th>Event</th>
                </tr>
              </thead>
              <tbody>
                {atlasData.program_level_events.map((event) => (
                  <tr key={event.id}>
                    <td>{event.year}</td>
                    <td>{event.person_label}</td>
                    <td>{event.award_name}</td>
                    <td>
                      <a href={event.official_program_url} target="_blank" rel="noreferrer">
                        {event.title}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="meta-line compact-copy">Program-level rows are not errors; they indicate where the atlas still depends on a broader official award page or awards index rather than a narrower event-specific source.</p>
        </article>
      </section>

      <SiteFooter />
    </main>
  );
}
