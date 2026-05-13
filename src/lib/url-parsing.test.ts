import { describe, it, expect } from 'vitest';
import { parsePlayerInput } from '$lib/url-parsing';

describe('parsePlayerInput', () => {
	// #region Happy paths
	it('Raw 17-digit Steam ID is accepted as-is', () => {
		const result = parsePlayerInput('76561198082215374');
		expect(result).toEqual({ type: 'resolved', id: '76561198082215374' });
	});

	it('Steam numerical profile URL is parsed to a Steam ID', () => {
		const result = parsePlayerInput('https://steamcommunity.com/profiles/76561198082215374');
		expect(result).toEqual({ type: 'resolved', id: '76561198082215374' });
	});

	it('ScoreSaber profile URL is parsed to a Steam ID', () => {
		const result = parsePlayerInput('https://scoresaber.com/u/76561198082215374');
		expect(result).toEqual({ type: 'resolved', id: '76561198082215374' });
	});

	it('BeatLeader profile URL is parsed to a Steam ID', () => {
		const result = parsePlayerInput('https://beatleader.com/u/76561198082215374/ranked');
		expect(result).toEqual({ type: 'resolved', id: '76561198082215374' });
	});

	it('BeatLeader URL with multiple extra path segments is correctly parsed', () => {
		const result = parsePlayerInput(
			'https://beatleader.com/u/76561198082215374/ranked/some/extra/path'
		);
		expect(result).toEqual({ type: 'resolved', id: '76561198082215374' });
	});

	it('Steam vanity URL returns an error explaining it is unsupported', () => {
		const result = parsePlayerInput('https://steamcommunity.com/id/Antosikkk');
		expect(result.type).toBe('error');
		expect((result as { type: 'error'; message: string }).message).toMatch(/vanity/i);
	});
	// #endregion Happy paths

	// #region Error cases
	it('Completely unrecognized input format returns error', () => {
		const result = parsePlayerInput('not-a-url-or-id');
		expect(result.type).toBe('error');
		expect((result as { type: 'error'; message: string }).message).toBeTruthy();
	});

	// #endregion Error cases

	// #region No API call verification (sync results only)
	it('Raw 17-digit Steam ID resolves synchronously — no async needed', () => {
		// parsePlayerInput is a pure sync function; if it returns 'resolved' we know no API call occurs
		const result = parsePlayerInput('76561198082215374');
		expect(result.type).toBe('resolved');
	});

	it('Steam numerical URL resolves synchronously — no async needed', () => {
		const result = parsePlayerInput('https://steamcommunity.com/profiles/76561198082215374');
		expect(result.type).toBe('resolved');
	});

	it('ScoreSaber URL resolves synchronously — no async needed', () => {
		const result = parsePlayerInput('https://scoresaber.com/u/76561198082215374');
		expect(result.type).toBe('resolved');
	});

	it('BeatLeader URL resolves synchronously — no async needed', () => {
		const result = parsePlayerInput('https://beatleader.com/u/76561198082215374/ranked');
		expect(result.type).toBe('resolved');
	});

	it('Steam vanity URL is not resolved — returns error, not resolved', () => {
		const result = parsePlayerInput('https://steamcommunity.com/id/Antosikkk');
		expect(result.type).not.toBe('resolved');
	});
	// #endregion No API call verification (sync results only)
});
