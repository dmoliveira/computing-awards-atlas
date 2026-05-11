import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/src/components/site-chrome";
import { getEventsForPerson, getPersonBySlug } from "@/src/lib/atlas";
import { getSiteUrl, getSocialImageUrl, getTimelineQueryHref, siteName } from "@/src/lib/site";

const siteUrl = getSiteUrl();
const socialImageUrl = getSocialImageUrl();

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const atlasData = (await import("@/src/generated/awards-atlas.generated.json")).default;
  return atlasData.people.map((person) => ({ slug: person.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const person = getPersonBySlug(slug);

  if (!person) {
    return { title: "Person not found" };
  }

  return {
    title: person.name,
    description: `Browse representative awards, topics, and related works for ${person.name} in the Computing Awards Atlas.`,
    ...(siteUrl
      ? {
          alternates: { canonical: `${siteUrl}/people/${person.slug}/` },
          openGraph: {
            title: `${person.name} | ${siteName}`,
            description: `Browse representative awards, topics, and related works for ${person.name} in the Computing Awards Atlas.`,
            url: `${siteUrl}/people/${person.slug}/`,
            siteName,
            type: "website",
            images: [{ url: socialImageUrl }],
          },
          twitter: {
            title: `${person.name} | ${siteName}`,
            description: `Browse representative awards, topics, and related works for ${person.name} in the Computing Awards Atlas.`,
            images: [socialImageUrl],
          },
        }
      : {}),
  };
}

export default async function PersonDetailPage({ params }: Props) {
  const { slug } = await params;
  const person = getPersonBySlug(slug);

  if (!person) {
    notFound();
  }

  const events = getEventsForPerson(slug);
  const awardLinks = [...new Map(events.map((event) => [event.award_slug, event.award_name])).entries()];

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
        <p className="eyebrow">Person</p>
        <h1 className="page-title">{person.name}</h1>
        <p className="hero-text">
          Representative recognition history, related topics, and linked award coverage for {person.name} in the public
          atlas sample.
        </p>

        <div className="directory-stats-row award-detail-stats">
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
          <div className="stat-card">
            <strong>{events.length}</strong>
            <span>sample events</span>
          </div>
        </div>

        <div className="award-card-actions">
          <Link href={getTimelineQueryHref(person.name)} className="text-link">
            Search this person in the timeline
          </Link>
          <Link href="/people/" className="text-link">
            Back to people directory
          </Link>
          <Link href="/method/" className="text-link">
            Method and sources
          </Link>
          {person.awards[0] ? (
            <Link href={getTimelineQueryHref(person.awards[0])} className="text-link">
              Jump to related award
            </Link>
          ) : null}
        </div>
      </section>

      <section className="section-block method-grid award-detail-meta-grid">
        <article>
          <p className="eyebrow">Awards</p>
          <h2>
            {awardLinks.map(([awardSlug, awardName], index) => (
              <span key={awardSlug}>
                {index > 0 ? " · " : null}
                <Link href={`/awards/${awardSlug}/`} className="card-title-link">
                  {awardName}
                </Link>
              </span>
            ))}
          </h2>
          <p className="hero-text compact-copy">
            This page aggregates the award programs currently associated with this person in the atlas sample and links
            them back into the broader timeline explorer.
          </p>
        </article>

        <article>
          <p className="eyebrow">Topics</p>
          <div className="browse-values">
            {person.topics.map((topic) => (
              <Link key={`${person.slug}-${topic}`} href={getTimelineQueryHref(topic)} className="browse-link-pill">
                {topic}
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="section-block">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Representative timeline</p>
            <h2>Recognitions and related works</h2>
          </div>
        </div>

        <div className="award-events-grid">
          {events.length > 0 ? (
            events.map((event) => (
              <article className="event-card" key={event.id}>
                <div className="event-card-header">
                  <div>
                    <h3>
                      <Link href={`/awards/${event.award_slug}/`} className="card-title-link">
                        {event.award_name}
                      </Link>
                    </h3>
                    <span className="meta-line">{event.title}</span>
                  </div>
                  <span className="year-pill">{event.year}</span>
                </div>

                {event.person_names.length > 1 ? (
                  <p className="meta-line compact-copy">
                    <strong>Co-honorees:</strong>{" "}
                    {event.person_names.map((personName, index) => {
                      const personSlug = event.person_slugs[index];
                      const isCurrentPerson = personSlug === person.slug;
                      return (
                        <span key={`${event.id}-${personSlug}`}>
                          {index > 0 ? ", " : null}
                          {isCurrentPerson ? (
                            personName
                          ) : (
                            <Link href={`/people/${personSlug}/`} className="card-title-link">
                              {personName}
                            </Link>
                          )}
                        </span>
                      );
                    })}
                  </p>
                ) : (
                  <p className="meta-line compact-copy">
                    <strong>Recipient:</strong> {event.person_label}
                  </p>
                )}
                <p className="event-note">{event.significance}</p>
                <p className="meta-line compact-copy">
                  <strong>Program-level source:</strong>{" "}
                  <a href={event.official_program_url} target="_blank" rel="noreferrer">
                    {event.official_program_label}
                  </a>
                  <span> (not a year-specific citation)</span>
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
              <p className="meta-line">Recognition samples for this person are still being expanded in a future coverage pass.</p>
            </article>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
