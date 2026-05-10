# Awards Atlas Landing Page Concept

## Goal

Design a premium GitHub Pages landing page for a computing awards atlas with:

- searchable, sortable timeline cards
- a parallel dense table view
- strong editorial presence
- static-site-friendly SEO
- a dark atlas-style visual system

This concept extends `docs/specs/awards-atlas-design-brief.md` and stays within a lightweight client-side architecture.

## Experience Direction

The home page should feel like a research cover story rather than a product splash page.

- `Mood`: archival, precise, luminous, prestigious
- `Reference blend`: library atlas + longform feature header + data desk graphic
- `Avoid`: startup glow, dashboard sameness, heavy card clutter, generic neon sci-fi

## Landing Page Structure

The landing page is a single narrative surface with five bands.

1. `Top Banner`
   A slim announcement strip framing the atlas as a live chronology of computing recognition.
2. `Hero Search`
   Editorial headline, search-first input, quick query chips, and an ambient timeline backdrop.
3. `Timeline Preview`
   Searchable and sortable milestone cards above a compressed table preview.
4. `Featured Constellations`
   Three curated story clusters that show relationships across people, awards, and eras.
5. `Browse Entry Grid`
   Dense entry points into people, awards, institutions, topics, and decades.

## Wireframes

### Desktop

```text
+----------------------------------------------------------------------------------+
| Top banner: 2026 edition | 80+ years of recognition | Search by person/award/year |
+----------------------------------------------------------------------------------+
| Nav: Awards Atlas | Timeline | Awards | People | Method | Search icon             |
+----------------------------------------------------------------------------------+
| Hero left:                                                                      |
| The Atlas of Computing Awards                                                   |
| Trace the people, prizes, institutions, and eras that shaped the field.         |
| [ Search people, awards, institutions, topics, years......................... ] |
| chips: Turing Award | Grace Hopper | computer graphics | 1970s                  |
| metrics: 18 awards | 900+ recipients | 1940s-now                                |
|                                                                                  |
| Hero right:                                                                      |
| decade rail / dotted connectors / 3 highlighted milestone annotations           |
+----------------------------------------------------------------------------------+
| Section header: Recognition Through Time                            sort: year v |
| [filter chips] [view: Cards | Table] [sort: Year | Award | Person]              |
|                                                                                  |
| card 1              | card 2              | card 3                               |
| year                | year                | year                                 |
| award               | award               | award                                |
| recipient           | recipient           | recipient                            |
| tags                | tags                | tags                                 |
|                                                                                  |
| Compact table preview                                                            |
| Year | Recipient | Award | Institution | Topic                                  |
| 1966 | ...       | ...   | ...         | ...                                    |
+----------------------------------------------------------------------------------+
| Featured constellations: AI milestones | Systems pioneers | Women in computing   |
+----------------------------------------------------------------------------------+
| Browse index: Awards | People | Institutions | Topics | Decades                 |
+----------------------------------------------------------------------------------+
| Method footer: sources, scope, caveats, GitHub Pages data note                  |
+----------------------------------------------------------------------------------+
```

### Mobile

```text
+----------------------------------------------+
| Top banner                                   |
+----------------------------------------------+
| Awards Atlas                                 |
| The Atlas of Computing Awards                |
| [ Search across names, awards, years..... ]  |
| chips scroll horizontally                    |
| decade preview image / timeline strip        |
+----------------------------------------------+
| Recognition Through Time                     |
| controls: View | Sort                        |
| stacked cards                               |
| [ Table preview toggle ]                     |
+----------------------------------------------+
| Featured constellations carousel/stack       |
+----------------------------------------------+
| Browse index                                 |
+----------------------------------------------+
```

## Banner

Use the banner as a framing device, not a promotion slot.

- `Height`: 36 to 44px
- `Background`: deep ink with a faint gold top border
- `Copy`: `A living chronology of major computing awards, laureates, and eras.`
- `Supporting cue`: `Explore by person, prize, institution, topic, or year.`
- `Behavior`: sticky on desktop until the hero ends; non-sticky on mobile

## Hero

### Content

- `Eyebrow`: `Computing recognition, indexed`
- `Headline`: `The Atlas of Computing Awards`
- `Subhead`: `Search the people, prizes, and moments that map how computer science has been recognized over time.`
- `Primary CTA`: the search field itself
- `Secondary CTA`: `Browse the full timeline`

### Search Module

The hero search is the main interaction on the page.

- large single-line field with grouped result types below on focus
- auto-suggest examples seeded from awards, people, topics, and decades
- URL query sync for shareable GitHub Pages links
- keyboard-first result navigation on desktop

Suggested placeholder:

