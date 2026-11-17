import { describe, expect, it } from 'vitest';
import { dayFromJulian, ymdJulianFromDay, ymdFromDay, civilDate, dayFromCivil, dayFromYMD } from './time';
import { lunarDate, monthsOfLunarYear } from './lunisolar';
import { calendarSystem } from './historical';

describe('calendario giuliano', () => {
	it('andata e ritorno', () => {
		for (const [y, m, d] of [[862, 3, 1], [1200, 1, 19], [1582, 10, 4]]) {
			expect(ymdJulianFromDay(dayFromJulian(y, m, d))).toEqual({ y, m, d });
		}
	});
	it('il 4 ottobre 1582 giuliano è seguito dal 15 ottobre gregoriano', () => {
		expect(dayFromJulian(1582, 10, 4) + 1).toBe(dayFromYMD(1582, 10, 15));
		expect(civilDate(dayFromYMD(1582, 10, 15)).julian).toBe(false);
		expect(civilDate(dayFromJulian(1582, 10, 4)).julian).toBe(true);
		expect(dayFromCivil(1200, 1, 19)).toBe(dayFromJulian(1200, 1, 19));
	});
});

describe('mesi storici (NAOJ)', () => {
	it('nascita di Dōgen: 2° giorno del 1° mese di Shōji 2 = 19 gennaio 1200 giuliano = 26 gennaio gregoriano', () => {
		const day = dayFromJulian(1200, 1, 19);
		const l = lunarDate(day);
		expect([l.year, l.month, l.leap, l.day]).toEqual([1200, 1, false, 2]);
		expect([l.monthInfo.era, l.monthInfo.eraYear]).toEqual(['正治', 2]);
		expect(ymdFromDay(day)).toEqual({ y: 1200, m: 1, d: 26 });
	});
	it('il 1200 ha il 2° mese intercalare', () => {
		const months = monthsOfLunarYear(1200);
		expect(months).toHaveLength(13);
		expect(months.find((m) => m.leap)?.month).toBe(2);
	});
	it('calendari in vigore', () => {
		expect(calendarSystem(1200)?.kanji).toBe('宣明暦');
		expect(calendarSystem(1700)?.kanji).toBe('貞享暦');
		expect(calendarSystem(1850)?.kanji).toBe('天保暦');
		expect(calendarSystem(1873)).toBeNull();
	});
});

describe('tavole complete', () => {
	it('copre il 862–1872 con 12 o 13 mesi ogni anno', async () => {
		const { historicalYear } = await import('./historical');
		for (let y = 862; y <= 1872; y++) {
			const n = historicalYear(y).length;
			expect([12, 13]).toContain(n);
		}
	});
	it('il calendario continua senza buchi tra 1872 e 1873', () => {
		const a = lunarDate(dayFromYMD(1872, 12, 31));
		const b = lunarDate(dayFromYMD(1873, 1, 1));
		expect([a.year, a.month]).toEqual([b.year, b.month]);
		expect(b.day).toBe(a.day + 1);
	});
});
