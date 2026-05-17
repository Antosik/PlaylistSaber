import { describe, it, expect } from 'vitest';

import { Platform } from '../types';

import { getRankedMaps } from './maps-cache';

describe('getRankedMaps', () => {
	it('returns a non-empty array for ScoreSaber', () => {
		const result = getRankedMaps(Platform.ScoreSaber);
		expect(Array.isArray(result)).toBe(true);
		expect(result.length).toBeGreaterThan(0);
	});

	it('returns a non-empty array for BeatLeader', () => {
		const result = getRankedMaps(Platform.BeatLeader);
		expect(Array.isArray(result)).toBe(true);
		expect(result.length).toBeGreaterThan(0);
	});

	it('returns different data for different platforms', () => {
		const ss = getRankedMaps(Platform.ScoreSaber);
		const bl = getRankedMaps(Platform.BeatLeader);
		expect(ss).not.toBe(bl);
	});

	it('each map has required fields', () => {
		const map = getRankedMaps(Platform.ScoreSaber)[0];
		expect(map).toHaveProperty('songHash');
		expect(map).toHaveProperty('songName');
		expect(map).toHaveProperty('stars');
		expect(map).toHaveProperty('pp');
	});
});
