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
  significance: string;
  topics: string[];
};

type TimelineGroup = {
  decade: string;
  years: Array<{
    year: number;
    events: EventRecord[];
  }>;
};

export function filterTimelineGroups(groups: TimelineGroup[], query: string, decade: string) {
  const normalizedQuery = query.trim().toLowerCase();

  return groups
    .map((group) => ({
      ...group,
      years: group.years
        .map((yearGroup) => ({
          ...yearGroup,
          events: yearGroup.events.filter((event) => {
            const haystack = [
              event.person_label,
              event.award_name,
              event.title,
              event.significance,
              event.topics.join(" "),
              String(event.year),
              event.decade,
            ]
              .join(" ")
              .toLowerCase();
            const matchesQuery = normalizedQuery.length === 0 || haystack.includes(normalizedQuery);
            const matchesDecade = decade === "all" || event.decade === decade;
            return matchesQuery && matchesDecade;
          }),
        }))
        .filter((yearGroup) => yearGroup.events.length > 0),
    }))
    .filter((group) => group.years.length > 0);
}
