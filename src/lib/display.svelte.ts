/**
 * Modalità di visualizzazione del calendario:
 *  - italiano puro (predefinita);
 *  - «nomi giapponesi»: accanto all'italiano compaiono i nomi giapponesi,
 *    sempre nella forma  kanji (romaji) · italiano.
 * La scelta resta memorizzata sul dispositivo.
 */
const KEY = 'nomi-giapponesi';

function saved(): boolean {
	try {
		return localStorage.getItem(KEY) === '1';
	} catch {
		return false;
	}
}

export const display = $state<{ mixed: boolean }>({
	mixed: typeof window === 'undefined' ? false : saved()
});

export function setMixed(value: boolean) {
	display.mixed = value;
	try {
		localStorage.setItem(KEY, value ? '1' : '0');
	} catch {}
}

/** «rittō» → «Rittō» */
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
