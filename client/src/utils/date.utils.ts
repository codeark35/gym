function normalizeDateStr(dateStr: string): string {
  // Extract YYYY-MM-DD from ISO strings like "2026-06-09T00:00:00.000Z"
  if (dateStr.includes('T') || dateStr.includes('Z')) {
    return dateStr.split('T')[0];
  }
  return dateStr;
}

export function formatDate(dateStr: string): string {
  const normalized = normalizeDateStr(dateStr);
  const date = new Date(normalized + 'T00:00:00');
  return date.toLocaleDateString('es-PY', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function formatDateFull(dateStr: string): string {
  const normalized = normalizeDateStr(dateStr);
  const date = new Date(normalized + 'T00:00:00');
  return date.toLocaleDateString('es-PY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function todayISO(): string {
  // Use local date (not UTC) to match user's timezone
  return new Date().toLocaleDateString('en-CA');
}

export function isToday(dateStr: string): boolean {
  return normalizeDateStr(dateStr) === todayISO();
}

export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString('en-CA');
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
