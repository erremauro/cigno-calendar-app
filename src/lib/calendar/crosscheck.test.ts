import { describe, expect, it } from 'vitest';
import { HISTORICAL } from './historical';
import { computedMonthOf } from './lunisolar';
import { isoFromDay } from './time';

describe('confronto con le regole calcolate', () => {
	it('calendario Tenpō (1844–1872): mesi storici e calcolati coincidono', () => {
		const tenpo = HISTORICAL.filter((m) => m.year >= 1844 && m.year <= 1872);
		const diff = tenpo.filter((m) => {
			const c = computedMonthOf(m.startDay);
			return c.startDay !== m.startDay || c.month !== m.month || c.leap !== m.leap;
		});
		// Il Tenpō usava l'ora di Kyoto e l'astronomia dell'Ottocento: quando il novilunio cade
		// vicino alla mezzanotte il mese può iniziare un giorno prima o dopo, e nel 1852 cambia
		// anche la posizione dell'intercalare. Per gli anni storici fanno fede i dati dell'epoca.
		expect(tenpo.length).toBeGreaterThan(350);
		expect(diff.map((m) => `${m.year}/${m.leap ? '閏' : ''}${m.month} ${isoFromDay(m.startDay)}`)).toEqual([
			'1850/9 1850-10-06',
			'1851/12 1851-12-23',
			'1852/1 1852-01-21',
			'1852/2 1852-02-20',
			'1852/閏2 1852-03-21',
			'1866/4 1866-05-15'
		]);
	});
});
