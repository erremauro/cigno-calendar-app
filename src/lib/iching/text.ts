/**
 * Testo dell'I Ching importato da scripts/import_iching.py in ./testo/ (cartella esclusa da git).
 * Se il testo non è presente l'app funziona lo stesso, con i titoli provvisori.
 */

export interface HexagramLine {
	etichetta: string;
	/** ○ signore reggente, □ signore costitutivo del segno */
	signori: ('reggente' | 'costitutivo')[];
	testo: string[];
}

export interface HexagramText {
	n: number;
	romanizzazione: string;
	titolo: string;
	sentenza: string[];
	immagine: string[];
	/** sei linee dal basso, più eventualmente "Quando compaiono tutti nove/sei" */
	linee: HexagramLine[];
	/** HTML del Libro primo (generato dallo script, contenuto escapato) */
	testo: string;
	/** HTML del Libro terzo: i commenti */
	commenti: string;
	note: { id: string; n: string; html: string }[];
}

export interface TitleInfo {
	romanizzazione: string;
	titolo: string;
	titoloBreve: string;
}

const titleModules = import.meta.glob<Record<string, TitleInfo>>('./testo/titoli.json', {
	eager: true,
	import: 'default'
});
const textModules = import.meta.glob<HexagramText>('./testo/[0-9][0-9].json', { import: 'default' });

export const TITLES: Record<string, TitleInfo> | null = titleModules['./testo/titoli.json'] ?? null;

export const hasText = () => Object.keys(textModules).length === 64;

const cache = new Map<number, Promise<HexagramText | null>>();

export function loadText(n: number): Promise<HexagramText | null> {
	let p = cache.get(n);
	if (!p) {
		const loader = textModules[`./testo/${String(n).padStart(2, '0')}.json`];
		p = loader ? loader() : Promise.resolve(null);
		cache.set(n, p);
	}
	return p;
}
