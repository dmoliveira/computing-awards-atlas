"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { getTimelineQueryHref } from "@/src/lib/site";

type Person = {
  slug: string;
  name: string;
  award_count: number;
  awards: string[];
  earliest_year: number;
  latest_year: number;
  topics: string[];
  latest_event: {
    year: number;
    award_name: string;
    title: string;
  } | null;
};

export default function PeopleDirectoryClient({
  people,
  awardSlugByName,
}: {
  people: Person[];
  awardSlugByName: Record<string, string>;
}) {
  const search = useSyncExternalStore(
    (callback) => {
      window.addEventListener("popstate", callback);
      return () => window.removeEventListener("popstate", callback);
    },
    () => window.location.search,
    () => "",
  );

  const params = new URLSearchParams(search);
  const query = params.get("q")?.trim() ?? "";

  const topTopics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const person of people) {
      for (const item of person.topics) {
        counts.set(item, (counts.get(item) ?? 0) + 1);
      }
    }
    return [
      "all",
      ...[...counts.entries()]
        .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
        .slice(0, 8)
        .map(([label]) => label),
    ];
  }, [people]);

  const rawTopic = params.get("topic");
  const topic = rawTopic && topTopics.includes(rawTopic) ? rawTopic : "all";

  const updateParams = (updates: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(search);

    for (const [key, value] of Object.entries(updates)) {
      if (value && value.trim()) {
        nextParams.set(key, value.trim());
      } else {
        nextParams.delete(key);
      }
    }

    const nextQuery = nextParams.toString();
    const nextUrl = nextQuery ? `${window.location.pathname}?${nextQuery}` : window.location.pathname;
    window.history.replaceState({}, "", nextUrl);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return people.filter((person) => {
      const matchesTopic = topic === "all" || person.topics.includes(topic);
      const haystack = [person.name, person.awards.join(" "), person.topics.join(" ")].join(" ").toLowerCase();
      const matchesQuery = normalizedQuery.length === 0 || haystack.includes(normalizedQuery);
      return matchesTopic && matchesQuery;
    });
  }, [people, query, topic]);

  return (
    <>
      <section className="section-block directory-controls-block">
        <div className="explorer-controls directory-controls-grid">
          <input
            aria-label="Search people directory"
            className="search-input"
            value={query}
            onChange={(event) => updateParams({ q: event.target.value })}
            placeholder="Search Andrew Barto, databases, Turing Award, reinforcement learning..."
          />
          <select
            className="sort-select"
            value={topic}
            onChange={(event) => updateParams({ topic: event.target.value === "all" ? null : event.target.value })}
          >
            {topTopics.map((value) => (
              <option key={value} value={value}>
                {value === "all" ? "All topics" : value}
              </option>
            ))}
          </select>
        </div>
        <p className="meta-line">{filtered.length} people match the current filters.</p>
      </section>

      <section className="section-block people-directory-grid">
        {filtered.length > 0 ? (
          filtered.map((person) => (
            <article className="person-directory-card" key={person.slug}>
              <div className="person-directory-header">
                <div>
                  <p className="eyebrow">{person.award_count > 1 ? "multi-award coverage" : "current sample"}</p>
                  <h2>
                    <Link href={`/people/${person.slug}/`} className="card-title-link">
                      {person.name}
                    </Link>
                  </h2>
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
                <strong>Awards:</strong>{" "}
                {person.awards.map((award, index) => (
                  <span key={`${person.slug}-${award}`}>
                    {index > 0 ? ", " : null}
                    <Link
                      href={awardSlugByName[award] ? `/awards/${awardSlugByName[award]}/` : getTimelineQueryHref(award)}
                      className="text-link"
                    >
                      {award}
                    </Link>
                  </span>
                ))}
              </p>

              <div className="browse-values">
                {person.topics.slice(0, 5).map((item) => (
                  <Link key={`${person.slug}-${item}`} href={getTimelineQueryHref(item)} className="browse-link-pill">
                    {item}
                  </Link>
                ))}
              </div>

              <div className="award-card-actions">
                <Link href={`/people/${person.slug}/`} className="text-link">
                  Open person page
                </Link>
                <Link href={getTimelineQueryHref(person.name)} className="text-link">
                  Search this person in the timeline
                </Link>
                {person.awards[0] ? (
                  <Link href={getTimelineQueryHref(person.awards[0])} className="text-link">
                    Jump to related award
                  </Link>
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <article className="award-highlight-box award-highlight-muted directory-empty-state">
            <p className="meta-line">No people match this search yet. Try a broader keyword or switch the topic filter.</p>
          </article>
        )}
      </section>
    </>
  );
}
