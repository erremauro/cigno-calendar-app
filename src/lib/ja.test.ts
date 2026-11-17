import { describe, expect, it } from 'vitest';
import { kanjiNumber, eraYear, lunarMonthJa, gregorianJa } from './ja';
import { dayFromYMD } from './calendar/time';

describe('scrittura giapponese', () => {
	it('numeri', () => {
		expect([1, 8, 10, 11, 20, 26, 30, 31].map(kanjiNumber)).toEqual(['一', '八', '十', '十一', '二十', '二十六', '三十', '三十一']);
	});
	it('ere', () => {
		expect(eraYear(2026)).toBe('令和八年');
		expect(eraYear(2019)).toBe('令和元年');
		expect(eraYear(2017)).toBe('平成二十九年');
	});
	it('mesi e date', () => {
		expect(lunarMonthJa(10, false, 30)).toBe('十月大');
		expect(lunarMonthJa(5, true, 29)).toBe('閏五月小');
		expect(gregorianJa(dayFromYMD(2026, 12, 8))).toBe('12月8日');
	});
});

import { eraYearKana, lunarMonthJaKana, dayKana, gregorianJaKana } from './ja';

describe('hiragana', () => {
	it('anni', () => {
		expect(eraYearKana(2026)).toBe('れいわはちねん');
		expect(eraYearKana(2019)).toBe('れいわがんねん');
		expect(eraYearKana(2022)).toBe('れいわよねん');
		expect(eraYearKana(1997)).toBe('へいせいくねん');
	});
	it('mesi', () => {
		expect(lunarMonthJaKana(10, false, 30)).toBe('じゅうがつだい');
		expect(lunarMonthJaKana(4, false, 29)).toBe('しがつしょう');
		expect(lunarMonthJaKana(5, true, 29)).toBe('うるうごがつしょう');
	});
	it('giorni', () => {
		expect([1, 8, 9, 11, 14, 17, 19, 20, 24, 30].map(dayKana)).toEqual([
			'ついたち', 'ようか', 'ここのか', 'じゅういちにち', 'じゅうよっか',
			'じゅうしちにち', 'じゅうくにち', 'はつか', 'にじゅうよっか', 'さんじゅうにち'
		]);
		expect(gregorianJaKana(dayFromYMD(2026, 11, 9))).toBe('じゅういちがつここのか');
	});
});
