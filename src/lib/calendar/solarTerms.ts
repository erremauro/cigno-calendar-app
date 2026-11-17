/**
 * I 24 termini solari (二十四節気, nijūshi sekki) e le 72 pentadi (七十二候, shichijūni kō),
 * calcolati con il metodo del "sole vero" (定気): un termine ogni 15° di longitudine
 * eclittica del Sole, una pentade ogni 5°.
 */
import { SearchSunLongitude, SunPosition } from 'astronomy-engine';
import { DAY_MS, jstDay, utcDate, dayFromYMD, type DayNumber } from './time';

export interface SolarTermInfo {
	kanji: string;
	/** lettura in hiragana */
	kana: string;
	romaji: string;
	nome: string;
	/** true per i 中気 (chūki): i termini "principali", multipli di 30°, che determinano la numerazione dei mesi */
	principale: boolean;
}

/** Indicizzati per longitudine / 15 (0 = 春分, equinozio di primavera). */
export const SOLAR_TERMS: SolarTermInfo[] = [
	{ kanji: '春分', kana: 'しゅんぶん', romaji: 'shunbun', nome: 'Equinozio di primavera' },
	{ kanji: '清明', kana: 'せいめい', romaji: 'seimei', nome: 'Limpida luminosità' },
	{ kanji: '穀雨', kana: 'こくう', romaji: 'kokuu', nome: 'Pioggia dei cereali' },
	{ kanji: '立夏', kana: 'りっか', romaji: 'rikka', nome: 'Inizio dell’estate' },
	{ kanji: '小満', kana: 'しょうまん', romaji: 'shōman', nome: 'Piccola pienezza' },
	{ kanji: '芒種', kana: 'ぼうしゅ', romaji: 'bōshu', nome: 'Grano in spiga' },
	{ kanji: '夏至', kana: 'げし', romaji: 'geshi', nome: 'Solstizio d’estate' },
	{ kanji: '小暑', kana: 'しょうしょ', romaji: 'shōsho', nome: 'Piccolo caldo' },
	{ kanji: '大暑', kana: 'たいしょ', romaji: 'taisho', nome: 'Grande caldo' },
	{ kanji: '立秋', kana: 'りっしゅう', romaji: 'risshū', nome: 'Inizio dell’autunno' },
	{ kanji: '処暑', kana: 'しょしょ', romaji: 'shosho', nome: 'Fine del caldo' },
	{ kanji: '白露', kana: 'はくろ', romaji: 'hakuro', nome: 'Rugiada bianca' },
	{ kanji: '秋分', kana: 'しゅうぶん', romaji: 'shūbun', nome: 'Equinozio d’autunno' },
	{ kanji: '寒露', kana: 'かんろ', romaji: 'kanro', nome: 'Rugiada fredda' },
	{ kanji: '霜降', kana: 'そうこう', romaji: 'sōkō', nome: 'Discesa della brina' },
	{ kanji: '立冬', kana: 'りっとう', romaji: 'rittō', nome: 'Inizio dell’inverno' },
	{ kanji: '小雪', kana: 'しょうせつ', romaji: 'shōsetsu', nome: 'Piccola neve' },
	{ kanji: '大雪', kana: 'たいせつ', romaji: 'taisetsu', nome: 'Grande neve' },
	{ kanji: '冬至', kana: 'とうじ', romaji: 'tōji', nome: 'Solstizio d’inverno' },
	{ kanji: '小寒', kana: 'しょうかん', romaji: 'shōkan', nome: 'Piccolo freddo' },
	{ kanji: '大寒', kana: 'だいかん', romaji: 'daikan', nome: 'Grande freddo' },
	{ kanji: '立春', kana: 'りっしゅん', romaji: 'risshun', nome: 'Inizio della primavera' },
	{ kanji: '雨水', kana: 'うすい', romaji: 'usui', nome: 'Acqua di pioggia' },
	{ kanji: '啓蟄', kana: 'けいちつ', romaji: 'keichitsu', nome: 'Risveglio degli insetti' }
].map((t, i) => ({ ...t, principale: i % 2 === 0 }));

export interface Crossing {
	/** longitudine eclittica del Sole raggiunta (multiplo di 5°) */
	longitude: number;
	time: Date;
	/** data civile JST */
	day: DayNumber;
}

const STEP = 5;
const yearCache = new Map<number, Crossing[]>();

function sunLongitude(t: Date): number {
	return SunPosition(t).elon;
}