`Search Grace Hopper, Turing Award, machine learning, 1980s...`

### Backdrop Treatment

The right half of the hero should look like a lit archival map.

- faint longitude/latitude arcs
- a horizontal decade spine
- three annotation dots with short labels such as `1966: Turing inaugurated`
- thin cyan hover/focus accents only on active items
- gold reserved for one highlighted laureate marker

## Timeline Preview

This section proves the product value immediately.

### Cards

Default to three columns on desktop, one column on mobile.

Each card should include:

- year in tabular numerals
- recipient name
- award name
- institution or field tag
- one short significance note

Visual behavior:

- sort changes animate position rather than re-rendering the whole block
- active filter dims unrelated cards instead of hiding them immediately
- hovered card highlights its matching table row when both views are visible

### Table

The table is the dense comparison mode for users who already know what they want.

- columns: `Year`, `Recipient`, `Award`, `Institution`, `Topic`
- sticky header
- default sort by year descending on home page
- allow sort by year, award, and recipient in first release
- show only 8 to 12 rows on landing page, with a link to the full explorer

## Palette

Use a restrained editorial palette.

| Token | Use | Value |
| --- | --- | --- |
| `ink-950` | page background | `#0d1320` |
| `slate-900` | panels and nav | `#162033` |
| `slate-800` | raised surfaces | `#1d2940` |
| `paper-100` | primary text | `#edf1e7` |
| `paper-300` | secondary text | `#b7c1b7` |
| `atlas-gold` | highlighted labels | `#d4a94f` |
| `signal-cyan` | search focus and active state | `#61d0ff` |
| `era-rose` | annotation / historical emphasis | `#c96a5a` |
| `grid-line` | subtle dividers | `rgba(237, 241, 231, 0.10)` |

### Gradient Direction

Avoid full-surface rainbow gradients. Use layered dark gradients instead.

- page wash: `radial-gradient(circle at top right, rgba(97,208,255,0.10), transparent 32%), linear-gradient(180deg, #101727 0%, #0d1320 58%, #0a101b 100%)`
- hero panel: `linear-gradient(135deg, rgba(212,169,79,0.08), rgba(97,208,255,0.06))`

## Typography

- `Display`: `Cormorant Garamond` or `Bitter`
- `UI`: `Inter` or `Source Sans 3`
- `Data`: use tabular numerals via font-feature settings where available

Suggested scale:

- hero headline: `clamp(3rem, 7vw, 5.75rem)`
- section titles: `clamp(1.5rem, 2.4vw, 2.25rem)`
- body: `1rem`
- metadata: `0.875rem`

## SEO Direction

Because the site is static, the landing page needs to carry strong indexable language in the initial HTML.

### Primary targets

- `computing awards`
- `computer science awards`
- `Turing Award winners`
- `history of computing awards`
- `computing laureates timeline`

### Title and description draft

- `Title`: `Awards Atlas | A Timeline of Major Computing Awards and Laureates`
- `Meta description`: `Explore a searchable atlas of major computing awards, laureates, institutions, and milestones through an editorial timeline built for GitHub Pages.`

### On-page SEO requirements

- one strong `h1` in the hero
- descriptive intro paragraph above the interactive timeline preview
- crawlable text links to `Timeline`, `Awards`, `People`, and `Method`
- visible source and methodology cue in the footer
- semantic table markup for the preview rows

### Structured data

Use lightweight JSON-LD for:

- `WebSite` with search action
- `ItemList` or `Dataset` if the implementation exposes a stable data collection

## Component Notes

### Navigation

- compact, understated, editorial
- underline current section with gold hairline, not pill buttons
- search icon should open or focus the main search field rather than a separate overlay

### Featured Constellations

Use these as mini cover stories, not feature cards.

- each panel gets a short thesis line
- include 2 to 4 connected names or awards
- add one tiny sparkline or connector diagram per panel

### Browse Index

This section should feel closer to an index page than a marketing footer.

- multi-column lists on desktop
- alphabetical or categorical grouping
- small counts next to each category

## Motion

Keep motion precise and low-amplitude.

- fade and translate on section reveal
- card resort motion under 180ms
- no parallax
- respect `prefers-reduced-motion`

## First Implementation Priorities

1. Build the hero, search field, and banner exactly first because they establish tone and SEO.
2. Implement timeline cards and compact sortable table as a shared data slice.
3. Add the featured constellations once the core search and browse loop is working.
4. Keep mobile stacking simple before adding decorative timeline detail.

## Success Check

The concept is on target if the landing page lets a first-time visitor do three things in seconds:

1. understand that the site is a computing awards atlas, not a generic database
2. search for a known name or award immediately from the hero
3. scan both an editorial card view and a precise table view without switching pages
