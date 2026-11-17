/**
 * Logica della consultazione: sei valori di linea (6, 7, 8, 9) dal basso verso l'alto.
 */
import { hexagramFromLines, type Hexagram } from './hexagrams';

export type LineValue = 6 | 7 | 8 | 9;

export const isMoving = (v: LineValue) => v === 6 || v === 9;
export const isYang = (v: LineValue) => v === 7 || v === 9;

/** Testa = 3 (yang), croce = 2 (yin). */
export type CoinFace = 3 | 2;

export function coinsToValue(coins: CoinFace[]): LineValue {
	return (coins[0] + coins[1] + coins[2]) as LineValue;
}

export interface Reading {
	values: LineValue[];
	primary: Hexagram;
	/** posizioni (1–6) delle linee mobili */
	moving: number[];
	/** esagramma derivato, se ci sono linee mobili */
	secondary: Hexagram | null;
	/** negli esagrammi 1 e 2, con tutte le linee mobili, si legge anche il testo speciale */
	allMoving: boolean;
}

export function reading(values: LineValue[]): Reading {
	if (values.length !== 6) throw new Error('Servono sei linee');
	const primary = hexagramFromLines(values.map((v) => (isYang(v) ? 1 : 0)));
	const moving = values.flatMap((v, i) => (isMoving(v) ? [i + 1] : []));
	const secondary = moving.length
		? hexagramFromLines(values.map((v) => (isMoving(v) ? (isYang(v) ? 0 : 1) : isYang(v) ? 1 : 0)))
		: null;
	return { values, primary, moving, secondary, allMoving: moving.length === 6 };
}

/** «787968» ↔ [7, 8, 7, 9, 6, 8] */
export function serialize(values: LineValue[]): string {
	return values.join('');
}

export function parse(s: string | null): LineValue[] | null {
	if (!s || !/^[6-9]{6}$/.test(s)) return null;
	return s.split('').map(Number) as LineValue[];
}

function randomInt(max: number): number {
	const a = new Uint32Array(1);
	crypto.getRandomValues(a);
	return a[0] % max;
}

/** Lancio virtuale di tre monete. */
export function throwCoins(): CoinFace[] {
	return [0, 0, 0].map(() => (randomInt(2) ? 3 : 2) as CoinFace);
}

const ORDINALS = ['prima', 'seconda', 'terza', 'quarta', 'quinta', 'sesta'];
export const lineOrdinal = (position: number) => ORDINALS[position - 1];
