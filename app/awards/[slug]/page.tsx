import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/src/components/site-chrome";
import { getAwardBySlug, getEventsForAward } from "@/src/lib/atlas";
import { getSiteUrl, getSocialImageUrl, getTimelineQueryHref, siteName } from "@/src/lib/site";

const siteUrl = getSiteUrl();
const socialImageUrl = getSocialImageUrl();

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const atlasData = (await import("@/src/generated/awards-atlas.generated.json")).default;
  return atlasData.awards.map((award) => ({ slug: award.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const award = getAwardBySlug(slug);

  if (!award) {
    return {
      title: "Award not found",
    };
  }

  return {
    title: `${award.short_name ?? award.name}`,
    description: `${award.description} Browse representative recipients, related works, and current timeline coverage.`,
    ...(siteUrl
      ? {
          alternates: { canonical: `${siteUrl}/awards/${award.slug}/` },
          openGraph: {
            title: `${award.short_name ?? award.name} | ${siteName}`,
            description: `${award.description} Browse representative recipients, related works, and current timeline coverage.`,
            url: `${siteUrl}/awards/${award.slug}/`,
            siteName,
            type: "website",
            images: [{ url: socialImageUrl }],
          },
          twitter: {
            title: `${award.short_name ?? award.name} | ${siteName}`,
            description: `${award.description} Browse representative recipients, related works, and current timeline coverage.`,
            images: [socialImageUrl],
          },
        }
      : {}),
  };
}

export default async function AwardDetailPage({ params }: Props) {
  const { slug } = await params;
  const award = getAwardBySlug(slug);

  if (!award) {
    notFound();
  }

  const events = getEventsForAward(slug);
  const personSlugByName = Object.fromEntries(events.flatMap((event) => event.person_names.map((name, index) => [name, event.person_slugs[index]])));

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

      <section className="section-block directory-hero award-detail-hero">
        <p className="eyebrow">{award.category.replaceAll("_", " ")}</p>
        <h1 className="page-title">{award.name}</h1>
        <p className="hero-text">{award.description}</p>

        <div className="directory-stats-row award-detail-stats">
          <div className="stat-card">
            <strong>{award.founded_year}</strong>
            <span>founded</span>
          </div>
          <div className="stat-card">
            <strong>{award.event_count}</strong>
            <span>sample events</span>
          </div>
          <div className="stat-card">
            <strong>{award.recipient_count}</strong>
            <span>sample recipients</span>
          </div>
          <div className="stat-card">
            <strong>{award.cadence}</strong>
            <span>cadence</span>
          </div>
        </div>

        <div className="award-card-actions">
          <Link href={getTimelineQueryHref(award.short_name ?? award.name)} className="text-link">
            Search this award in the timeline
          </Link>
          <Link href="/awards/" className="text-link">
            Back to awards directory
          </Link>
          <Link href="/method/" className="text-link">
            Method and sources
          </Link>
          <a href={award.official_url} target="_blank" rel="noreferrer" className="text-link">
            Official award page
          </a>
        </div>
      </section>

      <section className="section-block method-grid award-detail-meta-grid">
        <article>
          <p className="eyebrow">Scope</p>
          <h2>{award.scope}</h2>
          <p className="hero-text compact-copy">
            Awarding body: {award.awarding_body}. Region: {award.region}. Current page shows representative timeline
            coverage already loaded into the public atlas.
          </p>
        </article>

        <article>
          <p className="eyebrow">Featured topics</p>
          <div className="browse-values">
            {award.featured_topics.map((topic) => (
              <Link key={`${award.slug}-${topic}`} href={getTimelineQueryHref(topic)} className="browse-link-pill">
                {topic}
              </Link>
            ))}
          </div>
          {award.sample_recipients.length > 0 ? (
            <p className="meta-line compact-copy">
              <strong>Sample names:</strong>{" "}
              {award.sample_recipients.map((name, index) => (
                <span key={`${award.slug}-${name}`}>
                  {index > 0 ? ", " : null}
                  <Link
                    href={personSlugByName[name] ? `/people/${personSlugByName[name]}/` : getTimelineQueryHref(name)}
                    className="text-link"
                  >
                    {name}
                  </Link>
                </span>
              ))}
            </p>
          ) : null}
        </article>
      </section>

      <section className="section-block">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Representative timeline</p>
            <h2>Sample recipients and influential works</h2>
          </div>
        </div>

        <div className="award-events-grid">
          {events.length > 0 ? (
            events.map((event) => (
              <article className="event-card" key={event.id}>
                <div className="event-card-header">
                  <div>
                    <h3>
                      {event.person_names.map((personName, index) => (
                        <span key={`${event.id}-${event.person_slugs[index]}`}>
                          {index > 0 ? ", " : null}
                          <Link href={`/people/${event.person_slugs[index]}/`} className="card-title-link">
                            {personName}
                          </Link>
                        </span>
                      ))}
                    </h3>
                    <span className="meta-line">{event.title}</span>
                  </div>
                  <span className="year-pill">{event.year}</span>
                </div>

                <p className="event-note">{event.significance}</p>
                <p className="meta-line compact-copy">
                  <strong>{event.event_source_url ? "Event citation" : "Program-level source"}:</strong>{" "}
                  <a href={event.event_source_url ?? event.official_program_url} target="_blank" rel="noreferrer">
                    {event.event_source_label ?? event.official_program_label}
                  </a>
                  <span>{event.event_source_url ? " (year/event-specific)" : " (not a year-specific citation)"}</span>
                </p>

                <div className="tag-row">
                  <span>{event.decade}</span>
                  {event.topics.slice(0, 3).map((topic) => (
                    <span key={`${event.id}-${topic}`}>{topic}</span>
                  ))}
                </div>

                {event.related_works.length > 0 ? (
                  <>
                    <p className="eyebrow compact-copy">Related work / context</p>
                    <ul className="works-list">
                    {event.related_works.map((work) => (
                      <li key={`${event.id}-${work.title}`}>
                        <a href={work.url} target="_blank" rel="noreferrer">
                          {work.title}
                        </a>{" "}
                        <span>
                          ({work.type}, {work.year})
                        </span>
                      </li>
                    ))}
                    </ul>
                  </>
                ) : null}
              </article>
            ))
          ) : (
            <article className="award-highlight-box award-highlight-muted">
              <p className="meta-line">Recipient and work samples for this award are still being expanded in a future coverage pass.</p>
            </article>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
