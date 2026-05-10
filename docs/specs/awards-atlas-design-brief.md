# Awards Atlas Design Brief

## Goal

Design a GitHub Pages site for exploring major computing awards through two primary entry points:

1. Search by person, award, institution, topic, or year.
2. Browse a chronological timeline that reveals how computing recognition shifts over time.

The site should feel editorial and archival rather than corporate. It should read like an atlas of recognition across computer science.

## Product Shape

### Core promise

Users can answer three questions quickly:

1. Who won what?
2. When did a person or idea become visible?
3. How do awards, people, and eras connect?

### Primary pages

1. `Home`
   A strong landing page with a large search field, a compressed timeline preview, and featured award clusters.
2. `Timeline`
   A full-width chronological explorer with filters and expandable year bands.
3. `Awards`
   A browsable directory of awards with short descriptions and links into their recipient histories.
4. `People`
   Search-first directory with recipient cards and detail pages.
5. `About / Method`
   Explains sources, scope, taxonomy, and data caveats.

## Visual Direction

### Tone

Use a mix of:

- digital atlas
- academic archive
- quiet newsroom graphic

Avoid generic startup gradients and dashboard chrome.

### Palette

- Background: warm off-black or deep ink, such as `#0d1320`
- Surface: blue-slate panels, such as `#162033`
- Text: soft paper, such as `#edf1e7`
- Accent 1: atlas gold, such as `#d4a94f`
- Accent 2: electric cyan for active search/focus, such as `#61d0ff`
- Accent 3: muted red for notable eras or warnings, such as `#c96a5a`

The dark base helps award dates, connection lines, and metadata feel precise. Gold should be used sparingly for highlighted laureates and key labels.

### Typography

- Headings: a high-contrast serif or editorial serif
- UI and metadata: a clean sans-serif
- Dates and year markers: tabular numerals if available

Good pairing direction:

- `Cormorant Garamond` or `Bitter` for display text
- `Inter` or `Source Sans 3` for interface text

### Texture

- thin grid lines
- subtle latitude/longitude motif in hero background
- faint dotted connectors in timeline mode

## Layout System

### Home page

The home page should have four stacked zones:

1. `Hero Search`
   Full-width intro with one dominant search box and a small set of suggested queries like `Turing Award`, `Grace Hopper`, `computer graphics`, `1970s`.
2. `Timeline Strip`
   Horizontally scrollable decade rail with counts of awards or notable wins per period.
3. `Featured Constellations`
   Three editorial panels such as `AI milestones`, `Systems pioneers`, `Women in computing awards history`.
4. `Browse Index`
   Dense but readable entry points for awards, people, and institutions.

### Timeline page

Use a split layout on desktop:

- left rail: filters and legend
- main canvas: year bands with recipient events

On mobile, stack filters above the timeline and convert the year bands into accordion sections.

### Detail pages

Each person or award page should use:

1. summary header
2. metadata row
3. timeline of related wins or milestones
4. related people / related awards section

## Interaction Model

### Search

Search should be the fastest path through the site.

- Single input with instant client-side filtering.
- Search across names, award titles, institutions, topics, and years.
- Results grouped by type: `People`, `Awards`, `Years`, `Topics`.
- Keyboard-first behavior on desktop.
- Query should update the URL so GitHub Pages links are shareable.

### Timeline behavior

- Default view starts at decade granularity.
- Clicking a decade expands into year rows.
- Clicking a year reveals recipients and award events.
- Active filters should visibly recolor or thin unrelated items rather than hard-hiding everything at first.
- Use short annotation callouts for historically important years.

### Filters

Support a minimal first version:

- award
- person
- institution
- topic
- decade

Do not over-design advanced analytics into the first release.

## Card And Data Patterns

### Person card

- name
- portrait placeholder or monogram
- primary award
- winning year(s)
- one-line significance or field tag

### Award card

- award name
- founding year
- field / scope
- latest highlighted recipient
- link to full recipient timeline

### Timeline event

- year
- award name
- recipient name
- optional tag such as `theory`, `systems`, `graphics`, `ai`

## GitHub Pages Constraints

Design for a static site first.

- Prefer a single JSON dataset or a few small JSON files.
- Use client-side search with lightweight indexing.
- Avoid server-dependent interactions.
- Keep the first paint fast; the timeline can progressively expand after load.
- URL state should use query params or hash routing compatible with GitHub Pages.

## Recommended First Build

If this moves into implementation, build in this order:

1. landing page with search hero
2. JSON data model for awards and recipients
3. client-side search results
4. decade-to-year timeline explorer
5. person and award detail pages

## Success Criteria

The design is successful if a first-time visitor can:

1. find a known recipient in under 10 seconds
2. understand the timeline structure without instruction
3. move between award history and person history without feeling lost
4. use the site comfortably on mobile and desktop

## Visual Summary

Think `library atlas meets interactive chronology`.

The page should feel like a carefully indexed map of computing recognition, not a generic searchable table.
