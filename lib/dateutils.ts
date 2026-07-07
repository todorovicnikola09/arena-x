export function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);

  let day = digits.slice(0, 2);
  let month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  if (day.length === 2) {
    let d = parseInt(day, 10);
    if (d > 31) d = 31;
    if (d === 0) d = 1;
    day = d.toString().padStart(2, '0');
  }

  if (month.length === 2) {
    let m = parseInt(month, 10);
    if (m > 12) m = 12;
    if (m === 0) m = 1;
    month = m.toString().padStart(2, '0');
  }

  let result = day;
  if (digits.length > 2) result += '.' + month;
  if (digits.length > 4) result += '.' + year;
  return result;
}

export function formatTimeInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);

  let hours = digits.slice(0, 2);
  let minutes = digits.slice(2, 4);

  if (hours.length === 2) {
    let h = parseInt(hours, 10);
    if (h > 23) h = 23;
    hours = h.toString().padStart(2, '0');
  }

  if (minutes.length === 2) {
    let m = parseInt(minutes, 10);
    if (m > 59) m = 59;
    minutes = m.toString().padStart(2, '0');
  }

  if (digits.length <= 2) return hours;
  return hours + ':' + minutes;
}

export function parseDDMMYYYY(dateStr: string): Date | null {
  const parts = dateStr.split('.');
  if (parts.length !== 3) return null;

  const [day, month, year] = parts;
  if (day.length !== 2 || month.length !== 2 || year.length !== 4) return null;

  const d = new Date(Number(year), Number(month) - 1, Number(day));
  if (isNaN(d.getTime())) return null;

  if (d.getDate() !== Number(day) || d.getMonth() !== Number(month) - 1) return null;

  return d;
}

export function isDateComplete(dateStr: string): boolean {
  return /^\d{2}\.\d{2}\.\d{4}$/.test(dateStr);
}

export function isDateInPast(dateStr: string): boolean {
  const parsed = parseDDMMYYYY(dateStr);
  if (!parsed) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsed.setHours(0, 0, 0, 0);

  return parsed.getTime() < today.getTime();
}