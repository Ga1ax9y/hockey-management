// YYYY-MM-DDTHH:mm (для input[type=datetime-local])
export function toInputDateTime(value) {
  if (!value) return '';

  const date = new Date(value);

  const pad = (n) => String(n).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}


// ISO (для отправки в API)
export function inputDateTimeToISO(value) {
  if (!value) return null;

  // value уже в формате YYYY-MM-DDTHH:mm
  return new Date(value).toISOString();
}


// ДД.ММ.ГГГГ ЧЧ:ММ (для отображения)
export function formatDateTimeToRU(value) {
  if (!value) return '';

  const date = new Date(value);

  const pad = (n) => String(n).padStart(2, '0');

  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// ДД.ММ.ГГГГ -> ISO
export function ruDateToISO(value) {
  if (!value) return null;

  const parts = value.split('.');
  if (parts.length !== 3) return null;

  const [day, month, year] = parts;
  const isoString = new Date(`${year}-${month}-${day}T00:00:00`).toISOString();

  return isoString;
}


// ISO -> ДД.ММ.ГГГГ
export function isoToRuDate(value) {
  if (!value) return '';

  const date = new Date(value);

  const pad = (n) => String(n).padStart(2, '0');

  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}
