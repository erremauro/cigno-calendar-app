#!/usr/bin/env node
/**
 * Genera le icone per la schermata Home (iPhone/Android) dal logo ufficiale di Cigno Zen.
 *
 * Uso: node scripts/make-icons.mjs
 *
 * Il cigno viene ritagliato sui suoi bordi reali e centrato su fondo scuro,
 * con un margine costante: così risulta centrato anche se il viewBox del logo non lo è.
 */
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const STATIC = fileURLToPath(new URL('../static/', import.meta.url));
const BG = { r: 20, g: 20, b: 20 }; // --bg del tema scuro

// colori del logo nel tema scuro (--logo-c1 … --logo-c10)
const C = [
	'161,206,234', '67,156,214', '67,156,214', '44,141,202', '25,81,116',
	'254,254,254', '225,239,248', '87,168,218', '89,169,219', '67,156,214'
];
const PATHS = [
	'M1127.315,1644L1114.669,1673.906L1088.745,1731.009L1046,1817L1112.119,1791L1150,1684L1127.315,1644Z',
	'M1114.669,1673.906L1150,1684L1090,1730L1114.669,1673.906Z',
	'M1046,1817L1132,1778L1136,1781L1098,1864L1078,1855',
	'M1285,1728L1319,1718L1279,1797L1339,1787L1252,1860L1231,1864L1285,1728Z',
	'M1276,1753.937L1252,1827L1243.157,1839L1252.574,1860.018L1232,1864L1276,1753.937Z',
	'M1136,1781L1290,1721L1241.157,1838L1136,1781Z',
	'M1136,1781L1241.157,1838L1232,1864L1223,1864L1136,1781Z',
	'M1098,1864L1136,1781C1136,1781 1217.531,1858.859 1223,1864C1195.753,1872.762 1106.02,1867.623 1098,1864Z',
	'M1131,1778L1294,1697L1284,1724L1136,1781L1131,1778Z',
	'M1039,1709L1061,1687L1071,1663L1098,1644L1127.315,1644L1120,1673.906L1039,1709Z'
];

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1634 1224" width="3268" height="2448">
<g transform="matrix(1,0,0,1,-955.042123,-1159.658413)"><g transform="matrix(5.444076,0,0,5.444076,-4701.352982,-7790.402754)">
${PATHS.map((d, i) => `<path d="${d}" fill="rgb(${C[i]})"/>`).join('\n')}
</g></g></svg>`;

/** Logo ritagliato sui bordi reali (PNG trasparente ad alta risoluzione). */
const swan = await sharp(Buffer.from(svg)).png().trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
console.log(`logo ritagliato: ${swan.info.width}×${swan.info.height}`);

/**
 * @param size lato dell'icona in px
 * @param fill frazione del lato occupata dal lato maggiore del cigno
 */
async function icon(file, size, fill) {
	const target = Math.round(size * fill);
	const logo = await sharp(swan.data).resize({ width: target, height: target, fit: 'inside' }).toBuffer({ resolveWithObject: true });
	const left = Math.round((size - logo.info.width) / 2);
	const top = Math.round((size - logo.info.height) / 2);
	await sharp({ create: { width: size, height: size, channels: 3, background: BG } })
		.composite([{ input: logo.data, left, top }])
		.png()
		.toFile(STATIC + file);
	console.log(`${file}: ${size}px, cigno ${logo.info.width}×${logo.info.height} a (${left}, ${top})`);
}

// iOS arrotonda gli angoli da sé; Android "maskable" ritaglia fino a un cerchio dell'80%: margine maggiore
await icon('apple-touch-icon.png', 180, 0.66);
await icon('icon-192.png', 192, 0.66);
await icon('icon-512.png', 512, 0.66);
await icon('icon-maskable-512.png', 512, 0.5);
await icon('favicon-32.png', 32, 0.86);

const manifest = {
	name: 'Calendario Cigno Zen',
	short_name: 'Calendario',
	lang: 'it',
	start_url: '/',
	scope: '/',
	display: 'standalone',
	background_color: '#141414',
	theme_color: '#141414',
	icons: [
		{ src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
		{ src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
		{ src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
	]
};
await writeFile(STATIC + 'manifest.webmanifest', JSON.stringify(manifest, null, '\t') + '\n');
console.log('manifest.webmanifest scritto');
