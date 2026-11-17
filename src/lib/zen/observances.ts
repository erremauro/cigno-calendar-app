/**
 * Ricorrenze del calendario Sōtō Zen.
 *
 * Ogni ricorrenza ha (quando esiste) una data lunare tradizionale, che è quella principale,
 * e la data gregoriana con cui oggi viene celebrata in Giappone, che viene segnalata come secondaria.
 * Alcune ricorrenze dipendono invece da eventi astronomici (equinozi, 立春).
 *
 * Il campo `verificare` segnala date da confermare con una fonte Sōtōshū.
 *
 * Date verificate il 2026-11-17 su:
 *  - sotozen.com (Sōtōshū), pagina degli eventi annuali: Kōso gōtan-e 26 gennaio (lunare 2/1),
 *    Ryōso-ki 29 settembre (Dōgen †8/28, Keizan †8/15 lunari), Daruma-ki 5 ottobre, Nehan-e 15 febbraio,
 *    Jōdō-e 8 dicembre, Rōhatsu 1–8 dicembre, Shushō-e 1–3 gennaio, Obon dal 13 al 15/16;
 *  - Università Komazawa e Liceo Komazawa: Keizan nato il 10/8 lunare, celebrato il 21 novembre
 *    (sotozen.com in inglese indica il 23: si segue la fonte giapponese).
 */
import type { DayNumber } from '../calendar/time';
import { ymdFromDay } from '../calendar/time';
import type { LunarDate } from '../calendar/lunisolar';
import { solarTermsInDays } from '../calendar/solarTerms';
import { COMPUTED_FROM } from '../calendar/lunisolar';

export type Category = 'maggiore' | 'memoriale' | 'ritiro' | 'stagionale' | 'mensile';

export interface DateRule {
	mese: number;
	/** 'ultimo' = ultimo giorno del mese lunare (29 o 30) */
	giorno: number | 'ultimo';
	/** durata in giorni (default 1) */
	durata?: number;
}

export interface Observance {
	id: string;
	nome: string;
	kanji: string;
	romaji: string;
	categoria: Category;
	descrizione: string;
	lunare?: DateRule[];
	gregoriana?: DateRule[];
	astronomica?: 'higan-primavera' | 'higan-autunno' | 'setsubun';
	verificare?: string;
}

