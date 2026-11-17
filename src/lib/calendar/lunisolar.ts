/**
 * Calendario lunisolare cinese/giapponese (旧暦, kyūreki) calcolato astronomicamente.
 *
 * Regole (quelle del calendario Tenpō, 天保暦, con Sole e Luna veri), applicate all'ora di Tokyo (UTC+9):
 *  1. ogni mese inizia nel giorno civile del novilunio;
 *  2. il mese che contiene il solstizio d'inverno (冬至) è l'11° mese;
 *  3. se tra due 11° mesi consecutivi ci sono 13 lune, il primo mese che non contiene
 *     alcun termine principale (中気) è intercalare (閏月) e prende il numero del mese precedente.
 *
 * La regola 3 è quella "cinese": risolve anche il cosiddetto "problema del 2033"
 * del calendario giapponese nel modo raccomandato (閏11月 nel 2033).
 *
 * Fino al 1872 (ultimo anno del calendario lunisolare ufficiale in Giappone) i mesi
 * non si calcolano: vengono dalle tavole storiche (vedi historical.ts), che seguono
 * i calendari effettivamente in uso (Senmyō, Jōkyō, Hōreki, Kansei, Tenpō).
 */
import { SearchMoonPhase } from 'astronomy-engine';
import { DAY_MS, jstDay, utcDate, ymdFromDay, type DayNumber } from './time';
import { crossingsInDays, winterSolsticeDay } from './solarTerms';
import { historicalMonthOf, historicalYear, HISTORICAL, LAST_HISTORICAL_YEAR } from './historical';

export interface LunarMonth {
	/** anno lunare (numerato come l'anno gregoriano in cui cade il suo capodanno) */
	year: number;
	/** 1–12 */
	month: number;
	leap: boolean;
	startDay: DayNumber;
	/** 29 (小の月) o 30 (大の月) */
	length: number;
	/** istante esatto del novilunio d'inizio (solo per i mesi calcolati) */
	newMoon?: Date;
	/** era imperiale (年号) e suo anno, per i mesi storici */
	era?: string;
	eraYear?: number;
}

/** Dal 1° gennaio 1873 il Giappone usa il calendario gregoriano: da qui i mesi si calcolano. */
export const COMPUTED_FROM: DayNumber = Math.floor(Date.UTC(1873, 0, 1) / DAY_MS);

export interface LunarDate {
	year: number;
	month: number;
	leap: boolean;
	day: number;
	monthInfo: LunarMonth;
}

interface NewMoon {
	time: Date;
	day: DayNumber;
}

function newMoonsBetween(fromDay: DayNumber, toDay: DayNumber): NewMoon[] {
	const out: NewMoon[] = [];
	let t = utcDate(fromDay);
	const end = utcDate(toDay + 1);
	while (t < end) {
		const found = SearchMoonPhase(0, t, 40);
		if (!found || found.date >= end) break;
		out.push({ time: found.date, day: jstDay(found.date) });
		t = new Date(found.date.getTime() + DAY_MS);
	}
	return out;
}

/** "Sui" (歳): l'insieme dei mesi dall'11° mese che contiene il solstizio di `s` fino a quello di `s + 1` (escluso). */
const suiCache = new Map<number, LunarMonth[]>();

function sui(s: number): LunarMonth[] {
	const cached = suiCache.get(s);
	if (cached) return cached;

	const ws1 = winterSolsticeDay(s);
	const ws2 = winterSolsticeDay(s + 1);
	const moons = newMoonsBetween(ws1 - 31, ws2 + 1);

	const idx1 = moons.findLastIndex((m) => m.day <= ws1);
	const idx2 = moons.findLastIndex((m) => m.day <= ws2);
	if (idx1 < 0 || idx2 < 0) throw new Error(`Noviluni non trovati per il sui ${s}`);
	const starts = moons.slice(idx1, idx2 + 1); // include l'inizio dell'11° mese successivo come sentinella
	const count = starts.length - 1;

	const principalDays = crossingsInDays(starts[0].day, starts[count].day)
		.filter((c) => c.longitude % 30 === 0)
		.map((c) => c.day);

	let leapIndex = -1;
	if (count === 13) {
		leapIndex = starts.findIndex(
			(m, i) => i < count && !principalDays.some((d) => d >= m.day && d < starts[i + 1].day)
		);
	} else if (count !== 12) {
		throw new Error(`Sui ${s}: ${count} lune, atteso 12 o 13`);
	}

	const months: LunarMonth[] = [];
	let number = 10;
	let year = s;
	for (let i = 0; i < count; i++) {
		const leap = i === leapIndex;
		if (!leap) {
			number = (number % 12) + 1;
			if (number === 1) year = s + 1;
		}
		months.push({
			year,
			month: number,
			leap,
			startDay: starts[i].day,
			length: starts[i + 1].day - starts[i].day,
			newMoon: starts[i].time
		});
	}
	suiCache.set(s, months);
	return months;
}

/** Il mese lunare che contiene la data civile `day`. */
export function lunarMonthOf(day: DayNumber): LunarMonth {
	if (day < COMPUTED_FROM) {
		const h = historicalMonthOf(day);
		if (h) return h;
	}
	return computedMonthOf(day);
}

/** Mese calcolato con le regole moderne, anche per gli anni storici (usato nei test di confronto). */
export function computedMonthOf(day: DayNumber): LunarMonth {
	const { y } = ymdFromDay(day);
	const s = day >= sui(y)[0].startDay ? y : y - 1;
	const months = sui(s);
	const m = months.findLast((x) => x.startDay <= day);
	if (!m) throw new Error('Mese lunare non trovato');
	return m;
}

export function lunarDate(day: DayNumber): LunarDate {
	const m = lunarMonthOf(day);
	return { year: m.year, month: m.month, leap: m.leap, day: day - m.startDay + 1, monthInfo: m };
}

export function nextLunarMonth(m: LunarMonth): LunarMonth {
	return lunarMonthOf(m.startDay + m.length);
}

export function previousLunarMonth(m: LunarMonth): LunarMonth {
	return lunarMonthOf(m.startDay - 1);
}

/** Tutti i mesi di un anno lunare, in ordine (12 o 13). */
export function monthsOfLunarYear(year: number): LunarMonth[] {
	if (year <= LAST_HISTORICAL_YEAR && HISTORICAL.length && year >= HISTORICAL[0].year) return historicalYear(year);
	return [...sui(year - 1), ...sui(year)].filter((m) => m.year === year);
}

/** Primo anno lunare disponibile (inizio delle tavole storiche). */
export const FIRST_YEAR: number = HISTORICAL.length ? HISTORICAL[0].year : 1873;

/** Giorno civile di una data lunare (se esiste: il 30 non esiste nei mesi brevi). */
export function dayOfLunarDate(year: number, month: number, day: number, leap = false): DayNumber | null {
	const m = monthsOfLunarYear(year).find((x) => x.month === month && x.leap === leap);
	if (!m || day < 1 || day > m.length) return null;
	return m.startDay + day - 1;
}

/** Numero di giorni tra due istanti espresso come numero di giorni civili (utile nei test). */
export const daysBetween = (a: Date, b: Date) => (b.getTime() - a.getTime()) / DAY_MS;
