import { error } from '@sveltejs/kit';
import { HEXAGRAMS } from '#lib/iching/hexagrams.ts';
import { loadText } from '#lib/iching/text.ts';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => HEXAGRAMS.map((h) => ({ n: String(h.n) }));

export const load: PageLoad = async ({ params }) => {
	const n = Number(params.n);
	const hexagram = HEXAGRAMS[n - 1];
	if (!Number.isInteger(n) || !hexagram) error(404, 'Esagramma inesistente');
	return { hexagram, text: await loadText(n) };
};
