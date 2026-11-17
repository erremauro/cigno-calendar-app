/**
 * Collegamenti tra I Ching e calendario.
 *
 * 1. I dodici esagrammi sovrani (十二消息卦 / 辟卦): uno per mese lunare, descrivono
 *    la crescita e la decrescita dello yang nel corso dell'anno.
 *    L'11° mese, quello del solstizio d'inverno, è 復 (il ritorno: una sola linea yang alla base).
 *
 * 2. Il sistema guaqi (卦氣) attribuito a Meng Xi e Jing Fang (dinastia Han), nella forma
 *    tramandata dal calendario Dayan (大衍暦, 729) dei Tang:
 *    - i quattro esagrammi "angolari" 坎 離 震 兌 governano le quattro stagioni;
 *      ciascuna delle loro 24 linee governa uno dei 24 termini solari;
 *    - gli altri 60 esagrammi sono distribuiti sulle 72 pentadi, cinque per mese
 *      con i ranghi 公 (duca), 辟 (sovrano), 侯 (principe), 大夫 (ministro), 卿 (dignitario);
 *      l'esagramma 侯 copre due pentadi (parte interna 内 e parte esterna 外).
 */
import { hexagramByKanji, type Hexagram } from './hexagrams';
import { pentadAt, type PentadPosition } from '../calendar/solarTerms';
import type { DayNumber } from '../calendar/time';

/** Esagramma sovrano per numero di mese lunare (1–12). */
const SOVEREIGN_BY_MONTH: Record<number, string> = {
	11: '復',
	12: '臨',
	1: '泰',
	2: '大壯',
	3: '夬',
	4: '乾',
	5: '姤',
	6: '遯',
	7: '否',
	8: '觀',
	9: '剝',
	10: '坤'
};

export function sovereignHexagram(lunarMonth: number): Hexagram {
	return hexagramByKanji(SOVEREIGN_BY_MONTH[lunarMonth]);
}

export const RANKS = {
	公: 'duca',
	辟: 'sovrano',
	侯: 'principe',
	大夫: 'ministro',
	卿: 'dignitario'
} as const;
export type Rank = keyof typeof RANKS;

/** Letture giapponesi dei ranghi. */
export const RANK_ROMAJI: Record<Rank, string> = { 公: 'kō', 辟: 'heki', 侯: 'kō', 大夫: 'taifu', 卿: 'kei' };

interface PentadHexagram {
	kanji: string;
	rank: Rank;
	/** per gli esagrammi 侯: 'interno' nella prima pentade, 'esterno' nella seconda */
	parte?: 'interno' | 'esterno';
}

/**
 * Le 72 pentadi a partire dal solstizio d'inverno (longitudine 270°), in ordine.
 * Ogni terna corrisponde a un termine solare.
 */
const GUAQI_SEQUENCE: [string, Rank, ('interno' | 'esterno')?][] = [
	// 冬至
	['中孚', '公'], ['復', '辟'], ['屯', '侯', 'interno'],
	// 小寒
	['屯', '侯', 'esterno'], ['謙', '大夫'], ['睽', '卿'],
	// 大寒
	['升', '公'], ['臨', '辟'], ['小過', '侯', 'interno'],
	// 立春
	['小過', '侯', 'esterno'], ['蒙', '大夫'], ['益', '卿'],
	// 雨水
	['漸', '公'], ['泰', '辟'], ['需', '侯', 'interno'],
	// 啓蟄
	['需', '侯', 'esterno'], ['隨', '大夫'], ['晉', '卿'],
	// 春分
	['解', '公'], ['大壯', '辟'], ['豫', '侯', 'interno'],
	// 清明
	['豫', '侯', 'esterno'], ['訟', '大夫'], ['蠱', '卿'],
	// 穀雨
	['革', '公'], ['夬', '辟'], ['旅', '侯', 'interno'],
	// 立夏
	['旅', '侯', 'esterno'], ['師', '大夫'], ['比', '卿'],
	// 小満
	['小畜', '公'], ['乾', '辟'], ['大有', '侯', 'interno'],
	// 芒種
	['大有', '侯', 'esterno'], ['家人', '大夫'], ['井', '卿'],
	// 夏至
	['咸', '公'], ['姤', '辟'], ['鼎', '侯', 'interno'],
	// 小暑
	['鼎', '侯', 'esterno'], ['豐', '大夫'], ['渙', '卿'],
	// 大暑
	['履', '公'], ['遯', '辟'], ['恆', '侯', 'interno'],
	// 立秋
	['恆', '侯', 'esterno'], ['節', '大夫'], ['同人', '卿'],
	// 処暑
	['損', '公'], ['否', '辟'], ['巽', '侯', 'interno'],
	// 白露
	['巽', '侯', 'esterno'], ['萃', '大夫'], ['大畜', '卿'],
	// 秋分
	['賁', '公'], ['觀', '辟'], ['歸妹', '侯', 'interno'],
	// 寒露
	['歸妹', '侯', 'esterno'], ['無妄', '大夫'], ['明夷', '卿'],
	// 霜降
	['困', '公'], ['剝', '辟'], ['艮', '侯', 'interno'],
	// 立冬
	['艮', '侯', 'esterno'], ['既濟', '大夫'], ['噬嗑', '卿'],
	// 小雪
	['大過', '公'], ['坤', '辟'], ['未濟', '侯', 'interno'],
	// 大雪
	['未濟', '侯', 'esterno'], ['蹇', '大夫'], ['頤', '卿']
];

