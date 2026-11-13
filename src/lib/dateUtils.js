const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long' });
const fullDateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric'
});

/**
 * Parse a date string safely into a local Date object (avoiding UTC midnight shifts).
 */
export function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const trimmed = String(dateStr).trim();
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
  }
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isWeekend(dateStr) {
  const date = parseLocalDate(dateStr);
  if (!date) return false;
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function formatWeekday(dateStr) {
  const date = parseLocalDate(dateStr);
  return date ? weekdayFormatter.format(date) : dateStr;
}

export function formatFullDate(dateStr) {
  const date = parseLocalDate(dateStr);
  return date ? fullDateFormatter.format(date) : dateStr;
}

export function formatShortDate(dateStr) {
  const date = parseLocalDate(dateStr);
  return date ? shortDateFormatter.format(date) : dateStr;
}

export function toIsoDateString(dateStr) {
  const date = parseLocalDate(dateStr);
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
