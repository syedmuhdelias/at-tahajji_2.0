const memory = new Map<string, { data: unknown; until: number }>();
export async function api<T>(
  params: Record<string, string | number>,
  signal?: AbortSignal,
): Promise<T> {
  const query = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
  const cached = memory.get(query);
  if (cached && cached.until > Date.now()) return cached.data as T;
  const response = await fetch(`/api/quran?${query}`, { signal });
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok)
    throw new Error(data.error || "Unable to load Quran content.");
  if (memory.size > 150) memory.delete(memory.keys().next().value!);
  memory.set(query, { data, until: Date.now() + 300000 });
  return data;
}
