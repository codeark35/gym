/**
 * Fechas de calendario puro (YYYY-MM-DD).
 *
 * Regla: todo el backend corre en timezone America/Asuncion (UTC-3).
 * Nunca depender de la zona horaria del sistema operativo.
 */

const TIMEZONE = 'America/Asuncion';

const fmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const fmtParts = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  weekday: 'short',
});

/**
 * Formatea una fecha local a YYYY-MM-DD usando siempre UTC-3.
 */
export function localDateString(d = new Date()): string {
  return fmt.format(d);
}

/**
 * Extrae partes de fecha (año, mes, día, día de semana) usando siempre UTC-3.
 * Forzamos UTC noon para evitar drift de día al formatear.
 */
export function dateParts(d: Date): { year: number; month: number; day: number; dayOfWeek: number } {
  const d2 = new Date(d);
  d2.setUTCHours(12, 0, 0, 0);
  const parts = fmtParts.formatToParts(d2);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '0';
  const year = parseInt(get('year'), 10);
  const month = parseInt(get('month'), 10);
  const day = parseInt(get('day'), 10);
  // weekday viene como 'Sat', 'Sun', etc. Lo convertimos a número 0=Dom, 1=Lun...
  const weekdayMap: Record<string, number> = {
    dom: 0, domingo: 0,
    lun: 1, lunes: 1,
    mar: 2, martes: 2,
    mié: 3, miércoles: 3, mie: 3, miercoles: 3,
    jue: 4, jueves: 4,
    vie: 5, viernes: 5,
    sáb: 6, sábado: 6, sab: 6, sabado: 6,
    sun: 0, sunday: 0,
    mon: 1, monday: 1,
    tue: 2, tuesday: 2,
    wed: 3, wednesday: 3,
    thu: 4, thursday: 4,
    fri: 5, friday: 5,
    sat: 6, saturday: 6,
  };
  const dayOfWeek = weekdayMap[get('weekday').toLowerCase().split('.')[0].trim()] ?? 0;
  return { year, month, day, dayOfWeek };
}

/**
 * Crea un Date a partir de año, mes, día en UTC midnight.
 * El mes es 1-indexed.
 * Usa UTC para evitar que el timezone del sistema OS desplace el día.
 */
export function dateFromParts(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
}

/**
 * Agrega días a un Date y devuelve un nuevo Date.
 * Opera en UTC para evitar drift de timezone.
 */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/**
 * Parsea una fecha YYYY-MM-DD enviada desde el frontend.
 * Usa UTC noon para evitar que timezone shift cambie el día
 * cuando el servidor corre en UTC y se formatea a Asunción.
 */
export function parseLocalDate(dateStr: string): Date {
  return new Date(dateStr + 'T12:00:00.000Z');
}

/**
 * Fecha de hoy en UTC-3 (paraguay).
 * Fallback si el frontend no envía fecha.
 */
export function getTodayInTimezone(): Date {
  const todayStr = localDateString();
  return parseLocalDate(todayStr);
}

/**
 * Convierte un Date de la base de datos a string YYYY-MM-DD
 * usando siempre UTC-3 como referencia.
 * Forzamos UTC noon para evitar drift de día.
 */
export function dateToLocalString(date: Date): string {
  const d = new Date(date);
  d.setUTCHours(12, 0, 0, 0);
  return fmt.format(d);
}
