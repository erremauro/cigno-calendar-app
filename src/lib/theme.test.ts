import { describe, expect, it } from 'vitest';
import { scheduledTheme } from './theme';

describe('tema in base all’ora (come cignozen.it)', () => {
	it.each([
		[6, 59, 'dark'],
		[7, 0, 'light'],
		[12, 0, 'light'],
		[17, 59, 'light'],
		[18, 0, 'dark'],
		[23, 30, 'dark']
	])('%i:%i → %s', (h, m, theme) => {
		expect(scheduledTheme(new Date(2026, 10, 17, h, m))).toBe(theme);
	});
});
