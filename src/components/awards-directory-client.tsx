"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { getTimelineQueryHref } from "@/src/lib/site";

type Award = {
  slug: string;
  name: string;
  short_name?: string;
  category: string;
  awarding_body: string;
  founded_year: number;
  scope: string;
  description: string;
  official_url: string;
  event_count: number;
  recipient_count: number;
  featured_topics: string[];
  sample_recipients: string[];
  latest_event: {
    year: number;
    title: string;
    person_label: string;
  } | null;
};

export default function AwardsDirectoryClient({
  awards,
  personSlugByName,
}: {
  awards: Award[];
  personSlugByName: Record<string, string>;
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

  const categories = useMemo(
    () => ["all", ...new Set(awards.map((award) => award.category))],
    [awards],
  );

  const rawCategory = params.get("category");
  const category = rawCategory && categories.includes(rawCategory) ? rawCategory : "all";

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
    return awards.filter((award) => {
      const matchesCategory = category === "all" || award.category === category;
      const haystack = [
        award.name,
        award.short_name,
        award.description,
        award.awarding_body,
        award.scope,
        award.featured_topics.join(" "),
        award.sample_recipients.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesQuery = normalizedQuery.length === 0 || haystack.includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [awards, category, query]);

  return (
    <>
      <section className="section-block directory-controls-block">
        <div className="explorer-controls directory-controls-grid">
          <input
            aria-label="Search awards directory"
            className="search-input"
            value={query}
            onChange={(event) => updateParams({ q: event.target.value })}
            placeholder="Search Turing Award, theory, ACM, machine learning..."
          />
          <select
            className="sort-select"
            value={category}
            onChange={(event) => updateParams({ category: event.target.value === "all" ? null : event.target.value })}
          >
            {categories.map((value) => (
              <option key={value} value={value}>
                {value === "all" ? "All categories" : value.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <p className="meta-line">{filtered.length} award programs match the current filters.</p>
      </section>

      <section className="section-block awards-directory-grid">
        {filtered.length > 0 ? (
          filtered.map((award) => (
            <article className="award-directory-card" key={award.slug}>
              <div className="award-directory-header">
                <div>
                  <p className="eyebrow">{award.category.replaceAll("_", " ")}</p>
                  <h2>
                    <Link href={`/awards/${award.slug}/`} className="card-title-link">
                      {award.short_name ?? award.name}
                    </Link>
                  </h2>
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

              <div className="award-card-actions">
                <Link href={`/awards/${award.slug}/`} className="text-link">
                  Open award page
                </Link>
                <Link href={getTimelineQueryHref(award.short_name ?? award.name)} className="text-link">
                  Search this award in the timeline
                </Link>
                <a href={award.official_url} target="_blank" rel="noreferrer" className="text-link">
                  Official award page
                </a>
              </div>
            </article>
          ))
        ) : (
          <article className="award-highlight-box award-highlight-muted directory-empty-state">
            <p className="meta-line">No award programs match this search yet. Try a broader keyword or reset the category filter.</p>
          </article>
        )}
      </section>
    </>
  );
}
