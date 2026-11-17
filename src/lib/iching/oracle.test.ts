import { describe, expect, it } from 'vitest';
import { reading, parse, serialize, coinsToValue, throwCoins } from './oracle';

describe('consultazione', () => {
	it('56 con il nove al quarto posto → 52', () => {
		const r = reading([8, 8, 7, 9, 8, 7]);
		expect([r.primary.n, r.secondary?.n, r.moving]).toEqual([56, 52, [4]]);
	});
	it('senza linee mobili non c’è secondo esagramma', () => {
		const r = reading([7, 7, 7, 7, 7, 7]);
		expect([r.primary.n, r.secondary, r.moving.length]).toEqual([1, null, 0]);
	});
	it('tutti nove: 1 → 2', () => {
		const r = reading([9, 9, 9, 9, 9, 9]);
		expect([r.primary.n, r.secondary?.n, r.allMoving]).toEqual([1, 2, true]);
	});
	it('serializzazione', () => {
		expect(serialize([7, 8, 7, 9, 6, 8])).toBe('787968');
		expect(parse('787968')).toEqual([7, 8, 7, 9, 6, 8]);
		expect(parse('78796')).toBeNull();
		expect(parse('787965')).toBeNull();
	});
	it('monete', () => {
		expect(coinsToValue([2, 2, 2])).toBe(6);
		expect(coinsToValue([3, 3, 3])).toBe(9);
		for (let i = 0; i < 50; i++) expect([6, 7, 8, 9]).toContain(coinsToValue(throwCoins()));
	});
});
