/**
 * I 64 esagrammi nella sequenza di re Wen.
 * Le linee sono date dal basso verso l'alto (1 = yang, linea intera; 0 = yin, linea spezzata).
 *
 * I titoli vengono dal testo importato (Wilhelm, ed. Adelphi) quando è presente;
 * altrimenti si usano quelli provvisori qui sotto.
 */
import { TITLES } from './text';

export type Trigram = 'qian' | 'dui' | 'li' | 'zhen' | 'xun' | 'kan' | 'gen' | 'kun';

export const TRIGRAMS: Record<Trigram, { lines: [number, number, number]; kanji: string; nome: string; immagine: string }> = {
	qian: { lines: [1, 1, 1], kanji: '乾', nome: 'Il Creativo', immagine: 'cielo' },
	dui: { lines: [1, 1, 0], kanji: '兌', nome: 'Il Sereno', immagine: 'lago' },
	li: { lines: [1, 0, 1], kanji: '離', nome: 'L’Aderente', immagine: 'fuoco' },
	zhen: { lines: [1, 0, 0], kanji: '震', nome: 'L’Eccitante', immagine: 'tuono' },
	xun: { lines: [0, 1, 1], kanji: '巽', nome: 'Il Mite', immagine: 'vento, legno' },
	kan: { lines: [0, 1, 0], kanji: '坎', nome: 'L’Abissale', immagine: 'acqua' },
	gen: { lines: [0, 0, 1], kanji: '艮', nome: 'L’Arresto', immagine: 'monte' },
	kun: { lines: [0, 0, 0], kanji: '坤', nome: 'Il Ricettivo', immagine: 'terra' }
};

export interface Hexagram {
	/** numero nella sequenza di re Wen, 1–64 */
	n: number;
	kanji: string;
	pinyin: string;
	/** titolo breve, senza le varianti tra parentesi */
	titolo: string;
	/** titolo completo, es. «L'Abissale (l'Acqua)» */
	titoloCompleto: string;
	/** romanizzazione Wade-Giles usata da Wilhelm */
	romanizzazione?: string;
	upper: Trigram;
	lower: Trigram;
	/** sei linee dal basso verso l'alto */
	lines: number[];
}

type Row = [string, string, string, Trigram, Trigram];

