export async function fetchDashboard() {
  const response = await fetch('/api/dashboard', {
    method: 'GET',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data');
  }
  const json = await response.json();
  return json?.data ?? json;
}

