"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getTimelineQueryHref } from "@/src/lib/site";
import { filterTimelineGroups } from "@/src/lib/timeline";

type EventRecord = {
  id: string;
  year: number;
  decade: string;
  award_slug: string;
  award_name: string;
  title: string;
  person_names: string[];
  person_slugs: string[];
  person_label: string;
  topics: string[];
  significance: string;
};

type TimelineGroup = {
  decade: string;
  years: Array<{
    year: number;
    events: EventRecord[];
  }>;
};

function TimelineEvent({ event }: { event: EventRecord }) {
  return (
    <article className="event-card" key={event.id}>
      <div className="event-card-header">
        <div>
          <h3>
            {event.person_names.map((name, index) => (
              <span key={`${event.id}-${event.person_slugs[index]}`}>
                {index > 0 ? ", " : null}
                <Link href={`/people/${event.person_slugs[index]}/`} className="card-title-link">
                  {name}
                </Link>
              </span>
            ))}
          </h3>
          <span className="meta-line">
            <Link href={`/awards/${event.award_slug}/`} className="card-title-link">
              {event.award_name}
            </Link>
          </span>
        </div>
        <span className="year-pill">{event.year}</span>
      </div>
      <p className="meta-line compact-copy">{event.title}</p>
      <div className="tag-row">
        <span>{event.decade}</span>
        {event.topics.slice(0, 3).map((topic) => (
          <Link key={`${event.id}-${topic}`} href={getTimelineQueryHref(topic, event.decade)} className="browse-link-pill">
            {topic}
          </Link>
        ))}
      </div>
      <p className="event-note">{event.significance}</p>
    </article>
  );
}

export default function TimelinePageClient({ groups }: { groups: TimelineGroup[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const query = params.get("q")?.trim().toLowerCase() ?? "";
  const rawDecade = params.get("decade");
  const decadeOptions = ["all", ...groups.map((group) => group.decade)];
  const decade = rawDecade && decadeOptions.includes(rawDecade) ? rawDecade : "all";

  const updateParams = (updates: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value && value.trim()) {
        nextParams.set(key, value.trim());
      } else {
        nextParams.delete(key);
      }
    }
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  };

  const filteredGroups = filterTimelineGroups(groups, query, decade);

  return (
    <>
      <section className="section-block directory-controls-block">
        <div className="explorer-controls directory-controls-grid">
          <input
            aria-label="Search timeline page"
            className="search-input"
            value={params.get("q") ?? ""}
            onChange={(event) => updateParams({ q: event.target.value })}
            placeholder="Search by person, award, topic, year..."
          />
          <select
            className="sort-select"
            value={decade}
            onChange={(event) => updateParams({ decade: event.target.value === "all" ? null : event.target.value })}
          >
            {decadeOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All decades" : option}
              </option>
            ))}
          </select>
        </div>
        <p className="meta-line compact-copy">{filteredGroups.reduce((count, group) => count + group.years.reduce((sum, y) => sum + y.events.length, 0), 0)} timeline events match the current filters.</p>
      </section>

      <section className="section-block timeline-groups">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => (
            <section className="timeline-decade-block" key={group.decade}>
              <div className="section-heading-row timeline-heading-row">
                <div>
                  <p className="eyebrow">Decade</p>
                  <h2>{group.decade}</h2>
                </div>
              </div>
              {group.years.map((yearGroup) => (
                <div key={`${group.decade}-${yearGroup.year}`} className="timeline-year-block">
                  <h3 className="timeline-year-heading">{yearGroup.year}</h3>
                  <div className="award-events-grid">
                    {yearGroup.events.map((event) => (
                      <TimelineEvent key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ))
        ) : (
          <article className="award-highlight-box award-highlight-muted directory-empty-state">
            <p className="meta-line">No timeline entries match the current filters yet. Try a broader query or reset the decade filter.</p>
          </article>
        )}
      </section>
    </>
  );
}
