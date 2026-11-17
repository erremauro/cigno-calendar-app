/**
 * Tema chiaro/scuro come su cignozen.it:
 *  - chiaro dalle 7:00 alle 17:59, scuro nelle altre ore;
 *  - il pulsante imposta una scelta manuale che vale fino a mezzanotte.
 * La stessa logica è ripetuta nello script iniziale di app.html (per evitare lampi di colore).
 */
export type Theme = 'light' | 'dark';

const OVERRIDE_KEY = 'cz-theme-override';

export function scheduledTheme(date = new Date()): Theme {
	const h = date.getHours();
	return h >= 7 && h < 18 ? 'light' : 'dark';
}

export function readOverride(now = Date.now()): Theme | null {
	try {
		const raw = localStorage.getItem(OVERRIDE_KEY);
		if (!raw) return null;
		const o = JSON.parse(raw);
		if (!o || (o.exp ?? 0) < now || (o.theme !== 'light' && o.theme !== 'dark')) {
			localStorage.removeItem(OVERRIDE_KEY);
			return null;
		}
		return o.theme;
	} catch {
		return null;
	}
}

function endOfToday(): number {
	const d = new Date();
	d.setHours(23, 59, 59, 999);
	return d.getTime();
}

export function writeOverride(theme: Theme) {
	try {
		localStorage.setItem(OVERRIDE_KEY, JSON.stringify({ theme, exp: endOfToday() }));
	} catch {}
}

export function currentTheme(): Theme {
	return readOverride() ?? scheduledTheme();
}

export function applyTheme(theme: Theme) {
	document.documentElement.dataset.theme = theme;
	document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#141414' : '#fafafa');
}