// [kanji, pinyin, titolo, trigramma superiore, trigramma inferiore]
const ROWS: Row[] = [
	['乾', 'Qián', 'Il Creativo', 'qian', 'qian'],
	['坤', 'Kūn', 'Il Ricettivo', 'kun', 'kun'],
	['屯', 'Zhūn', 'La difficoltà iniziale', 'kan', 'zhen'],
	['蒙', 'Méng', 'La stoltezza giovanile', 'gen', 'kan'],
	['需', 'Xū', 'L’attesa', 'kan', 'qian'],
	['訟', 'Sòng', 'Il conflitto', 'qian', 'kan'],
	['師', 'Shī', 'L’esercito', 'kun', 'kan'],
	['比', 'Bǐ', 'Il tenersi uniti', 'kan', 'kun'],
	['小畜', 'Xiǎo Chù', 'La forza domatrice del piccolo', 'xun', 'qian'],
	['履', 'Lǚ', 'Il procedere', 'qian', 'dui'],
	['泰', 'Tài', 'La pace', 'kun', 'qian'],
	['否', 'Pǐ', 'Il ristagno', 'qian', 'kun'],
	['同人', 'Tóng Rén', 'Comunità con gli uomini', 'qian', 'li'],
	['大有', 'Dà Yǒu', 'Il possesso grande', 'li', 'qian'],
	['謙', 'Qiān', 'L’umiltà', 'kun', 'gen'],
	['豫', 'Yù', 'L’entusiasmo', 'zhen', 'kun'],
	['隨', 'Suí', 'Il seguire', 'dui', 'zhen'],
	['蠱', 'Gǔ', 'Il lavoro su ciò che è guasto', 'gen', 'xun'],
	['臨', 'Lín', 'L’avvicinamento', 'kun', 'dui'],
	['觀', 'Guān', 'La contemplazione', 'xun', 'kun'],
	['噬嗑', 'Shì Kè', 'Il morso che spezza', 'li', 'zhen'],
	['賁', 'Bì', 'La leggiadria', 'gen', 'li'],
	['剝', 'Bō', 'Lo sgretolamento', 'gen', 'kun'],
	['復', 'Fù', 'Il ritorno', 'kun', 'zhen'],
	['無妄', 'Wú Wàng', 'L’innocenza', 'qian', 'zhen'],
	['大畜', 'Dà Chù', 'La forza domatrice del grande', 'gen', 'qian'],
	['頤', 'Yí', 'Gli angoli della bocca', 'gen', 'zhen'],
	['大過', 'Dà Guò', 'La preponderanza del grande', 'dui', 'xun'],
	['坎', 'Kǎn', 'L’abissale', 'kan', 'kan'],
	['離', 'Lí', 'L’aderente', 'li', 'li'],
	['咸', 'Xián', 'L’influsso', 'dui', 'gen'],
	['恆', 'Héng', 'La durata', 'zhen', 'xun'],
	['遯', 'Dùn', 'La ritirata', 'qian', 'gen'],
	['大壯', 'Dà Zhuàng', 'La potenza del grande', 'zhen', 'qian'],
	['晉', 'Jìn', 'Il progresso', 'li', 'kun'],
	['明夷', 'Míng Yí', 'L’ottenebramento della luce', 'kun', 'li'],
	['家人', 'Jiā Rén', 'La famiglia', 'xun', 'li'],
	['睽', 'Kuí', 'L’opposizione', 'li', 'dui'],
	['蹇', 'Jiǎn', 'L’impedimento', 'kan', 'gen'],
	['解', 'Xiè', 'La liberazione', 'zhen', 'kan'],
	['損', 'Sǔn', 'La diminuzione', 'gen', 'dui'],
	['益', 'Yì', 'L’accrescimento', 'xun', 'zhen'],
	['夬', 'Guài', 'Lo straripamento', 'dui', 'qian'],
	['姤', 'Gòu', 'Il farsi incontro', 'qian', 'xun'],
	['萃', 'Cuì', 'La raccolta', 'dui', 'kun'],
	['升', 'Shēng', 'L’ascendere', 'kun', 'xun'],
	['困', 'Kùn', 'L’angustia', 'dui', 'kan'],
	['井', 'Jǐng', 'Il pozzo', 'kan', 'xun'],
	['革', 'Gé', 'Il sovvertimento', 'dui', 'li'],
	['鼎', 'Dǐng', 'Il crogiolo', 'li', 'xun'],
	['震', 'Zhèn', 'L’eccitante', 'zhen', 'zhen'],
	['艮', 'Gèn', 'L’arresto', 'gen', 'gen'],
	['漸', 'Jiàn', 'Lo sviluppo', 'xun', 'gen'],
	['歸妹', 'Guī Mèi', 'La ragazza che si sposa', 'zhen', 'dui'],
	['豐', 'Fēng', 'La pienezza', 'zhen', 'li'],
	['旅', 'Lǚ', 'Il viandante', 'li', 'gen'],
	['巽', 'Xùn', 'Il mite', 'xun', 'xun'],
	['兌', 'Duì', 'Il sereno', 'dui', 'dui'],
	['渙', 'Huàn', 'La dissoluzione', 'xun', 'kan'],
	['節', 'Jié', 'La limitazione', 'kan', 'dui'],
	['中孚', 'Zhōng Fú', 'La verità interiore', 'xun', 'dui'],
	['小過', 'Xiǎo Guò', 'La preponderanza del piccolo', 'zhen', 'gen'],
	['既濟', 'Jì Jì', 'Dopo il compimento', 'kan', 'li'],
	['未濟', 'Wèi Jì', 'Prima del compimento', 'li', 'kan']
];

export const HEXAGRAMS: Hexagram[] = ROWS.map(([kanji, pinyin, titolo, upper, lower], i) => ({
	n: i + 1,
	kanji,
	pinyin,
	titolo: TITLES?.[i + 1]?.titoloBreve ?? titolo,
	titoloCompleto: TITLES?.[i + 1]?.titolo ?? titolo,
	romanizzazione: TITLES?.[i + 1]?.romanizzazione,
	upper,
	lower,
	lines: [...TRIGRAMS[lower].lines, ...TRIGRAMS[upper].lines]
}));

export function hexagram(n: number): Hexagram {
	const h = HEXAGRAMS[n - 1];
	if (!h) throw new Error(`Esagramma ${n} inesistente`);
	return h;
}

export function hexagramByKanji(kanji: string): Hexagram {
	const h = HEXAGRAMS.find((x) => x.kanji === kanji);
	if (!h) throw new Error(`Esagramma ${kanji} inesistente`);
	return h;
}

/** Esagramma corrispondente a sei linee (dal basso; 1 = yang, 0 = yin). */
export function hexagramFromLines(lines: number[]): Hexagram {
	const key = lines.join('');
	const h = HEXAGRAMS.find((x) => x.lines.join('') === key);
	if (!h) throw new Error(`Linee non valide: ${key}`);
	return h;
}

/** Esagramma formato da un trigramma inferiore e uno superiore. */
export function hexagramFromTrigrams(lower: Trigram, upper: Trigram): Hexagram {
	return hexagramFromLines([...TRIGRAMS[lower].lines, ...TRIGRAMS[upper].lines]);
}
