/**
 * Riunisce tutte le informazioni di una giornata e di un mese lunare.
 */
import { lunarDate, lunarMonthOf, type LunarDate, type LunarMonth } from './lunisolar';
import { moonAt, moonQuartersInDays, type MoonQuarterEvent, type MoonState } from './moon';
import { solarTermsInDays, type SolarTermEvent } from './solarTerms';
import { daySexagenary, yearSexagenary, monthBranch, MONTH_NAMES_JA, type MonthName, type Sexagenary } from './sexagenary';
import { guaqiAt, sovereignHexagram, type GuaqiDay } from '../iching/seasonal';
import type { Hexagram } from '../iching/hexagrams';
import { observancesOn, type ObservanceMatch } from '../zen/observances';
import { weekday, type DayNumber } from './time';

export interface DayInfo {
	day: DayNumber;
	weekday: number;
	lunar: LunarDate;
	moon: MoonState;
	quarter?: MoonQuarterEvent;
	solarTerm?: SolarTermEvent;
	sexagenary: Sexagenary;
	guaqi: GuaqiDay;
	observances: ObservanceMatch[];
}

export interface MonthView {
	month: LunarMonth;
	nameJa: MonthName;
	branch: string;
	yearCycle: Sexagenary;
	sovereign: Hexagram;
	days: DayInfo[];
}

export function dayInfo(day: DayNumber): DayInfo {
	const lunar = lunarDate(day);
	return {
		day,
		weekday: weekday(day),
		lunar,
		moon: moonAt(day),
		quarter: moonQuartersInDays(day, day)[0],
		solarTerm: solarTermsInDays(day, day)[0],
		sexagenary: daySexagenary(day),
		guaqi: guaqiAt(day),
		observances: observancesOn(day, lunar)
	};
}

export function monthView(anyDay: DayNumber): MonthView {
	const month = lunarMonthOf(anyDay);
	const last = month.startDay + month.length - 1;
	const quarters = moonQuartersInDays(month.startDay, last);
	const terms = solarTermsInDays(month.startDay, last);

	const days: DayInfo[] = [];
	for (let d = month.startDay; d <= last; d++) {
		const lunar = lunarDate(d);
		days.push({
			day: d,
			weekday: weekday(d),
			lunar,
			moon: moonAt(d),
			quarter: quarters.find((q) => q.day === d),
			solarTerm: terms.find((t) => t.day === d),
			sexagenary: daySexagenary(d),
			guaqi: guaqiAt(d),
			observances: observancesOn(d, lunar)
		});
	}

	return {
		month,
		nameJa: MONTH_NAMES_JA[month.month - 1],
		branch: monthBranch(month.month),
		yearCycle: yearSexagenary(month.year),
		sovereign: sovereignHexagram(month.month),
		days
	};
}
