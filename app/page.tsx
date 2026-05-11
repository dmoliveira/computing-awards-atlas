import { Suspense } from "react";
import Link from "next/link";
import SearchExplorer from "@/src/components/search-explorer";
import atlasData from "@/src/generated/awards-atlas.generated.json";
import { SiteFooter, SiteHeader } from "@/src/components/site-chrome";
import { getSiteUrl } from "@/src/lib/site";

const siteUrl = getSiteUrl();

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Computing Awards Atlas",
  ...(siteUrl ? { url: `${siteUrl}/` } : {}),
  description:
    "A searchable static atlas of major computing awards, laureates, topics, and milestone works.",
  ...(siteUrl
    ? {
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      }
    : {}),
};

const featuredClusters = [
  {
    title: "AI milestones",
    thesis: "From expert systems to deep learning to reinforcement learning foundations.",
    items: [
      { label: "Feigenbaum & Reddy", href: { pathname: "/", query: { q: "Edward A. Feigenbaum" } } },
      { label: "Pearl", href: "/people/judea-pearl/" },
      { label: "Bengio · Hinton · LeCun", href: { pathname: "/", query: { q: "deep learning" } } },
      { label: "Barto · Sutton", href: "/people/andrew-g-barto/" },
    ],
  },
  {
    title: "Infrastructure builders",
    thesis: "Systems, operating environments, and internet protocols that scaled the field.",
    items: [
      { label: "Corbató", href: "/people/fernando-j-corbato/" },
      { label: "Ritchie · Thompson", href: { pathname: "/", query: { q: "Unix" } } },
      { label: "Cerf · Kahn", href: "/people/vinton-g-cerf/" },
      { label: "Lamport", href: "/people/leslie-lamport/" },
    ],
  },
  {
    title: "Data and theory",
    thesis: "Relational models, transaction processing, algorithms, and verification as durable core layers.",
    items: [
      { label: "Codd", href: "/people/edgar-f-codd/" },
      { label: "Jim Gray", href: "/people/jim-gray/" },
      { label: "Hopcroft · Tarjan", href: { pathname: "/", query: { q: "graph algorithms" } } },
      { label: "Amir Pnueli", href: "/people/amir-pnueli/" },
    ],
  },
];

const browseGroups = [
  {
    label: "Awards",
    values: atlasData.awards.slice(0, 6).map((award) => ({ label: award.short_name ?? award.name, href: `/awards/${award.slug}/` })),
  },
  {
    label: "Topics",
    values: atlasData.topics.slice(0, 6).map((topic) => ({ label: topic.topic, href: { pathname: "/", query: { q: topic.topic } } })),
  },
  {
    label: "Decades",
    values: ["1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"].map((decade) => ({
      label: decade,
      href: { pathname: "/", query: { q: decade } },
    })),
  },
  {
    label: "People",
    values: atlasData.people.slice(0, 6).map((person) => ({ label: person.name, href: `/people/${person.slug}/` })),
  },
];

