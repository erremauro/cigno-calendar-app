/**
 * Mesi storici del calendario giapponese (862–1872), dal database del
 * National Astronomical Observatory of Japan (dati di 内田正男『日本暦日原典』).
 * Il file historical.json si genera con scripts/fetch_naoj.py.
 */
import data from './historical.json';
import type { DayNumber } from './time';

export interface HistoricalMonth {
	year: number;
	month: number;
	leap: boolean;
	startDay: DayNumber;
	length: number;
	era: string;
	eraYear: number;
}

function decode(): HistoricalMonth[] {
	const out: HistoricalMonth[] = [];
	let start = data.start;
	let year = data.firstYear;
	let runIndex = 0;
	let era = '';
	let eraYear = 0;
	for (let i = 0; i < data.months.length; i++) {
		const code = data.months[i];
		const leap = code >= 'A' && code <= 'L';
		const month = code.toLowerCase().charCodeAt(0) - 96;
		if (i > 0 && month === 1 && !leap) {
			year++;
			eraYear++;
		}
		const run = data.eras[runIndex];
		if (run && run[0] === i) {
			era = data.eraNames[run[1]];
			eraYear = run[2];
			runIndex++;
		}
		const length = data.lengths[i] === '9' ? 29 : 30;
		out.push({ year, month, leap, startDay: start, length, era, eraYear });
		start += length;
	}
	return out;
}

export const HISTORICAL: HistoricalMonth[] = decode();
export const HISTORICAL_SOURCE: string = data.source;

/** Mese storico che contiene il giorno, o null se fuori dall'intervallo dei dati. */
export function historicalMonthOf(day: DayNumber): HistoricalMonth | null {
	let lo = 0;
	let hi = HISTORICAL.length - 1;
	if (hi < 0 || day < HISTORICAL[0].startDay) return null;
	const last = HISTORICAL[hi];
	if (day >= last.startDay + last.length) return null;
	while (lo < hi) {
		const mid = (lo + hi + 1) >> 1;
		if (HISTORICAL[mid].startDay <= day) lo = mid;
		else hi = mid - 1;
	}
	return HISTORICAL[lo];
}

export function historicalYear(year: number): HistoricalMonth[] {
	return HISTORICAL.filter((m) => m.year === year);
}

/** Calendari ufficiali giapponesi e anni lunari in cui sono stati in vigore. */
export const CALENDAR_SYSTEMS = [
	{ from: 862, to: 1684, kanji: '宣明暦', romaji: 'Senmyō-reki', nome: 'calendario Senmyō' },
	{ from: 1685, to: 1754, kanji: '貞享暦', romaji: 'Jōkyō-reki', nome: 'calendario Jōkyō' },
	{ from: 1755, to: 1797, kanji: '宝暦暦', romaji: 'Hōreki-reki', nome: 'calendario Hōreki' },
	{ from: 1798, to: 1843, kanji: '寛政暦', romaji: 'Kansei-reki', nome: 'calendario Kansei' },
	{ from: 1844, to: 1872, kanji: '天保暦', romaji: 'Tenpō-reki', nome: 'calendario Tenpō' }
];

/** Ultimo anno lunare con calendario ufficiale (dal 1873 il Giappone adotta il gregoriano). */
export const LAST_HISTORICAL_YEAR = 1872;

export function calendarSystem(lunarYear: number) {
	if (lunarYear > LAST_HISTORICAL_YEAR) return null;
	return CALENDAR_SYSTEMS.findLast((c) => lunarYear >= c.from) ?? null;
}
