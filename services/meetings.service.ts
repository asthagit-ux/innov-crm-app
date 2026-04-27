export async function fetchMeetings() {
  const response = await fetch('/api/meeting');
  const json = await response.json();
  if (!response.ok || !json?.success) {
    throw new Error(json?.error ?? 'Failed to fetch meetings');
  }
  return json.data ?? [];
}
