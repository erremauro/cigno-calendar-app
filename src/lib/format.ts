import { civilDate, weekday, type DayNumber } from './calendar/time';

// Le date sono «civili»: giuliane prima del 15 ottobre 1582, gregoriane dopo (vedi civilDate).
const MONTHS = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const MONTHS_SHORT = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
const WEEKDAYS = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
const timeFmt = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' });

/** «martedì 17 novembre 2026» */
export function formatLong(day: DayNumber): string {
	const c = civilDate(day);
	return `${WEEKDAYS[weekday(day)]} ${c.d} ${MONTHS[c.m - 1]} ${c.y}`;
}
/** «17 nov» */
export function formatShort(day: DayNumber): string {
	const c = civilDate(day);
	return `${c.d} ${MONTHS_SHORT[c.m - 1]}`;
}
/** «17 nov 2026» */
export function formatShortYear(day: DayNumber): string {
	const c = civilDate(day);
	return `${c.d} ${MONTHS_SHORT[c.m - 1]} ${c.y}`;
}
export const formatTime = (t: Date) => timeFmt.format(t);
/** true se la data è espressa nel calendario giuliano */
export const isJulian = (day: DayNumber) => civilDate(day).julian;

export const WEEKDAYS_SHORT = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'];

export function ordinal(n: number): string {
	return `${n}°`;
}

/** "10° mese" / "10° mese intercalare" */
export function lunarMonthLabel(month: number, leap: boolean): string {
	return `${month}° mese${leap ? ' intercalare' : ''}`;
}

export const PENTAD_NAMES = [
	{ kanji: '初候', romaji: 'shokō' },
	{ kanji: '次候', romaji: 'jikō' },
	{ kanji: '末候', romaji: 'matsukō' }
];

/** «9 novembre», «1° dicembre» */
function dayMonth(day: DayNumber): string {
	const c = civilDate(day);
	return `${c.d === 1 ? '1°' : c.d} ${MONTHS[c.m - 1]}`;
}

/** «dal 7 al 21 novembre», «dal 28 novembre al 2 dicembre» (senza anno) */
export function formatRangeShort(from: DayNumber, to: DayNumber): string {
	const sameMonth = civilDate(from).m === civilDate(to).m;
	const left = sameMonth ? dayMonth(from).split(' ')[0] : dayMonth(from);
	const right = dayMonth(to);
	const elide = (s: string) => /^(8|11)\b/.test(s);
	return `${elide(left) ? 'dall’' : 'dal '}${left} ${elide(right) ? 'all’' : 'al '}${right}`;
}

/** «dal 9 novembre all’8 dicembre 2026» (l’anno è ripetuto solo se cambia) */
export function formatRange(from: DayNumber, to: DayNumber): string {
	const y1 = civilDate(from).y;
	const y2 = civilDate(to).y;
	const a = dayMonth(from) + (y1 !== y2 ? ` ${y1}` : '');
	const b = `${dayMonth(to)} ${y2}`;
	const elide = (s: string) => /^(8|11) /.test(s);
	return `${elide(a) ? 'dall’' : 'dal '}${a} ${elide(b) ? 'all’' : 'al '}${b}`;
}
