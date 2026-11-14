const dayMs = 86400000;
const formatter = new Intl.DateTimeFormat("en-US-u-ca-persian-nu-latn", {
  year: "numeric", month: "numeric", day: "numeric", timeZone: "UTC",
});
function parts(timestamp: number): number[] {
  const fields = formatter.formatToParts(new Date(timestamp));
  return ["year", "month", "day"].map(type => Number(fields.find(field => field.type === type)?.value));
}
function ordinal([year, month, day]: number[]) { return year * 10000 + month * 100 + day; }
export function persianDateUtc(year: number, month: number, day: number): number {
  if (![year, month, day].every(Number.isInteger) || year < 1200 || year > 1600 || month < 1 || month > 12 || day < 1 || day > 31) throw new Error("invalid");
  const target = ordinal([year, month, day]);
  let low = Date.UTC(year + 621, 0, 1) / dayMs;
  let high = Date.UTC(year + 622, 11, 31) / dayMs;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const current = ordinal(parts(mid * dayMs));
    if (current === target) return mid * dayMs;
    if (current < target) low = mid + 1;
    else high = mid - 1;
  }
  throw new Error("invalid");
}
export function calculateDateDifference(startYear: number, startMonth: number, startDay: number, endYear: number, endMonth: number, endDay: number): number[] {
  const start = persianDateUtc(startYear, startMonth, startDay);
  const end = persianDateUtc(endYear, endMonth, endDay);
  if (end < start) throw new Error("invalid");
  const years = endYear - startYear - (endMonth < startMonth || (endMonth === startMonth && endDay < startDay) ? 1 : 0);
  return [(end - start) / dayMs, years];
}
