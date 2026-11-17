import { describe, expect, it } from 'vitest';
import { dayFromYMD, isoFromDay } from './time';
import { lunarDate, monthsOfLunarYear, dayOfLunarDate } from './lunisolar';
import { daySexagenary, yearSexagenary } from './sexagenary';
import { solarTermsInDays } from './solarTerms';

const newYear = (y: number) => isoFromDay(dayOfLunarDate(y, 1, 1)!);
const leapOf = (y: number) => monthsOfLunarYear(y).find((m) => m.leap)?.month ?? null;

describe('capodanno lunare (kyūreki, JST)', () => {
	it.each([
		[2017, '2017-01-28'],
		[2020, '2020-01-25'],
		[2023, '2023-01-22'],
		[2024, '2024-02-10'],
		[2025, '2025-01-29'],
		[2026, '2026-02-17'],
		// in Cina il 6 febbraio: il novilunio cade alle 00:56 JST del 7
		[2027, '2027-02-07']
	])('%i → %s', (y, iso) => {
		expect(newYear(y)).toBe(iso);
	});
});

describe('mesi intercalari', () => {
	it.each([
		[2017, 5], // in Cina 閏6月: differenza nota tra JST e UTC+8
		[2020, 4],
		[2023, 2],
		[2025, 6],
		[2028, 5],
		[2033, 11], // "problema del 2033": soluzione raccomandata 閏11月
		[2024, null],
		[2026, null]
	])('%i → 閏%s月', (y, m) => {
		expect(leapOf(y)).toBe(m);
	});

	it('ogni anno ha 12 o 13 mesi di 29 o 30 giorni', () => {
		for (let y = 1990; y <= 2060; y++) {
			const months = monthsOfLunarYear(y);
			expect([12, 13]).toContain(months.length);
			expect(months.filter((m) => m.leap).length).toBe(months.length - 12);
			for (const m of months) expect([29, 30]).toContain(m.length);
			expect(months[0].month).toBe(1);
		}
	});
});

describe('date lunari', () => {
	it('2026-11-17 è il 9 del 10° mese', () => {
		const l = lunarDate(dayFromYMD(2026, 11, 17));
		expect([l.year, l.month, l.leap, l.day]).toEqual([2026, 10, false, 9]);
	});

	it('il solstizio d’inverno cade sempre nell’11° mese', () => {
		for (let y = 2000; y <= 2050; y++) {
			const ws = solarTermsInDays(dayFromYMD(y, 12, 15), dayFromYMD(y, 12, 28)).find((t) => t.info.kanji === '冬至')!;
			const l = lunarDate(ws.day);
			expect(l.month).toBe(11);
			expect(l.leap).toBe(false);
		}
	});
});

describe('ciclo sessagesimale', () => {
	it('2000-01-01 è il giorno 戊午', () => {
		expect(daySexagenary(dayFromYMD(2000, 1, 1)).kanji).toBe('戊午');
	});
	it('2026 è l’anno 丙午, Cavallo di Fuoco', () => {
		const s = yearSexagenary(2026);
		expect([s.kanji, s.animal, s.element]).toEqual(['丙午', 'Cavallo', 'Fuoco']);
	});
});

describe('ricorrenze verificate', async () => {
	const { observancesOn } = await import('../zen/observances');
	const ids = (y: number, m: number, d: number) => {
		const day = dayFromYMD(y, m, d);
		return observancesOn(day, lunarDate(day)).map((o) => `${o.observance.id}:${o.kind}`);
	};
	it('29 settembre: Ryōso-ki (gregoriano)', () => {
		expect(ids(2026, 9, 29)).toContain('ryoso-ki:gregoriana');
	});
	it('21 novembre: nascita di Keizan (gregoriano)', () => {
		expect(ids(2026, 11, 21)).toContain('taiso-gotan-e:gregoriana');
	});
	it('26 gennaio: nascita di Dōgen (gregoriano)', () => {
		expect(ids(2027, 1, 26)).toContain('koso-gotan-e:gregoriana');
	});
});