export const OBSERVANCES: Observance[] = [
	{
		id: 'shusho-e',
		nome: 'Cerimonie del nuovo anno',
		kanji: '修正会',
		romaji: 'Shushō-e',
		categoria: 'maggiore',
		descrizione: 'Cerimonie dei primi tre giorni dell’anno per la pace del mondo.',
		lunare: [{ mese: 1, giorno: 1, durata: 3 }],
		gregoriana: [{ mese: 1, giorno: 1, durata: 3 }]
	},
	{
		id: 'koso-gotan-e',
		nome: 'Nascita di Dōgen',
		kanji: '高祖降誕会',
		romaji: 'Kōso gōtan-e',
		categoria: 'memoriale',
		descrizione: 'Nascita di Eihei Dōgen (1200), fondatore della scuola Sōtō in Giappone.',
		lunare: [{ mese: 1, giorno: 2 }],
		gregoriana: [{ mese: 1, giorno: 26 }]
	},
	{
		id: 'nehan-e',
		nome: 'Parinirvāṇa del Buddha',
		kanji: '涅槃会',
		romaji: 'Nehan-e',
		categoria: 'maggiore',
		descrizione: 'Commemorazione dell’entrata del Buddha nel parinirvāṇa. Uno dei tre grandi anniversari (三仏忌).',
		lunare: [{ mese: 2, giorno: 15 }],
		gregoriana: [{ mese: 2, giorno: 15 }]
	},
	{
		id: 'gotan-e',
		nome: 'Nascita del Buddha',
		kanji: '降誕会',
		romaji: 'Gōtan-e (Hanamatsuri)',
		categoria: 'maggiore',
		descrizione: 'Festa dei fiori: si versa tè dolce (甘茶) sulla statua del Buddha bambino.',
		lunare: [{ mese: 4, giorno: 8 }],
		gregoriana: [{ mese: 4, giorno: 8 }]
	},
	{
		id: 'ge-ango-kessei',
		nome: 'Inizio del ritiro estivo',
		kanji: '夏安居結制',
		romaji: 'Ge-ango kessei',
		categoria: 'ritiro',
		descrizione: 'Inizio dei novanta giorni di pratica intensiva estiva (ango).',
		lunare: [{ mese: 4, giorno: 15 }]
	},
	{
		id: 'ge-ango-gesei',
		nome: 'Fine del ritiro estivo',
		kanji: '夏安居解制',
		romaji: 'Ge-ango gesei',
		categoria: 'ritiro',
		descrizione: 'Conclusione del ritiro estivo.',
		lunare: [{ mese: 7, giorno: 15 }]
	},
	{
		id: 'urabon-e',
		nome: 'Festa degli antenati',
		kanji: '盂蘭盆会',
		romaji: 'Urabon-e (Obon)',
		categoria: 'maggiore',
		descrizione:
			'Si accolgono e si onorano gli spiriti degli antenati; vi si tiene il segaki (施食会). In gran parte del Giappone si celebra ad agosto (月遅れ, «un mese dopo»), a Tokyo e in alcune zone a luglio.',
		lunare: [{ mese: 7, giorno: 13, durata: 4 }],
		gregoriana: [{ mese: 8, giorno: 13, durata: 4 }]
	},
	{
		id: 'taiso-ki',
		nome: 'Anniversario di Keizan',
		kanji: '太祖忌',
		romaji: 'Taiso-ki',
		categoria: 'memoriale',
		descrizione: 'Morte di Keizan Jōkin (1325), secondo patriarca fondatore della scuola Sōtō.',
		lunare: [{ mese: 8, giorno: 15 }]
	},
	{
		id: 'koso-ki',
		nome: 'Anniversario di Dōgen',
		kanji: '高祖忌',
		romaji: 'Kōso-ki (Goshōki)',
		categoria: 'memoriale',
		descrizione: 'Morte di Eihei Dōgen (1253). A Eihei-ji si celebra il Goshōki (御征忌).',
		lunare: [{ mese: 8, giorno: 28 }]
	},
	{
		id: 'ryoso-ki',
		nome: 'Anniversario dei due patriarchi',
		kanji: '両祖忌',
		romaji: 'Ryōso-ki',
		categoria: 'memoriale',
		descrizione:
			'Dōgen (†28 dell’8° mese, 1253) e Keizan (†15 dell’8° mese, 1325) vengono commemorati insieme: nel calendario gregoriano entrambe le date cadono il 29 settembre.',
		gregoriana: [{ mese: 9, giorno: 29 }]
	},
	{
		id: 'daruma-ki',
		nome: 'Anniversario di Bodhidharma',
		kanji: '達磨忌',
		romaji: 'Daruma-ki',
		categoria: 'memoriale',
		descrizione: 'Commemorazione di Bodhidharma, primo patriarca dello Zen in Cina.',
		lunare: [{ mese: 10, giorno: 5 }],
		gregoriana: [{ mese: 10, giorno: 5 }]
	},
	{
		id: 'taiso-gotan-e',
		nome: 'Nascita di Keizan',
		kanji: '太祖降誕会',
		romaji: 'Taiso gōtan-e',
		categoria: 'memoriale',
		descrizione: 'Nascita di Keizan Jōkin (1264, secondo altre fonti 1268).',
		lunare: [{ mese: 10, giorno: 8 }],
		gregoriana: [{ mese: 11, giorno: 21 }]
	},
	{
		id: 'fuyu-ango-kessei',
		nome: 'Inizio del ritiro invernale',
		kanji: '冬安居結制',
		romaji: 'Fuyu-ango kessei',
		categoria: 'ritiro',
		descrizione: 'Inizio dei novanta giorni di pratica intensiva invernale.',
		lunare: [{ mese: 10, giorno: 15 }]
	},
	{
		id: 'fuyu-ango-gesei',
		nome: 'Fine del ritiro invernale',
		kanji: '冬安居解制',
		romaji: 'Fuyu-ango gesei',
		categoria: 'ritiro',
		descrizione: 'Conclusione del ritiro invernale.',
		lunare: [{ mese: 1, giorno: 15 }]
	},
	{
		id: 'rohatsu-sesshin',
		nome: 'Sesshin di Rōhatsu',
		kanji: '臘八接心',
		romaji: 'Rōhatsu sesshin',
		categoria: 'ritiro',
		descrizione: 'Sette giorni di zazen intensivo che culminano nella notte del risveglio del Buddha.',
		lunare: [{ mese: 12, giorno: 1, durata: 8 }],
		gregoriana: [{ mese: 12, giorno: 1, durata: 8 }]
	},
	{
		id: 'jodo-e',
		nome: 'Risveglio del Buddha',
		kanji: '成道会',
		romaji: 'Jōdō-e',
		categoria: 'maggiore',
		descrizione: 'Il Buddha si risveglia vedendo la stella del mattino. Uno dei tre grandi anniversari (三仏忌).',
		lunare: [{ mese: 12, giorno: 8 }],
		gregoriana: [{ mese: 12, giorno: 8 }]
	},
	{
		id: 'joya',
		nome: 'Ultima notte dell’anno',
		kanji: '除夜',
		romaji: 'Joya',
		categoria: 'maggiore',
		descrizione: 'Si suona la campana 108 volte (除夜の鐘).',
		lunare: [{ mese: 12, giorno: 'ultimo' }],
		gregoriana: [{ mese: 12, giorno: 31 }]
	},
	{
		id: 'setsubun',
		nome: 'Setsubun',
		kanji: '節分',
		romaji: 'Setsubun',
		categoria: 'stagionale',
		descrizione: 'Vigilia di 立春, passaggio tra inverno e primavera.',
		astronomica: 'setsubun'
	},
	{
		id: 'higan-primavera',
		nome: 'Higan di primavera',
		kanji: '春彼岸会',
		romaji: 'Haru higan-e',
		categoria: 'stagionale',
		descrizione: 'Settimana centrata sull’equinozio: l’“altra riva”, dedicata alla pratica e alla memoria dei defunti.',
		astronomica: 'higan-primavera'
	},
	{
		id: 'higan-autunno',
		nome: 'Higan d’autunno',
		kanji: '秋彼岸会',
		romaji: 'Aki higan-e',
		categoria: 'stagionale',
		descrizione: 'Settimana centrata sull’equinozio d’autunno.',
		astronomica: 'higan-autunno'
	},
	{
		id: 'shukushin',
		nome: 'Shukushin',
		kanji: '祝聖',
		romaji: 'Shukushin',
		categoria: 'mensile',
		descrizione: 'Cerimonia del primo e del quindicesimo giorno del mese lunare.',
		lunare: [
			{ mese: 0, giorno: 1 },
			{ mese: 0, giorno: 15 }
		]
	},
	{
		id: 'fusatsu',
		nome: 'Ryaku fusatsu',
		kanji: '略布薩',
		romaji: 'Ryaku fusatsu',
		categoria: 'mensile',
		descrizione: 'Cerimonia di pentimento e rinnovo dei precetti, a luna piena e a luna nuova (uposatha).',
		lunare: [
			{ mese: 0, giorno: 15 },
			{ mese: 0, giorno: 'ultimo' }
		]
	}
];

