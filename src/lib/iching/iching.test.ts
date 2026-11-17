import { describe, expect, it } from 'vitest';
import { HEXAGRAMS, hexagramByKanji } from './hexagrams';
import { GUAQI, CORNER_HEXAGRAMS, sovereignHexagram, guaqiAt } from './seasonal';
import { dayFromYMD } from '../calendar/time';

describe('esagrammi', () => {
	it('sono 64 con figure tutte diverse', () => {
		expect(HEXAGRAMS).toHaveLength(64);
		expect(new Set(HEXAGRAMS.map((h) => h.lines.join(''))).size).toBe(64);
		expect(new Set(HEXAGRAMS.map((h) => h.kanji)).size).toBe(64);
	});

	it('i sovrani mostrano la crescita e la decrescita dello yang', () => {
		const expected: Record<number, string> = {
			11: '100000',
			12: '110000',
			1: '111000',
			2: '111100',
			3: '111110',
			4: '111111',
			5: '011111',
			6: '001111',
			7: '000111',
			8: '000011',
			9: '000001',
			10: '000000'
		};
		for (const [m, lines] of Object.entries(expected)) {
			expect(sovereignHexagram(Number(m)).lines.join('')).toBe(lines);
		}
	});
});

describe('guaqi', () => {
	it('72 pentadi, 60 esagrammi diversi più i 4 angolari = 64', () => {
		expect(GUAQI).toHaveLength(72);
		const used = new Set(GUAQI.map((g) => g.kanji));
		expect(used.size).toBe(60);
		for (const c of CORNER_HEXAGRAMS) expect(used.has(c.kanji)).toBe(false);
		for (const h of HEXAGRAMS) expect(used.has(h.kanji) || CORNER_HEXAGRAMS.some((c) => c.kanji === h.kanji)).toBe(true);
	});

	it('ogni 辟 è il sovrano del termine principale in cui cade', () => {
		const sovereigns = GUAQI.filter((g) => g.rank === '辟').map((g) => g.kanji);
		expect(sovereigns).toEqual(['復', '臨', '泰', '大壯', '夬', '乾', '姤', '遯', '否', '觀', '剝', '坤']);
	});

	it('i 侯 coprono due pentadi consecutive', () => {
		GUAQI.forEach((g, i) => {
			if (g.parte === 'interno') expect(GUAQI[i + 1].kanji).toBe(g.kanji);
		});
	});

	it('al solstizio d’inverno: 中孚 e la prima linea di 坎', () => {
		const g = guaqiAt(dayFromYMD(2026, 12, 22));
		expect(g.hexagram).toBe(hexagramByKanji('中孚'));
		expect(g.corner.hexagram.kanji).toBe('坎');
		expect(g.corner.line).toBe(1);
	});

	it('a metà novembre 2026 (立冬): linea 4 di 兌', () => {
		const g = guaqiAt(dayFromYMD(2026, 11, 17));
		expect(g.corner.hexagram.kanji).toBe('兌');
		expect(g.corner.line).toBe(4);
	});
});

describe('testo importato', async () => {
	const { hasText, loadText } = await import('./text');
	it.runIf(hasText())('le linee "nove/sei" coincidono con le figure', async () => {
		for (const h of HEXAGRAMS) {
			const t = (await loadText(h.n))!;
			const six = t.linee.slice(0, 6);
			expect(six.map((l) => (/^Nove/.test(l.etichetta) ? 1 : /^Sei/.test(l.etichetta) ? 0 : -1))).toEqual(h.lines);
			expect(t.sentenza.length).toBeGreaterThan(0);
			expect(t.immagine.length).toBeGreaterThan(0);
		}
	});
});

describe('consultazione', async () => {
	const { hexagramFromLines, hexagramFromTrigrams, hexagram } = await import('./hexagrams');
	it('il 56 con il nove al quarto posto mobile diventa il 52', () => {
		const lines = [...hexagram(56).lines];
		expect(lines[3]).toBe(1);
		lines[3] = 0;
		expect(hexagramFromLines(lines).n).toBe(52);
	});
	it('tavola dei trigrammi', () => {
		expect(hexagramFromTrigrams('zhen', 'kan').n).toBe(3);
		expect(hexagramFromTrigrams('qian', 'kun').n).toBe(11);
	});
});
