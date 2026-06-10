const TIMEZONE = 'America/Asuncion';

function normalizeDateStr(dateStr: string): string {
  // Extraer YYYY-MM-DD de strings ISO como "2026-06-09T00:00:00.000Z"
  if (dateStr.includes('T') || dateStr.includes('Z')) {
    return dateStr.split('T')[0];
  }
  return dateStr;
}

/**
 * Formatea una fecha de calendario (YYYY-MM-DD o ISO) a texto legible.
 * Usa siempre America/Asuncion (UTC-3) para evitar drift de timezone.
 */
export function formatDate(dateStr: string): string {
  const normalized = normalizeDateStr(dateStr);
  const [year, month, day] = normalized.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('es-PY', {
    timeZone: TIMEZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
}

export function formatDateFull(dateStr: string): string {
  const normalized = normalizeDateStr(dateStr);
  const [year, month, day] = normalized.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('es-PY', {
    timeZone: TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Fecha de hoy en formato YYYY-MM-DD, siempre en UTC-3.
 */
export function todayISO(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function isToday(dateStr: string): boolean {
  return normalizeDateStr(dateStr) === todayISO();
}

export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// Backend now expects YYYY-MM-DD directly, no need for local ISO conversion
