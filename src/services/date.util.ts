// VNT (Vietnam time, UTC+7) day-boundary helpers.
//
// "Today" for streaks, lazy task generation, and future-date rejection is
// always resolved server-side using this fixed offset - never the client's
// clock or the request's Date header. See
// PRPs/HABIT_TRACKER_V2_SCHEMA_API.md section 2.
export const VNT_OFFSET_MS = 7 * 60 * 60 * 1000;
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Server-side "today" as a YYYY-MM-DD string in VNT.
export function vntTodayDateOnly(now: Date = new Date()): string {
  return formatDateOnly(new Date(now.getTime() + VNT_OFFSET_MS));
}

// Parses a YYYY-MM-DD string into the UTC-midnight Date Prisma expects for
// a @db.Date column.
export function parseDateOnly(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

// Formats a Date (as returned by Prisma for a @db.Date column, or any UTC
// instant) back to YYYY-MM-DD.
export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Day of week for a plain calendar date string: 0=Sun..6=Sat. Dates are
// parsed at UTC midnight, so this is unambiguous regardless of server
// timezone - there is no "today" boundary involved here, just a fixed
// calendar date's weekday.
export function dayOfWeek(dateStr: string): number {
  return parseDateOnly(dateStr).getUTCDay();
}

// Enumerates every YYYY-MM-DD in [fromStr, toStr] inclusive.
export function enumerateDates(fromStr: string, toStr: string): string[] {
  const dates: string[] = [];
  let cursor = parseDateOnly(fromStr).getTime();
  const end = parseDateOnly(toStr).getTime();
  while (cursor <= end) {
    dates.push(formatDateOnly(new Date(cursor)));
    cursor += MS_PER_DAY;
  }
  return dates;
}
