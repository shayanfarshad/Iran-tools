export type CalendarType = "persian" | "gregory" | "islamic-civil";

const DAY_MS = 86_400_000;
const formatters = new Map<CalendarType, Intl.DateTimeFormat>();

function getFormatter(calendar: CalendarType) {
  const cached = formatters.get(calendar);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat("en-US", {
    calendar,
    numberingSystem: "latn",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: "UTC",
  });

  if (formatter.resolvedOptions().calendar !== calendar) {
    throw new Error("unsupported-calendar");
  }

  formatters.set(calendar, formatter);
  return formatter;
}

function ordinal(year: number, month: number, day: number) {
  return year * 10_000 + month * 100 + day;
}

function dateOrdinal(timestamp: number, formatter: Intl.DateTimeFormat) {
  const parts = formatter.formatToParts(new Date(timestamp));

  const read = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);

  return ordinal(read("year"), read("month"), read("day"));
}

export function calendarDateUtc(
  year: number,
  month: number,
  day: number,
  calendar: CalendarType,
): number {
  if (
    ![year, month, day].every(Number.isInteger) ||
    year < 1 ||
    year > 9999 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    throw new Error("invalid-date");
  }

  const formatter = getFormatter(calendar);
  const target = ordinal(year, month, day);

  // setUTCFullYear avoids Date.UTC's special handling of years 0–99.
  const firstDate = new Date(0);
  firstDate.setUTCFullYear(1, 0, 1);
  firstDate.setUTCHours(0, 0, 0, 0);

  let low = firstDate.getTime() / DAY_MS;
  let high = Date.UTC(11000, 11, 31) / DAY_MS;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const timestamp = middle * DAY_MS;
    const current = dateOrdinal(timestamp, formatter);

    if (current === target) return timestamp;

    if (current < target) {
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  // Dates such as Gregorian February 30 do not match any real day.
  throw new Error("invalid-date");
}

export function persianDateUtc(
  year: number,
  month: number,
  day: number,
): number {
  return calendarDateUtc(year, month, day, "persian");
}

export function calculateDateDifference(
  startYear: number,
  startMonth: number,
  startDay: number,
  endYear: number,
  endMonth: number,
  endDay: number,
  calendar: CalendarType = "persian",
): number[] {
  const start = calendarDateUtc(startYear, startMonth, startDay, calendar);

  const end = calendarDateUtc(endYear, endMonth, endDay, calendar);

  if (end < start) {
    throw new Error("end-before-start");
  }

  const anniversaryNotReached =
    endMonth < startMonth || (endMonth === startMonth && endDay < startDay);

  const completedYears = endYear - startYear - (anniversaryNotReached ? 1 : 0);

  return [(end - start) / DAY_MS, completedYears];
}
