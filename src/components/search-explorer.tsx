"use client";

import { useEffect, useMemo } from "react";
import Fuse from "fuse.js";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type RelatedWork = {
  title: string;
  type: string;
  year: number;
  url: string;
};

type EventRecord = {
  id: string;
  year: number;
  decade: string;
  award_slug: string;
  award_name: string;
  award_category: string;
  official_program_label: string;
  official_program_url: string;
  source_scope: string;
  citation_specificity: string;
  title: string;
  person_names: string[];
  person_slugs: string[];
  person_label: string;
  topics: string[];
  institutions: string[];
  significance: string;
  related_works: RelatedWork[];
  search_blob: string;
};

type AwardRecord = {
  slug: string;
  name: string;
  short_name?: string;
};

type TopicRecord = {
  topic: string;
  count: number;
};

type AtlasData = {
  awards: AwardRecord[];
  events: EventRecord[];
  topics: TopicRecord[];
  stats: {
    award_count: number;
    event_count: number;
    people_count: number;
    year_start: number;
    year_end: number;
  };
};

type Props = {
  data: AtlasData;
};

type SortKey = "year-desc" | "year-asc" | "award" | "person";
type ViewKey = "cards" | "table";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "year-desc", label: "Newest first" },
  { key: "year-asc", label: "Oldest first" },
  { key: "award", label: "Award" },
  { key: "person", label: "Person" },
];

const VIEW_OPTIONS: ViewKey[] = ["cards", "table"];

function getValidSort(value: string | null): SortKey {
  return SORT_OPTIONS.some((option) => option.key === value) ? (value as SortKey) : "year-desc";
}

function getValidView(value: string | null): ViewKey {
  return VIEW_OPTIONS.includes(value as ViewKey) ? (value as ViewKey) : "cards";
}

