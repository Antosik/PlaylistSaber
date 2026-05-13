import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Platform } from '../types';

beforeEach(() => {
	vi.resetModules();
	vi.restoreAllMocks();
});

describe('getRankedMaps', () => {
	it('fetches the correct JSON URL for ScoreSaber', async () => {
		const mockMaps = [
			{
				id: 'abc1',
				songHash: 'abc',
				songName: 'Test',
				artist: 'A',
				difficulty: 'Expert',
				stars: 5,
				pp: 200,
			},
		];
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockMaps),
		});
		vi.stubGlobal('fetch', fetchMock);

		const { getRankedMaps } = await import('./maps-cache.ts');
		const result = await getRankedMaps(Platform.ScoreSaber);

		expect(fetchMock).toHaveBeenCalledWith('/data/ss-maps.json');
		expect(result).toEqual(mockMaps);
	});

	it('fetches the correct JSON URL for BeatLeader', async () => {
		const mockMaps = [
			{
				id: 'def1',
				songHash: 'def',
				songName: 'Other',
				artist: 'B',
				difficulty: 'ExpertPlus',
				stars: 8,
				pp: 400,
			},
		];
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockMaps),
			})
		);

		const { getRankedMaps } = await import('./maps-cache.ts');
		const result = await getRankedMaps(Platform.BeatLeader);

		expect(fetch).toHaveBeenCalledWith('/data/bl-maps.json');
		expect(result).toEqual(mockMaps);
	});

	it('returns cached result on second call without fetching again', async () => {
		const mockMaps = [
			{
				id: 'abc1',
				songHash: 'abc',
				songName: 'Test',
				artist: 'A',
				difficulty: 'Expert',
				stars: 5,
				pp: 200,
			},
		];
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockMaps),
		});
		vi.stubGlobal('fetch', fetchMock);

		const { getRankedMaps } = await import('./maps-cache.ts');
		await getRankedMaps(Platform.ScoreSaber);
		await getRankedMaps(Platform.ScoreSaber);

		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('caches ScoreSaber and BeatLeader independently', async () => {
		const ssMaps = [
			{
				id: 'ss1',
				songHash: 'ss',
				songName: 'SS Song',
				artist: 'A',
				difficulty: 'Expert',
				stars: 5,
				pp: 200,
			},
		];
		const blMaps = [
			{
				id: 'bl1',
				songHash: 'bl',
				songName: 'BL Song',
				artist: 'B',
				difficulty: 'ExpertPlus',
				stars: 8,
				pp: 400,
			},
		];
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(ssMaps) })
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(blMaps) });
		vi.stubGlobal('fetch', fetchMock);

		const { getRankedMaps } = await import('./maps-cache.ts');
		const ss = await getRankedMaps(Platform.ScoreSaber);
		const bl = await getRankedMaps(Platform.BeatLeader);

		expect(ss).toEqual(ssMaps);
		expect(bl).toEqual(blMaps);
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});
});