export const GUAQI: PentadHexagram[] = GUAQI_SEQUENCE.map(([kanji, rank, parte]) => ({ kanji, rank, parte }));

/** Esagrammi angolari: ciascuno governa una stagione, a partire dal termine indicato. */
export const CORNER_HEXAGRAMS = [
	{ kanji: '坎', stagione: 'inverno', direzione: 'nord', fromLongitude: 270 },
	{ kanji: '震', stagione: 'primavera', direzione: 'est', fromLongitude: 0 },
	{ kanji: '離', stagione: 'estate', direzione: 'sud', fromLongitude: 90 },
	{ kanji: '兌', stagione: 'autunno', direzione: 'ovest', fromLongitude: 180 }
];

export interface GuaqiDay {
	pentad: PentadPosition;
	/** indice 0–71 dal solstizio d'inverno */
	pentadIndex: number;
	hexagram: Hexagram;
	rank: Rank;
	parte?: 'interno' | 'esterno';
	/** esagramma angolare della stagione e linea (1–6) che governa il termine solare in corso */
	corner: { hexagram: Hexagram; stagione: string; direzione: string; line: number };
}

export function guaqiForPentadLongitude(longitude: number): PentadHexagram & { pentadIndex: number } {
	const pentadIndex = (((longitude - 270) % 360) + 360) % 360 / 5;
	return { ...GUAQI[pentadIndex], pentadIndex };
}

export function guaqiAt(day: DayNumber): GuaqiDay {
	const pentad = pentadAt(day);
	const g = guaqiForPentadLongitude(pentad.longitude);
	const termLon = pentad.termIndex * 15;
	const corner = CORNER_HEXAGRAMS.findLast(
		(c) => ((((termLon - 270) % 360) + 360) % 360) >= ((((c.fromLongitude - 270) % 360) + 360) % 360)
	)!;
	const line = (((((termLon - corner.fromLongitude) % 360) + 360) % 360) / 15) + 1;
	return {
		pentad,
		pentadIndex: g.pentadIndex,
		hexagram: hexagramByKanji(g.kanji),
		rank: g.rank,
		parte: g.parte,
		corner: { hexagram: hexagramByKanji(corner.kanji), stagione: corner.stagione, direzione: corner.direzione, line }
	};
}

export interface CalendarRole {
	/** mese lunare di cui è sovrano */
	sovereignMonth?: number;
	/** pentadi governate nel sistema guaqi */
	pentads: { longitude: number; termIndex: number; pentad: number; rank: Rank; parte?: 'interno' | 'esterno' }[];
	/** stagione governata, se è un esagramma angolare */
	corner?: (typeof CORNER_HEXAGRAMS)[number];
}

/** In che modo un esagramma compare nel calendario. */
export function calendarRole(h: Hexagram): CalendarRole {
	const month = Object.entries(SOVEREIGN_BY_MONTH).find(([, k]) => k === h.kanji)?.[0];
	const pentads = GUAQI.flatMap((g, i) => {
		if (g.kanji !== h.kanji) return [];
		const longitude = (270 + i * 5) % 360;
		const termLon = Math.floor(longitude / 15) * 15;
		return [{ longitude, termIndex: termLon / 15, pentad: (longitude - termLon) / 5, rank: g.rank, parte: g.parte }];
	});
	return {
		sovereignMonth: month ? Number(month) : undefined,
		pentads,
		corner: CORNER_HEXAGRAMS.find((c) => c.kanji === h.kanji)
	};
}