export default function SearchExplorer({ data }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const rawSort = searchParams.get("sort");
  const rawView = searchParams.get("view");
  const sort = getValidSort(rawSort);
  const view = getValidView(rawView);
  const topicOptions = new Set(data.topics.map((topic) => topic.topic));
  const activeTopicParam = searchParams.get("topic");
  const activeTopic = activeTopicParam && topicOptions.has(activeTopicParam) ? activeTopicParam : "all";

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    let changed = false;

    if (query.trim() !== query) {
      if (query.trim()) {
        nextParams.set("q", query.trim());
      } else {
        nextParams.delete("q");
      }
      changed = true;
    }

    if (sort === "year-desc" && rawSort) {
      nextParams.delete("sort");
      changed = true;
    }

    if (rawSort && sort !== "year-desc" && rawSort !== sort) {
      nextParams.delete("sort");
      changed = true;
    }

    if (view === "cards" && rawView) {
      nextParams.delete("view");
      changed = true;
    }

    if (rawView && view !== "cards" && rawView !== view) {
      nextParams.delete("view");
      changed = true;
    }

    if (activeTopicParam && activeTopic === "all") {
      nextParams.delete("topic");
      changed = true;
    }

    if (!changed) {
      return;
    }

    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [activeTopic, activeTopicParam, pathname, query, rawSort, rawView, router, searchParams, sort, view]);

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

  const updateQuery = (nextValue: string) => updateParams({ q: nextValue });
  const updateSort = (nextValue: SortKey) => updateParams({ sort: nextValue === "year-desc" ? null : nextValue });
  const updateView = (nextValue: ViewKey) => updateParams({ view: nextValue === "cards" ? null : nextValue });
  const updateTopic = (nextValue: string) => updateParams({ topic: nextValue === "all" ? null : nextValue });

  const fuse = useMemo(
    () =>
      new Fuse(data.events, {
        keys: ["search_blob", "award_name", "person_label", "topics", "institutions", "year"],
        threshold: 0.32,
        ignoreLocation: true,
      }),
    [data.events],
  );

  const filtered = useMemo(() => {
    const base = query.trim() ? fuse.search(query.trim()).map((result) => result.item) : data.events;
    const topicFiltered = activeTopic === "all" ? base : base.filter((event) => event.topics.includes(activeTopic));

    return [...topicFiltered].sort((left, right) => {
      switch (sort) {
        case "year-asc":
          return left.year - right.year;
        case "award":
          return left.award_name.localeCompare(right.award_name) || right.year - left.year;
        case "person":
          return left.person_label.localeCompare(right.person_label) || right.year - left.year;
        case "year-desc":
        default:
          return right.year - left.year;
      }
    });
  }, [activeTopic, data.events, fuse, query, sort]);

  const topTopics = data.topics.slice(0, 6);

  const renderLinkedPeople = (event: EventRecord) =>
    event.person_names.map((personName, index) => (
      <span key={`${event.id}-${event.person_slugs[index]}`}>
        {index > 0 ? ", " : null}
        <Link href={`/people/${event.person_slugs[index]}/`} className="card-title-link">
          {personName}
        </Link>
      </span>
    ));

  return (
    <div className="explorer-panel">
      <div className="explorer-controls">
        <input
          aria-label="Search award timeline"
          className="search-input"
          value={query}
          onChange={(event) => updateQuery(event.target.value)}
          placeholder="Search Grace Hopper, Turing Award, databases, Bell Labs, 1980s..."
        />

        <select className="sort-select" value={sort} onChange={(event) => updateSort(event.target.value as SortKey)}>
          {SORT_OPTIONS.map((option) => (
            <option value={option.key} key={option.key}>
              Sort: {option.label}
            </option>
          ))}
        </select>

        <div className="view-toggle-group" aria-label="View mode">
          <button
            className={`view-toggle ${view === "cards" ? "view-toggle-active" : ""}`}
            onClick={() => updateView("cards")}
            type="button"
          >
            Cards
          </button>
          <button
            className={`view-toggle ${view === "table" ? "view-toggle-active" : ""}`}
            onClick={() => updateView("table")}
            type="button"
          >
            Table
          </button>
        </div>
      </div>

      <div className="filter-row" aria-label="Topic filters">
        <button
          type="button"
          className={`filter-button ${activeTopic === "all" ? "filter-button-active" : ""}`}
          onClick={() => updateTopic("all")}
        >
          All topics
        </button>
        {topTopics.map((topic) => (
          <button
            key={topic.topic}
            type="button"
            className={`filter-button ${activeTopic === topic.topic ? "filter-button-active" : ""}`}
            onClick={() => updateTopic(topic.topic)}
          >
            {topic.topic}
          </button>
        ))}
      </div>

      <div className="stats-grid" aria-label="Explorer status">
        <div className="stat-card">
          <strong>{filtered.length}</strong>
          <span>matching timeline events</span>
        </div>
        <div className="stat-card">
          <strong>{data.stats.award_count}</strong>
          <span>award programs tracked</span>
        </div>
        <div className="stat-card">
          <strong>{data.stats.people_count}</strong>
          <span>sample laureates indexed</span>
        </div>
        <div className="stat-card">
          <strong>{data.stats.year_start}–{data.stats.year_end}</strong>
          <span>current sample range</span>
        </div>
      </div>

      <p className="meta-line compact-copy">
        Program-level source links identify the broader official award page or awards index; they are not year-specific
        citations for a single row.
      </p>

      {view === "cards" ? (
        <div className="cards-grid">
          {filtered.map((event) => (
            <article className="event-card" key={event.id}>
                <div className="event-card-header">
                  <div>
                    <h3>{renderLinkedPeople(event)}</h3>
                    <span className="meta-line">
                      <Link href={`/awards/${event.award_slug}/`} className="card-title-link">
                        {event.award_name}
                      </Link>
                    </span>
                  </div>
                  <span className="year-pill">{event.year}</span>
                </div>
              <p className="meta-line">{event.title}</p>
              <div className="tag-row">
                <span>{event.decade}</span>
                {event.topics.slice(0, 2).map((topic) => (
                  <span key={topic}>{topic}</span>
                ))}
              </div>
              <p className="event-note">{event.significance}</p>
              <p className="meta-line compact-copy">
                <strong>Program-level source:</strong>{" "}
                <a href={event.official_program_url} target="_blank" rel="noreferrer">
                  {event.official_program_label}
                </a>
                <span> (not a year-specific citation)</span>
              </p>
              {event.related_works.length > 0 ? (
                <>
                  <p className="eyebrow compact-copy">Related work / context</p>
                  <ul className="works-list">
                  {event.related_works.slice(0, 2).map((work) => (
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
          ))}
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>Recipient</th>
                <th>Award</th>
                <th>Topics</th>
                <th>Notable work</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event) => (
                <tr key={event.id}>
                  <td>{event.year}</td>
                  <td>{renderLinkedPeople(event)}</td>
                  <td>
                    <Link href={`/awards/${event.award_slug}/`} className="card-title-link">
                      {event.award_name}
                    </Link>
                  </td>
                  <td>{event.topics.slice(0, 2).join(", ")}</td>
                  <td>{event.related_works[0]?.title ?? event.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
