/**
 * Ciclo sessagesimale (干支, eto): tronchi celesti e rami terrestri.
 */
import type { DayNumber } from './time';

export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
export const ANIMALS = [
	'Topo',
	'Bue',
	'Tigre',
	'Coniglio',
	'Drago',
	'Serpente',
	'Cavallo',
	'Capra',
	'Scimmia',
	'Gallo',
	'Cane',
	'Cinghiale'
];
export const ELEMENTS = ['Legno', 'Fuoco', 'Terra', 'Metallo', 'Acqua'];

/** Letture giapponesi (訓読み) dei tronchi e dei rami. */
export const STEM_READINGS = ['kinoe', 'kinoto', 'hinoe', 'hinoto', 'tsuchinoe', 'tsuchinoto', 'kanoe', 'kanoto', 'mizunoe', 'mizunoto'];
export const BRANCH_READINGS = ['ne', 'ushi', 'tora', 'u', 'tatsu', 'mi', 'uma', 'hitsuji', 'saru', 'tori', 'inu', 'i'];
const STEM_KANA = ['きのえ', 'きのと', 'ひのえ', 'ひのと', 'つちのえ', 'つちのと', 'かのえ', 'かのと', 'みずのえ', 'みずのと'];
const BRANCH_KANA = ['ね', 'うし', 'とら', 'う', 'たつ', 'み', 'うま', 'ひつじ', 'さる', 'とり', 'いぬ', 'い'];

export interface MonthName {
	kanji: string;
	romaji: string;
	/** lettura in hiragana */
	kana: string;
	/** traduzione breve */
	significato: string;
	/** spiegazione del nome */
	nota: string;
}

/** Nomi tradizionali giapponesi dei mesi lunari (和風月名, wafū getsumei), indice 0 = 1° mese. */
export const MONTH_NAMES_JA: MonthName[] = [
	{ kanji: '睦月', romaji: 'Mutsuki', kana: 'むつき', significato: 'mese dell’armonia', nota: 'Le famiglie si riuniscono per il nuovo anno.' },
	{ kanji: '如月', romaji: 'Kisaragi', kana: 'きさらぎ', significato: 'mese delle vesti aggiunte', nota: 'Fa ancora freddo e ci si copre con più strati (衣更着).' },
	{ kanji: '弥生', romaji: 'Yayoi', kana: 'やよい', significato: 'mese della crescita', nota: 'Le piante crescono sempre più rigogliose.' },
	{ kanji: '卯月', romaji: 'Uzuki', kana: 'うづき', significato: 'mese dei fiori di deutzia', nota: 'Fioriscono gli unohana (卯の花).' },
	{ kanji: '皐月', romaji: 'Satsuki', kana: 'さつき', significato: 'mese del trapianto del riso', nota: 'Si trapiantano le piantine nelle risaie.' },
	{ kanji: '水無月', romaji: 'Minazuki', kana: 'みなづき', significato: 'mese dell’acqua', nota: 'Si allagano le risaie: 無 qui non è «senza» ma rende il suono na, «di».' },
	{ kanji: '文月', romaji: 'Fumizuki', kana: 'ふみづき', significato: 'mese delle lettere', nota: 'Si scrivono poesie per la festa di Tanabata.' },
	{ kanji: '葉月', romaji: 'Hazuki', kana: 'はづき', significato: 'mese delle foglie', nota: 'Le foglie cominciano a cadere.' },
	{ kanji: '長月', romaji: 'Nagatsuki', kana: 'ながつき', significato: 'mese delle notti lunghe', nota: 'Le notti si allungano.' },
	{ kanji: '神無月', romaji: 'Kannazuki', kana: 'かんなづき', significato: 'mese degli dèi', nota: 'Secondo la tradizione i kami si riuniscono a Izumo e lasciano il resto del Giappone.' },
	{ kanji: '霜月', romaji: 'Shimotsuki', kana: 'しもつき', significato: 'mese della brina', nota: 'Arrivano le prime brinate.' },
	{ kanji: '師走', romaji: 'Shiwasu', kana: 'しわす', significato: 'mese in cui i maestri corrono', nota: 'Anche i monaci sono indaffarati a fine anno.' }
];

export interface Sexagenary {
	/** 0–59, 0 = 甲子 */
	index: number;
	stem: string;
	branch: string;
	kanji: string;
	/** lettura giapponese, es. hinoe-uma */
	reading: string;
	/** lettura in hiragana, es. ひのえうま */
	kana: string;
	animal: string;
	element: string;
	yang: boolean;
}

export function sexagenary(index: number): Sexagenary {
	const i = ((index % 60) + 60) % 60;
	const s = i % 10;
	const b = i % 12;
	return {
		index: i,
		stem: STEMS[s],
		branch: BRANCHES[b],
		kanji: STEMS[s] + BRANCHES[b],
		reading: `${STEM_READINGS[s]}-${BRANCH_READINGS[b]}`,
		kana: STEM_KANA[s] + BRANCH_KANA[b],
		animal: ANIMALS[b],
		element: ELEMENTS[Math.floor(s / 2)],
		yang: s % 2 === 0
	};
}

/** Anno lunare → ciclo (1984 = 甲子). */
export function yearSexagenary(lunarYear: number): Sexagenary {
	return sexagenary(lunarYear - 4);
}

/** Giorno civile → ciclo (1970-01-01 = 辛巳, indice 17). */
export function daySexagenary(day: DayNumber): Sexagenary {
	return sexagenary(day + 17);
}

/** Ramo del mese lunare: l'11° mese è 子, il 1° mese è 寅. */
export function monthBranch(month: number): string {
	return BRANCHES[(month + 1) % 12];
}