export type MatchKind = 'lunare' | 'gregoriana' | 'astronomica';

export interface ObservanceMatch {
	observance: Observance;
	kind: MatchKind;
	/** giorno N di una ricorrenza che dura più giorni (1-based) */
	giorno: number;
	durata: number;
}

function matchRule(rule: DateRule, month: number, day: number, monthLength: number): number | null {
	if (rule.mese !== 0 && rule.mese !== month) return null;
	const start = rule.giorno === 'ultimo' ? monthLength : rule.giorno;
	const offset = day - start;
	const durata = rule.durata ?? 1;
	return offset >= 0 && offset < durata ? offset + 1 : null;
}

const GREG_MONTH_LENGTH = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

/** Ricorrenze che cadono nella data civile `day`. */
export function observancesOn(day: DayNumber, lunar: LunarDate): ObservanceMatch[] {
	const out: ObservanceMatch[] = [];
	const { y, m, d } = ymdFromDay(day);

	for (const o of OBSERVANCES) {
		if (o.lunare && !lunar.leap) {
			for (const r of o.lunare) {
				const g = matchRule(r, lunar.month, lunar.day, lunar.monthInfo.length);
				if (g) out.push({ observance: o, kind: 'lunare', giorno: g, durata: r.durata ?? 1 });
			}
		}
		// prima del 1873 il Giappone non usava il calendario gregoriano: niente date gregoriane
		if (o.gregoriana && day >= COMPUTED_FROM) {
			for (const r of o.gregoriana) {
				const g = matchRule(r, m, d, GREG_MONTH_LENGTH(y, m));
				if (g) out.push({ observance: o, kind: 'gregoriana', giorno: g, durata: r.durata ?? 1 });
			}
		}
		if (o.astronomica) {
			const match = matchAstronomical(o.astronomica, day);
			if (match) out.push({ observance: o, kind: 'astronomica', ...match });
		}
	}
	const order: Record<MatchKind, number> = { lunare: 0, astronomica: 1, gregoriana: 2 };
	return out.sort((a, b) => order[a.kind] - order[b.kind]);
}

function matchAstronomical(rule: NonNullable<Observance['astronomica']>, day: DayNumber) {
	const terms = solarTermsInDays(day - 4, day + 4);
	if (rule === 'setsubun') {
		const risshun = terms.find((t) => t.info.kanji === '立春');
		return risshun && risshun.day - 1 === day ? { giorno: 1, durata: 1 } : null;
	}
	const kanji = rule === 'higan-primavera' ? '春分' : '秋分';
	const eq = terms.find((t) => t.info.kanji === kanji);
	if (!eq) return null;
	const offset = day - (eq.day - 3);
	return offset >= 0 && offset < 7 ? { giorno: offset + 1, durata: 7 } : null;
}
