import { format, parseISO, parse, isValid } from "date-fns";

export function formatDateTimeToRU(value) {
	if (!value) return "";

	const date = new Date(value);

	const pad = (n) => String(n).padStart(2, "0");

	return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export const isoToRuDate = (isoString) => {
	if (!isoString) return "";
	return format(new Date(isoString), "dd.MM.yyyy");
};

export const ruDateToISO = (ruDateString) => {
	if (!ruDateString) return null;
	const parsedDate = parse(ruDateString, "dd.MM.yyyy", new Date());
	return isValid(parsedDate) ? parsedDate.toISOString() : null;
};

export const formatToInput = (displayStr) => {
	if (!displayStr) return "";
	const [date, time] = displayStr.split(" ");
	const [d, m, y] = date.split(".");
	return `${y}-${m}-${d}T${time}`;
};

export const formatToInputDateTime = (date) => {
	if (!date) return "";
	const d = typeof date === "string" ? parseISO(date) : date;
	return format(d, "yyyy-MM-dd'T'HH:mm");
};

export const inputDateTimeToISO = (value) => {
	if (!value) return null;
	return new Date(value).toISOString();
};
