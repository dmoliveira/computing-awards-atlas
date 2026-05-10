"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
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
  title: string;
  person_names: string[];
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

export default function SearchExplorer({ data }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [sort, setSort] = useState<SortKey>("year-desc");
  const [view, setView] = useState<ViewKey>("cards");
  const [activeTopic, setActiveTopic] = useState<string>("all");

  const updateQuery = (nextValue: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (nextValue.trim()) {
      nextParams.set("q", nextValue.trim());
    } else {
      nextParams.delete("q");
    }

    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  };

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

        <select className="sort-select" value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
          {SORT_OPTIONS.map((option) => (
            <option value={option.key} key={option.key}>
              Sort: {option.label}
            </option>
          ))}
        </select>

        <div className="view-toggle-group" aria-label="View mode">
          <button
            className={`view-toggle ${view === "cards" ? "view-toggle-active" : ""}`}
            onClick={() => setView("cards")}
            type="button"
          >
            Cards
          </button>
          <button
            className={`view-toggle ${view === "table" ? "view-toggle-active" : ""}`}
            onClick={() => setView("table")}
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
          onClick={() => setActiveTopic("all")}
        >
          All topics
        </button>
        {topTopics.map((topic) => (
          <button
            key={topic.topic}
            type="button"
            className={`filter-button ${activeTopic === topic.topic ? "filter-button-active" : ""}`}
            onClick={() => setActiveTopic(topic.topic)}
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

      {view === "cards" ? (
        <div className="cards-grid">
          {filtered.map((event) => (
            <article className="event-card" key={event.id}>
              <div className="event-card-header">
                <div>
                  <h3>{event.person_label}</h3>
                  <span className="meta-line">{event.award_name}</span>
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
              {event.related_works.length > 0 ? (
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
                  <td>{event.person_label}</td>
                  <td>{event.award_name}</td>
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