function ExplorerFallback() {
  return (
    <div className="explorer-panel">
      <div className="stats-grid" aria-label="Explorer loading state">
        <div className="stat-card">
          <strong>{atlasData.stats.event_count}</strong>
          <span>sample timeline events</span>
        </div>
        <div className="stat-card">
          <strong>{atlasData.stats.award_count}</strong>
          <span>award programs tracked</span>
        </div>
        <div className="stat-card">
          <strong>{atlasData.stats.people_count}</strong>
          <span>sample laureates indexed</span>
        </div>
        <div className="stat-card">
          <strong>
            {atlasData.stats.year_start}–{atlasData.stats.year_end}
          </strong>
          <span>current sample range</span>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <SiteHeader
        navItems={[
          { href: "/#explorer", label: "Timeline" },
          { href: "/awards/", label: "Awards" },
          { href: "/people/", label: "People" },
          { href: "/#coverage", label: "Coverage" },
          { href: "/method/", label: "Method" },
        ]}
      />

      <header className="hero hero-no-top-padding">
        <section className="hero-grid" id="top">
          <div className="hero-copy">
            <p className="eyebrow">Computing recognition, indexed</p>
            <h1>The Atlas of Computing Awards</h1>
            <p className="hero-text">
              Search the people, prizes, institutions, and milestone works that map how computer science has been
              recognized over time — from Turing Award foundations to AI, databases, internet, theory, and retrieval
              retrospectives.
            </p>

            <div className="hero-metrics" aria-label="Coverage metrics">
              <div>
                <strong>{atlasData.stats.award_count}</strong>
                <span>award programs</span>
              </div>
              <div>
                <strong>{atlasData.stats.people_count}</strong>
                <span>sample laureates</span>
              </div>
              <div>
                <strong>
                  {atlasData.stats.year_start}–{atlasData.stats.year_end}
                </strong>
                <span>timeline range</span>
              </div>
            </div>

            <div className="hero-chip-row" aria-label="Suggested queries">
              {[
                "Turing Award",
                "Grace Hopper Award",
                "deep learning",
                "databases",
                "internet",
                "1980s",
              ].map((chip) => (
                <Link key={chip} href={{ pathname: "/", query: { q: chip } }} className="chip browse-link-pill">
                  {chip}
                </Link>
              ))}
            </div>
          </div>

          <aside className="hero-atlas" aria-label="Timeline preview backdrop">
            <div className="atlas-line" />
            <div className="atlas-point atlas-point-gold">
              <span>1966</span>
              <p>Turing inaugurated</p>
            </div>
            <div className="atlas-point atlas-point-cyan">
              <span>1978</span>
              <p>Relational databases recognized</p>
            </div>
            <div className="atlas-point atlas-point-rose">
              <span>2018</span>
              <p>Deep learning becomes canonical</p>
            </div>
          </aside>
        </section>
      </header>

      <section className="section-block intro-copy">
        <p>
          This first release is a strong public sample: an SEO-friendly landing page, sortable award-event explorer,
          and an expandable data pipeline built from JSONL so the atlas can scale toward broader coverage of awards,
          conference retrospectives, and related landmark works.
        </p>
      </section>

      <section className="section-block" id="explorer">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Recognition through time</p>
            <h2>Search, sort, and scan the timeline</h2>
          </div>
          <a href="#method" className="text-link">
            View scope and data notes
          </a>
        </div>
        <p className="meta-line compact-copy">
          Official award pages act as the primary program sources in this atlas. Books, papers, software, and articles
          listed under events are editorial context links that help explain why a recognition matters.
        </p>
        <Suspense fallback={<ExplorerFallback />}>
          <SearchExplorer data={atlasData} />
        </Suspense>
      </section>

      <section className="section-block cluster-grid" id="coverage">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Featured constellations</p>
            <h2>Editorial entry points into the field</h2>
          </div>
        </div>

        {featuredClusters.map((cluster) => (
          <article className="cluster-card" key={cluster.title}>
            <h3>{cluster.title}</h3>
            <p>{cluster.thesis}</p>
            <ul>
              {cluster.items.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="section-block browse-grid">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Browse index</p>
            <h2>Dense entry points for deeper coverage</h2>
          </div>
        </div>

        {browseGroups.map((group) => (
          <article className="browse-card" key={group.label}>
            <h3>{group.label}</h3>
            <div className="browse-values">
              {group.values.map((value) => (
                <Link key={`${group.label}-${value.label}`} href={value.href} className="browse-link-pill">
                  {value.label}
                </Link>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="section-block method-grid" id="method">
        <article>
          <p className="eyebrow">Method</p>
          <h2>Static-first, expandable by design</h2>
          <p>
            Data is authored in JSONL and normalized at build time into static JSON for GitHub Pages. The sample covers
            major award programs plus selected Turing Award winners and related influential works.
          </p>
        </article>

        <article>
          <p className="eyebrow">Next additions</p>
          <ul className="method-list">
            <li>Broader award recipient coverage by decade and field.</li>
            <li>Conference 10-year / test-of-time paper layers.</li>
            <li>Richer provenance, citations, and source-attribution layers.</li>
            <li>Expanded source citations and provenance notes.</li>
          </ul>
          <p className="compact-copy">
            <Link href="/method/" className="text-link">
              Open the full method and sources page
            </Link>
          </p>
        </article>
      </section>

      <SiteFooter />
    </main>
  );
}
