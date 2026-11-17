/**
 * Gestione delle date civili come "numeri di giorno" interi (giorni dal 1970-01-01).
 * Un numero di giorno rappresenta una data del calendario, indipendente dal fuso.
 */

export const DAY_MS = 86_400_000;

/** Il kyūreki (calendario lunisolare giapponese) è definito sull'ora di Tokyo (UTC+9). */
export const JST_OFFSET_MS = 9 * 3_600_000;

export type DayNumber = number;

export interface YMD {
	y: number;
	m: number;
	d: number;
}

/** Data civile (in un fuso con offset fisso) in cui cade l'istante `t`. */
export function dayInOffset(t: Date, offsetMs: number): DayNumber {
	return Math.floor((t.getTime() + offsetMs) / DAY_MS);
}

/** Data civile giapponese (JST) in cui cade l'istante `t`. */
export function jstDay(t: Date): DayNumber {
	return dayInOffset(t, JST_OFFSET_MS);
}

/** Data civile nel fuso locale del browser in cui cade l'istante `t`. */
export function localDay(t: Date): DayNumber {
	return dayFromYMD(t.getFullYear(), t.getMonth() + 1, t.getDate());
}

export function dayFromYMD(y: number, m: number, d: number): DayNumber {
	return Math.floor(Date.UTC(y, m - 1, d) / DAY_MS);
}

export function ymdFromDay(n: DayNumber): YMD {
	const dt = new Date(n * DAY_MS);
	return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}

/** 0 = domenica … 6 = sabato */
export function weekday(n: DayNumber): number {
	return new Date(n * DAY_MS).getUTCDay();
}

/** Istante di mezzanotte UTC della data civile (utile come punto di partenza per le ricerche). */
export function utcDate(n: DayNumber): Date {
	return new Date(n * DAY_MS);
}

/** Mezzogiorno locale (fuso del browser) della data civile. */
export function localNoon(n: DayNumber): Date {
	const { y, m, d } = ymdFromDay(n);
	return new Date(y, m - 1, d, 12, 0, 0);
}

export function todayLocal(): DayNumber {
	return localDay(new Date());
}

export function isoFromDay(n: DayNumber): string {
	const { y, m, d } = ymdFromDay(n);
	return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function dayFromIso(s: string): DayNumber | null {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
	if (!match) return null;
	const [, y, m, d] = match.map(Number);
	if (m < 1 || m > 12 || d < 1 || d > 31) return null;
	return dayFromYMD(y, m, d);
}

// ---------------------------------------------------------------------------
// Calendario giuliano: le date anteriori al 15 ottobre 1582 si mostrano in giuliano,
// come nelle fonti storiche.

const UNIX_JDN = 2440588; // numero del giorno giuliano del 1970-01-01

/** Primo giorno del calendario gregoriano: 15 ottobre 1582. */
export const GREGORIAN_START: DayNumber = dayFromYMD(1582, 10, 15);

export function ymdJulianFromDay(n: DayNumber): YMD {
	const c = n + UNIX_JDN + 32082;
	const d = Math.floor((4 * c + 3) / 1461);
	const e = c - Math.floor((1461 * d) / 4);
	const m = Math.floor((5 * e + 2) / 153);
	return {
		d: e - Math.floor((153 * m + 2) / 5) + 1,
		m: m + 3 - 12 * Math.floor(m / 10),
		y: d - 4800 + Math.floor(m / 10)
	};
}

export function dayFromJulian(y: number, m: number, d: number): DayNumber {
	const a = Math.floor((14 - m) / 12);
	const yy = y + 4800 - a;
	const mm = m + 12 * a - 3;
	return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - 32083 - UNIX_JDN;
}

export interface CivilDate extends YMD {
	julian: boolean;
}

/** Data «civile» come la scriverebbe una fonte storica: giuliana prima del 1582, gregoriana dopo. */
export function civilDate(n: DayNumber): CivilDate {
	return n < GREGORIAN_START ? { ...ymdJulianFromDay(n), julian: true } : { ...ymdFromDay(n), julian: false };
}

/** Inverso di civilDate: interpreta una data come giuliana se anteriore al 15/10/1582. */
export function dayFromCivil(y: number, m: number, d: number): DayNumber {
	return y < 1582 || (y === 1582 && (m < 10 || (m === 10 && d < 15))) ? dayFromJulian(y, m, d) : dayFromYMD(y, m, d);
}
