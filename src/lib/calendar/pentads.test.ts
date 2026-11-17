import { describe, expect, it } from 'vitest';
import { PENTADS, pentadName } from './pentads';
import { pentadAt, termAt, SOLAR_TERMS } from './solarTerms';
import { dayFromYMD } from './time';
import { formatRangeShort } from '../format';

describe('pentadi', () => {
	it('sono 72, tutte diverse', () => {
		expect(PENTADS).toHaveLength(72);
		expect(new Set(PENTADS.map((p) => p.kanji)).size).toBe(72);
	});

	it.each([
		[2026, 2, 4, '東風解凍'], // 立春 初候
		[2026, 11, 17, '金盞香'], // 立冬 末候
		[2026, 12, 22, '乃東生'] // 冬至 初候
	])('%i-%i-%i → %s', (y, m, d, kanji) => {
		expect(pentadName(pentadAt(dayFromYMD(y, m, d)).longitude).kanji).toBe(kanji);
	});

	it('termine solare in corso con le sue date', () => {
		const t = termAt(dayFromYMD(2026, 11, 17));
		expect(SOLAR_TERMS[t.termIndex].kanji).toBe('立冬');
		expect(formatRangeShort(t.startDay, t.endDay - 1)).toBe('dal 7 al 21 novembre');
	});

	it('intervalli a cavallo di due mesi', () => {
		expect(formatRangeShort(dayFromYMD(2026, 11, 28), dayFromYMD(2026, 12, 2))).toBe('dal 28 novembre al 2 dicembre');
		expect(formatRangeShort(dayFromYMD(2026, 11, 8), dayFromYMD(2026, 11, 11))).toBe('dall’8 all’11 novembre');
	});
});
