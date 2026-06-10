/**
 * Helper para manejar fechas como calendario puro (YYYY-MM-DD)
 * El backend usa UTC midnight para evitar drift de timezone
 */

/**
 * Parsea una fecha YYYY-MM-DD enviada desde el frontend
 * Ejemplo: "2026-06-09" → Date(2026-06-09T00:00:00Z)
 */
export function parseLocalDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00Z`);
}

/**
 * Obtiene la fecha de hoy según la hora local del servidor
 * Como fallback si el frontend no envía fecha
 */
export function getTodayInTimezone(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Convierte una fecha de la base de datos (UTC midnight) a string YYYY-MM-DD
 * Usa UTC getters para evitar drift de timezone del servidor
 */
export function dateToLocalString(date: Date): string {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