/** Tutti gli attraversamenti di multipli di 5° tra `from` e `to`. */
function crossingsBetween(from: Date, to: Date): Crossing[] {
	const out: Crossing[] = [];
	let t = from;
	let target = (Math.floor(sunLongitude(t) / STEP) + 1) * STEP;
	while (t < to) {
		const lon = target % 360;
		const found = SearchSunLongitude(lon, t, 10);
		if (!found) throw new Error(`Longitudine solare ${lon}° non trovata dopo ${t.toISOString()}`);
		if (found.date >= to) break;
		out.push({ longitude: lon, time: found.date, day: jstDay(found.date) });
		t = new Date(found.date.getTime() + 60_000);
		target = lon + STEP;
	}
	return out;
}

/**
 * Attraversamenti di 5° per l'anno gregoriano `y`, con un margine di un mese
 * prima e dopo (serve per collegare gli anni).
 */
export function crossingsForYear(y: number): Crossing[] {
	let c = yearCache.get(y);
	if (!c) {
		const from = utcDate(dayFromYMD(y - 1, 12, 1));
		const to = utcDate(dayFromYMD(y + 1, 2, 1));
		c = crossingsBetween(from, to);
		yearCache.set(y, c);
	}
	return c;
}

/** Attraversamenti che cadono (in JST) nell'intervallo di giorni [fromDay, toDay]. */
export function crossingsInDays(fromDay: DayNumber, toDay: DayNumber): Crossing[] {
	const years = new Set<number>();
	for (let d = fromDay; d <= toDay + 1; d += 300) years.add(new Date(d * DAY_MS).getUTCFullYear());
	years.add(new Date(toDay * DAY_MS).getUTCFullYear());
	const seen = new Set<number>();
	const out: Crossing[] = [];
	for (const y of [...years].sort()) {
		for (const c of crossingsForYear(y)) {
			const key = c.time.getTime();
			if (c.day >= fromDay && c.day <= toDay && !seen.has(key)) {
				seen.add(key);
				out.push(c);
			}
		}
	}
	return out.sort((a, b) => a.time.getTime() - b.time.getTime());
}

export interface SolarTermEvent {
	index: number;
	info: SolarTermInfo;
	time: Date;
	day: DayNumber;
}

export function solarTermsInDays(fromDay: DayNumber, toDay: DayNumber): SolarTermEvent[] {
	return crossingsInDays(fromDay, toDay)
		.filter((c) => c.longitude % 15 === 0)
		.map((c) => ({ index: c.longitude / 15, info: SOLAR_TERMS[c.longitude / 15], time: c.time, day: c.day }));
}

/** Giorno JST del solstizio d'inverno dell'anno gregoriano `y`. */
export function winterSolsticeDay(y: number): DayNumber {
	const c = crossingsForYear(y).find((x) => x.longitude === 270 && new Date(x.day * DAY_MS).getUTCFullYear() === y);
	if (!c) throw new Error(`Solstizio d'inverno ${y} non trovato`);
	return c.day;
}

export interface PentadPosition {
	/** termine solare in corso (indice in SOLAR_TERMS) */
	termIndex: number;
	/** pentade all'interno del termine: 0 = 初候, 1 = 次候, 2 = 末候 */
	pentad: number;
	/** longitudine d'inizio della pentade (multiplo di 5°) */
	longitude: number;
	/** giorno JST d'inizio della pentade */
	startDay: DayNumber;
	/** giorno JST d'inizio della pentade successiva */
	endDay: DayNumber;
}

/** Pentade in corso nella data civile `day` (secondo i giorni JST d'inizio). */
export function pentadAt(day: DayNumber): PentadPosition {
	const list = crossingsInDays(day - 10, day + 10);
	let current: Crossing | undefined;
	let next: Crossing | undefined;
	for (const c of list) {
		if (c.day <= day) current = c;
		else if (!next) next = c;
	}
	if (!current || !next) throw new Error('Pentade non determinata');
	const termLon = Math.floor(current.longitude / 15) * 15;
	return {
		termIndex: termLon / 15,
		pentad: (current.longitude - termLon) / 5,
		longitude: current.longitude,
		startDay: current.day,
		endDay: next.day
	};
}

export interface TermPosition {
	termIndex: number;
	/** giorno JST d'inizio del termine */
	startDay: DayNumber;
	/** giorno JST d'inizio del termine successivo */
	endDay: DayNumber;
}

/** Termine solare in corso nella data civile `day`. */
export function termAt(day: DayNumber): TermPosition {
	const list = crossingsInDays(day - 20, day + 20).filter((c) => c.longitude % 15 === 0);
	const current = list.findLast((c) => c.day <= day);
	const next = list.find((c) => c.day > day);
	if (!current || !next) throw new Error('Termine solare non determinato');
	return { termIndex: current.longitude / 15, startDay: current.day, endDay: next.day };
}
