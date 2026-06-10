/**
 * Helper para manejar fechas con timezone local
 * Paraguay/Asunción es UTC-3 (sin horario de verano)
 */

/**
 * Parsea una fecha enviada desde el frontend con timezone offset
 * Ejemplo: "2026-06-09T00:00:00-03:00" → Date(2026-06-09 00:00:00 local)
 */
export function parseLocalDate(dateStr: string): Date {
  const parsed = new Date(dateStr);
  // Extraer componentes locales para crear una fecha pura sin conversión UTC
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

/**
 * Obtiene la fecha de hoy en UTC-3 (Paraguay/Asunción)
 * Como fallback si el frontend no envía fecha
 */
export function getTodayInTimezone(): Date {
  const now = new Date();
  // Paraguay es UTC-3, restamos 3 horas a la hora UTC
  const paraguayOffset = -3 * 60; // minutos
  const localTime = new Date(now.getTime() + paraguayOffset * 60 * 1000);
  return new Date(localTime.getFullYear(), localTime.getMonth(), localTime.getDate());
}

/**
 * Convierte una fecha de la base de datos (UTC) a string YYYY-MM-DD
 * para comparar con fechas locales
 */
export function dateToLocalString(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
