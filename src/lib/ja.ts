/**
 * Scrittura giapponese tradizionale di numeri, anni e date.
 */
import { ymdFromDay, type DayNumber } from './calendar/time';

const DIGITS = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

/** 1–99 in numeri kanji: 8 → 八, 10 → 十, 26 → 二十六 */
export function kanjiNumber(n: number): string {
	if (n < 10) return DIGITS[n];
	const tens = Math.floor(n / 10);
	const units = n % 10;
	return (tens > 1 ? DIGITS[tens] : '') + '十' + (units ? DIGITS[units] : '');
}

const ERAS = [
	{ name: '令和', start: 2019 },
	{ name: '平成', start: 1989 },
	{ name: '昭和', start: 1926 }
];

/** Anno nell'era imperiale: 2026 → 令和八年, 2019 → 令和元年 */
export function eraYear(y: number): string {
	const era = ERAS.find((e) => y >= e.start);
	if (!era) return String(y).split('').map((c) => DIGITS[Number(c)]).join('') + '年';
	const n = y - era.start + 1;
	return `${era.name}${n === 1 ? '元' : kanjiNumber(n)}年`;
}

/** Mese lunare: 十月大, 閏五月小 */
export function lunarMonthJa(month: number, leap: boolean, length: number): string {
	return `${leap ? '閏' : ''}${kanjiNumber(month)}月${length === 30 ? '大' : '小'}`;
}

/** Data gregoriana senza anno, con cifre arabe come nei calendari moderni: 11月9日 */
export function gregorianJa(day: DayNumber): string {
	const { m, d } = ymdFromDay(day);
	return `${m}月${d}日`;
}

// ---------------------------------------------------------------------------
// Letture in hiragana

const UNIT_KANA = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう'];

/** Lettura di un numero 1–99, con le forme indicate per le unità. */
function numberKana(n: number, units: string[] = UNIT_KANA): string {
	const tens = Math.floor(n / 10);
	const u = n % 10;
	const tensKana = tens === 0 ? '' : (tens > 1 ? UNIT_KANA[tens] : '') + 'じゅう';
	return tensKana + (u ? units[u] : '');
}

const ERA_KANA: Record<string, string> = { 令和: 'れいわ', 平成: 'へいせい', 昭和: 'しょうわ' };
const YEAR_UNITS = ['', 'いち', 'に', 'さん', 'よ', 'ご', 'ろく', 'しち', 'はち', 'く'];

/** 令和八年 → れいわはちねん */
export function eraYearKana(y: number): string {
	const era = ERAS.find((e) => y >= e.start);
	if (!era) return '';
	const n = y - era.start + 1;
	return ERA_KANA[era.name] + (n === 1 ? 'がん' : numberKana(n, YEAR_UNITS)) + 'ねん';
}

const MONTH_KANA = ['', 'いち', 'に', 'さん', 'し', 'ご', 'ろく', 'しち', 'はち', 'く', 'じゅう', 'じゅういち', 'じゅうに'];

export function monthKana(m: number): string {
	return MONTH_KANA[m] + 'がつ';
}

/** 十月大 → じゅうがつだい, 閏五月小 → うるうごがつしょう */
export function lunarMonthJaKana(month: number, leap: boolean, length: number): string {
	return `${leap ? 'うるう' : ''}${monthKana(month)}${length === 30 ? 'だい' : 'しょう'}`;
}

const DAY_SPECIAL: Record<number, string> = {
	1: 'ついたち',
	2: 'ふつか',
	3: 'みっか',
	4: 'よっか',
	5: 'いつか',
	6: 'むいか',
	7: 'なのか',
	8: 'ようか',
	9: 'ここのか',
	10: 'とおか',
	14: 'じゅうよっか',
	20: 'はつか',
	24: 'にじゅうよっか'
};
const DAY_UNITS = ['', 'いち', 'に', 'さん', 'よっ', 'ご', 'ろく', 'しち', 'はち', 'く'];

/** Lettura del giorno del mese: 九日 → ここのか, 十一日 → じゅういちにち */
export function dayKana(d: number): string {
	return DAY_SPECIAL[d] ?? numberKana(d, DAY_UNITS) + 'にち';
}

/** 十一月九日 → じゅういちがつここのか */
export function gregorianJaKana(day: DayNumber): string {
	const { m, d } = ymdFromDay(day);
	return monthKana(m) + dayKana(d);
}

export const WEEKDAYS_JA = ['月', '火', '水', '木', '金', '土', '日'];
