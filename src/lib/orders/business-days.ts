/** Civil dates in Europe/Paris. Weekends and French public holidays are skipped. */

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function parisYmd(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function parseYmd(ymd: string) {
  const [year, month, day] = ymd.split("-").map(Number);
  return { year, month, day };
}

export function addCalendarDays(ymd: string, days: number): string {
  const { year, month, day } = parseYmd(ymd);
  const utc = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0));
  return `${utc.getUTCFullYear()}-${pad(utc.getUTCMonth() + 1)}-${pad(utc.getUTCDate())}`;
}

function weekdayUtc(ymd: string) {
  const { year, month, day } = parseYmd(ymd);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0)).getUTCDay();
}

function easterSundayYmd(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${year}-${pad(month)}-${pad(day)}`;
}

function frenchHolidays(year: number) {
  const easter = easterSundayYmd(year);
  return new Set([
    `${year}-01-01`,
    addCalendarDays(easter, 1),
    `${year}-05-01`,
    `${year}-05-08`,
    addCalendarDays(easter, 39),
    addCalendarDays(easter, 50),
    `${year}-07-14`,
    `${year}-08-15`,
    `${year}-11-01`,
    `${year}-11-11`,
    `${year}-12-25`,
  ]);
}

const holidayCache = new Map<number, Set<string>>();

export function isFrenchBusinessDay(ymd: string) {
  const weekday = weekdayUtc(ymd);
  if (weekday === 0 || weekday === 6) return false;
  const year = Number(ymd.slice(0, 4));
  let holidays = holidayCache.get(year);
  if (!holidays) {
    holidays = frenchHolidays(year);
    holidayCache.set(year, holidays);
  }
  return !holidays.has(ymd);
}

/** N full business days after `from` (payment day is not counted). */
export function addBusinessDaysYmd(from: Date, days: number) {
  if (days <= 0) return parisYmd(from);
  let ymd = parisYmd(from);
  let added = 0;
  while (added < days) {
    ymd = addCalendarDays(ymd, 1);
    if (isFrenchBusinessDay(ymd)) added += 1;
  }
  return ymd;
}

export function isOnOrAfterParisDay(now: Date, ymd: string) {
  return parisYmd(now) >= ymd;
}

export function formatParisYmd(ymd: string) {
  const { year, month, day } = parseYmd(ymd);
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day, 12, 0, 0)));
}

export function formatParisDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeZone: "Europe/Paris",
  }).format(value);
}
