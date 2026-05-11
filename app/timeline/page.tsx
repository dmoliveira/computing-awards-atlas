import type { Metadata } from "next";
import { Suspense } from "react";
import TimelinePageClient from "@/src/components/timeline-page-client";
import { SiteFooter, SiteHeader } from "@/src/components/site-chrome";
import { getTimelineGroups } from "@/src/lib/atlas";
import { getSiteUrl, getSocialImageUrl, siteName } from "@/src/lib/site";

const siteUrl = getSiteUrl();
const socialImageUrl = getSocialImageUrl();
const timelineGroups = getTimelineGroups();

export const metadata: Metadata = {
  title: "Timeline",
  description: "Browse computing awards chronologically by decade and year, with linked award and person pages across the atlas sample.",
  ...(siteUrl
    ? {
        alternates: { canonical: `${siteUrl}/timeline/` },
        openGraph: {
          title: `Timeline | ${siteName}`,
          description: "Browse computing awards chronologically by decade and year, with linked award and person pages across the atlas sample.",
          url: `${siteUrl}/timeline/`,
          siteName,
          type: "website",
          images: [{ url: socialImageUrl }],
        },
        twitter: {
          title: `Timeline | ${siteName}`,
          description: "Browse computing awards chronologically by decade and year, with linked award and person pages across the atlas sample.",
          images: [socialImageUrl],
        },
      }
    : {}),
};

function TimelineFallback() {
  return (
    <section className="section-block timeline-groups">
      {timelineGroups.slice(0, 2).map((group) => (
        <section className="timeline-decade-block" key={group.decade}>
          <div className="section-heading-row timeline-heading-row">
            <div>
              <p className="eyebrow">Decade</p>
              <h2>{group.decade}</h2>
            </div>
          </div>
          {group.years.slice(0, 1).map((yearGroup) => (
            <div key={`${group.decade}-${yearGroup.year}`} className="timeline-year-block">
              <h3 className="timeline-year-heading">{yearGroup.year}</h3>
              <div className="award-events-grid">
                {yearGroup.events.slice(0, 1).map((event) => (
                  <article className="event-card" key={event.id}>
                    <div className="event-card-header">
                      <div>
                        <h3>{event.person_label}</h3>
                        <span className="meta-line">{event.award_name}</span>
                      </div>
                      <span className="year-pill">{event.year}</span>
                    </div>
                    <p className="event-note">{event.significance}</p>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
    </section>
  );
}

export default function TimelinePage() {
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
        <p className="eyebrow">Chronology</p>
        <h1 className="page-title">Browse recognition through time</h1>
        <p className="hero-text">
          This timeline page surfaces the atlas sample in decade and year order so you can move through the historical
          shape of recognition in computing, from foundational Turing eras to recent AI, retrieval, and data-engineering
          retrospectives.
        </p>
      </section>

      <Suspense fallback={<TimelineFallback />}>
        <TimelinePageClient groups={timelineGroups} />
      </Suspense>

      <SiteFooter />
    </main>
  );
}
