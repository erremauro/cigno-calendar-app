/**
 * Fasi lunari per giorno, nel fuso orario locale di chi guarda.
 */
import { Body, Illumination, MoonPhase, SearchMoonQuarter, NextMoonQuarter } from 'astronomy-engine';
import { localDay, localNoon, utcDate, type DayNumber } from './time';

export interface MoonState {
	/** angolo di fase: 0 = nuova, 90 = primo quarto, 180 = piena, 270 = ultimo quarto */
	angle: number;
	/** frazione illuminata del disco, 0–1 */
	illumination: number;
	/** true se la luna è crescente */
	waxing: boolean;
	nome: string;
}

export interface MoonQuarterEvent {
	/** 0 = luna nuova, 1 = primo quarto, 2 = luna piena, 3 = ultimo quarto */
	quarter: number;
	nome: string;
	kanji: string;
	kana: string;
	romaji: string;
	significato: string;
	time: Date;
	/** data civile locale */
	day: DayNumber;
}

export const QUARTERS = [
	{ nome: 'Luna nuova', kanji: '朔', kana: 'さく', romaji: 'saku', significato: 'inizio del mese' },
	{ nome: 'Primo quarto', kanji: '上弦', kana: 'じょうげん', romaji: 'jōgen', significato: 'corda superiore' },
	{ nome: 'Luna piena', kanji: '望', kana: 'ぼう', romaji: 'bō', significato: 'la luna contemplata' },
	{ nome: 'Ultimo quarto', kanji: '下弦', kana: 'かげん', romaji: 'kagen', significato: 'corda inferiore' }
];

function phaseName(angle: number): string {
	if (angle < 6 || angle >= 354) return 'Luna nuova';
	if (angle < 84) return 'Falce crescente';
	if (angle < 96) return 'Primo quarto';
	if (angle < 174) return 'Gibbosa crescente';
	if (angle < 186) return 'Luna piena';
	if (angle < 264) return 'Gibbosa calante';
	if (angle < 276) return 'Ultimo quarto';
	return 'Falce calante';
}

/** Stato della Luna a mezzogiorno locale del giorno civile. */
export function moonAt(day: DayNumber): MoonState {
	const t = localNoon(day);
	const angle = MoonPhase(t);
	return {
		angle,
		illumination: Illumination(Body.Moon, t).phase_fraction,
		waxing: angle < 180,
		nome: phaseName(angle)
	};
}

/** Fasi principali (quarti) che cadono, in ora locale, nei giorni [fromDay, toDay]. */
export function moonQuartersInDays(fromDay: DayNumber, toDay: DayNumber): MoonQuarterEvent[] {
	const out: MoonQuarterEvent[] = [];
	let mq = SearchMoonQuarter(utcDate(fromDay - 2));
	while (true) {
		const day = localDay(mq.time.date);
		if (day > toDay) break;
		if (day >= fromDay) out.push({ quarter: mq.quarter, ...QUARTERS[mq.quarter], time: mq.time.date, day });
		mq = NextMoonQuarter(mq);
	}
	return out;
}
