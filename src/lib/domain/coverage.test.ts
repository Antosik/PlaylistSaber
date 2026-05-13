import { describe, it, expect } from 'vitest';

import { findCoveringSongs } from '$lib/domain/coverage';
import type { RankedMap, PlayerSlot } from '$lib/types';

const diff = (overrides: Partial<RankedMap>): RankedMap => ({
	id: 'song-a',
	songHash: 'song-a',
	songName: 'Song A',
	artist: 'Artist',
	difficulty: 'ExpertPlus',
	stars: 5.0,
	pp: 200,
	...overrides,
});

const slot = (min: number | null, max: number | null, label = 'Player'): PlayerSlot => ({
	label,
	min,
	max,
});

describe('findCoveringSongs - basic coverage', () => {
	it('returns a song when all slots are covered', () => {
		const maps = [
			diff({ songHash: 'a', difficulty: 'ExpertPlus', stars: 7.0 }),
			diff({ songHash: 'a', difficulty: 'Hard', stars: 3.0 }),
		];
		const slots = [slot(6.0, null), slot(null, 4.0)];
		const results = findCoveringSongs(maps, slots);
		expect(results).toHaveLength(1);
		expect(results[0].songHash).toBe('a');
	});

	it('excludes a song when at least one slot has no matching difficulty', () => {
		const maps = [diff({ songHash: 'a', difficulty: 'ExpertPlus', stars: 7.0 })];
		// Second slot needs ≤ 3 stars - no difficulty covers it
		const slots = [slot(6.0, null), slot(null, 3.0)];
		const results = findCoveringSongs(maps, slots);
		expect(results).toHaveLength(0);
	});

	it('returns an empty array when no songs cover all slots', () => {
		const maps = [diff({ songHash: 'a', stars: 5.0 })];
		const slots = [slot(6.0, 8.0), slot(1.0, 2.0)];
		const results = findCoveringSongs(maps, slots);
		expect(results).toHaveLength(0);
	});
});

describe('findCoveringSongs - open-ended bounds', () => {
	it('null min means no lower bound (any stars qualify)', () => {
		const maps = [diff({ songHash: 'a', stars: 1.5 })];
		const slots = [slot(null, 3.0)];
		expect(findCoveringSongs(maps, slots)).toHaveLength(1);
	});

	it('null max means no upper bound (any stars qualify)', () => {
		const maps = [diff({ songHash: 'a', stars: 12.0 })];
		const slots = [slot(6.0, null)];
		expect(findCoveringSongs(maps, slots)).toHaveLength(1);
	});

	it('null min and null max matches any difficulty', () => {
		const maps = [diff({ songHash: 'a', stars: 5.0 })];
		const slots = [slot(null, null)];
		expect(findCoveringSongs(maps, slots)).toHaveLength(1);
	});
});

describe('findCoveringSongs - one difficulty satisfying multiple slots', () => {
	it('a single difficulty can cover two overlapping slots', () => {
		// Slots overlap: 4–6 and 5–7 - a ★5.5 diff satisfies both
		const maps = [diff({ songHash: 'a', stars: 5.5 })];
		const slots = [slot(4.0, 6.0), slot(5.0, 7.0)];
		const results = findCoveringSongs(maps, slots);
		expect(results).toHaveLength(1);
		// Both slots matched by the same difficulty
		expect(results[0].matches).toHaveLength(2);
		expect(results[0].matches.every((m) => m.stars === 5.5)).toBe(true);
	});
});

describe('findCoveringSongs - result shape', () => {
	it('each result includes songHash, songName, artist, and matches array', () => {
		const maps = [diff({ songHash: 'a', songName: 'My Song', artist: 'Me', stars: 5.0 })];
		const slots = [slot(4.0, 6.0)];
		const [result] = findCoveringSongs(maps, slots);
		expect(result.songHash).toBe('a');
		expect(result.songName).toBe('My Song');
		expect(result.artist).toBe('Me');
		expect(Array.isArray(result.matches)).toBe(true);
	});

	it('each match includes slotIndex, difficulty, stars, and pp', () => {
		const maps = [diff({ songHash: 'a', difficulty: 'Expert', stars: 5.0, pp: 250 })];
		const slots = [slot(4.0, 6.0)];
		const [result] = findCoveringSongs(maps, slots);
		const match = result.matches[0];
		expect(match.slotIndex).toBe(0);
		expect(match.difficulty).toBe('Expert');
		expect(match.stars).toBe(5.0);
		expect(match.pp).toBe(250);
	});

	it('includes all matched difficulties across all slots in the matches array', () => {
		// Song has 3 diffs; 3 slots each matched by a different diff
		const maps = [
			diff({ songHash: 'a', difficulty: 'ExpertPlus', stars: 8.0, pp: 300 }),
			diff({ songHash: 'a', difficulty: 'Expert', stars: 5.0, pp: 200 }),
			diff({ songHash: 'a', difficulty: 'Hard', stars: 3.0, pp: 100 }),
		];
		const slots = [slot(7.0, null), slot(4.0, 6.0), slot(null, 4.0)];
		const [result] = findCoveringSongs(maps, slots);
		expect(result.matches).toHaveLength(3);
	});
});

describe('findCoveringSongs - sorting and cap', () => {
	it('sorts results by highest matched star value descending', () => {
		const maps = [
			diff({ songHash: 'low', difficulty: 'ExpertPlus', stars: 3.0 }),
			diff({ songHash: 'high', difficulty: 'ExpertPlus', stars: 9.0 }),
			diff({ songHash: 'mid', difficulty: 'ExpertPlus', stars: 6.0 }),
		];
		const slots = [slot(null, null)];
		const results = findCoveringSongs(maps, slots);
		expect(results[0].songHash).toBe('high');
		expect(results[1].songHash).toBe('mid');
		expect(results[2].songHash).toBe('low');
	});

	it('caps results at 200 songs', () => {
		const maps = Array.from({ length: 250 }, (_, i) => diff({ songHash: `song-${i}`, stars: 5.0 }));
		const slots = [slot(null, null)];
		const results = findCoveringSongs(maps, slots);
		expect(results).toHaveLength(200);
	});

	it('keeps the highest-starred songs when capping at 200', () => {
		const maps = Array.from({ length: 250 }, (_, i) =>
			diff({ songHash: `song-${i}`, stars: i * 0.1 })
		);
		const slots = [slot(null, null)];
		const results = findCoveringSongs(maps, slots);
		// All 200 kept songs should have stars >= the 200th highest
		const minKept = Math.min(...results.map((r) => r.matches[0].stars));
		const sorted = [...maps].sort((a, b) => b.stars - a.stars);
		expect(minKept).toBeGreaterThanOrEqual(sorted[199].stars);
	});
});

describe('findCoveringSongs - grouping by song', () => {
	it('groups multiple difficulties of the same song under one result entry', () => {
		const maps = [
			diff({ songHash: 'a', difficulty: 'ExpertPlus', stars: 8.0 }),
			diff({ songHash: 'a', difficulty: 'Hard', stars: 3.0 }),
			diff({ songHash: 'b', difficulty: 'ExpertPlus', stars: 8.0 }),
		];
		const slots = [slot(7.0, null), slot(null, 4.0)];
		const results = findCoveringSongs(maps, slots);
		// Only song 'a' covers both slots; song 'b' has no low-star diff
		expect(results).toHaveLength(1);
		expect(results[0].songHash).toBe('a');
	});
});
