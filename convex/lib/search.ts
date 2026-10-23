export type SearchQuery =
  | { kind: "valid"; query: string }
  | { kind: "empty" }
  | { kind: "too_long" };

export function parseSearchQuery(value: string): SearchQuery {
  const query = value.trim();
  if (!query) return { kind: "empty" };
  if (Array.from(query).length > 100) return { kind: "too_long" };
  return { kind: "valid", query };
}
