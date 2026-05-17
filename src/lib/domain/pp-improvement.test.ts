import { describe, it, expect } from 'vitest';

import { applyBlCurve } from '$lib/domain/pp-curve';
import { classifyMaps, calculateWeightedDelta } from '$lib/domain/pp-improvement';
import { Platform, type PlayerScore, type RankedMap } from '$lib/types';

const map = (overrides: Partial<RankedMap> = {}): RankedMap => ({
	id: 'hash1',
	songHash: 'hash1',
	songName: 'Test Song',
	artist: 'Test Artist',
	difficulty: 'ExpertPlus',
	stars: 6.0,
	pp: 300,
	...overrides,
});

const score = (overrides: Partial<PlayerScore> = {}): PlayerScore => ({
	songHash: 'hash1',
	difficulty: 'ExpertPlus',
	accuracy: 0.92,
	pp: 250,
	stars: 6.0,
	...overrides,
});

describe('calculateWeightedDelta', () => {
	it('returns positive delta when inserting a high-pp new score into empty list', () => {
		const delta = calculateWeightedDelta([], 300);
		expect(delta).toBeCloseTo(300, 0);
	});

	it('inserts new score at correct rank and shifts existing scores down', () => {
		// sorted: [500, 300, 200], inserting 400 at rank 1 (0-indexed)
		const sorted = [500, 300, 200];
		const delta = calculateWeightedDelta(sorted, 400);
		// new list: [500, 400, 300, 200]
		// old total: 500*1 + 300*0.965 + 200*0.965^2 = 500 + 289.5 + 186.245 = 975.745
		// new total: 500*1 + 400*0.965 + 300*0.965^2 + 200*0.965^3
		expect(delta).toBeGreaterThan(0);
	});

	it('removes old pp and inserts new pp for improvable maps', () => {
		// old score: 200pp at rank 1 (sorted: [500, 200])
		// new score: 300pp → new sorted: [500, 300]
		const sorted = [500, 200];
		const delta = calculateWeightedDelta(sorted, 300, 200);
		// old total: 500 + 200*0.965 = 693
		// new total: 500 + 300*0.965 = 789.5
		expect(delta).toBeCloseTo(789.5 - 693, 1);
	});

	it('returns 0 delta when new pp equals old pp', () => {
		const sorted = [500, 200];
		const delta = calculateWeightedDelta(sorted, 200, 200);
		expect(delta).toBeCloseTo(0, 5);
	});

	it('returns negative delta if new pp is lower than old pp', () => {
		const sorted = [500, 200];
		const delta = calculateWeightedDelta(sorted, 150, 200);
		expect(delta).toBeLessThan(0);
	});
});

describe('classifyMaps - accuracy threshold', () => {
	it('uses 0.95 threshold by default', () => {
		const maps = [map({ songHash: 'a', pp: 300 })];
		const scores = [score({ songHash: 'a', accuracy: 0.96, pp: 290 })];
		const { improvableMaps } = classifyMaps(scores, maps);
		expect(improvableMaps).toHaveLength(0);
	});

	it('respects a custom accuracy threshold', () => {
		const maps = [map({ songHash: 'a', pp: 300 })];
		const scores = [score({ songHash: 'a', accuracy: 0.96, pp: 290 })];
		const { improvableMaps } = classifyMaps(scores, maps, Platform.ScoreSaber, 0.98);
		expect(improvableMaps).toHaveLength(1);
	});
});

describe('classifyMaps - skill range filter for improvable maps', () => {
	it('excludes improvable maps outside skill range', () => {
		// player's skill: centered around 6–7 stars
		const playerScores = [score({ songHash: 'played', stars: 6.5, pp: 250 })];
		const maps = [
			map({ songHash: 'in-range', stars: 6.0, pp: 250 }),
			map({ songHash: 'too-easy', stars: 1.0, pp: 50 }),
		];
		const allScores = [
			...playerScores,
			score({ songHash: 'in-range', accuracy: 0.88, pp: 180, stars: 6.0 }),
			score({ songHash: 'too-easy', accuracy: 0.88, pp: 30, stars: 1.0 }),
		];
		const { improvableMaps } = classifyMaps(allScores, maps);
		expect(improvableMaps.map((m) => m.songHash)).toContain('in-range');
		expect(improvableMaps.map((m) => m.songHash)).not.toContain('too-easy');
	});

	it('shows all improvable maps when player has only one score (no skill range derivable)', () => {
		// With a single score the sigma is 0, clamped to MIN_SIGMA=1, so range is [score.stars-1, score.stars+1.5]
		// Just verify it doesn't crash and returns results
		const maps = [map({ songHash: 'a', pp: 300, stars: 6.0 })];
		const scores = [score({ songHash: 'a', accuracy: 0.88, pp: 200, stars: 6.0 })];
		const { improvableMaps } = classifyMaps(scores, maps);
		expect(improvableMaps).toHaveLength(1);
	});
});

describe('classifyMaps - negative potential gain filtering', () => {
	it('excludes improvable maps with non-positive potential gain', () => {
		const maps = [map({ songHash: 'a', pp: 100 })];
		// current pp exceeds ppAt95 — no gain possible, should be excluded
		const scores = [score({ songHash: 'a', accuracy: 0.91, pp: 200 })]; // pp > map.pp
		const { improvableMaps } = classifyMaps(scores, maps);
		expect(improvableMaps).toHaveLength(0);
	});
});

describe('classifyMaps - weightedPPDelta', () => {
	it('attaches weightedPPDelta to new maps', () => {
		const maps = [map({ songHash: 'a', pp: 300 })];
		const { newMaps } = classifyMaps([], maps);
		expect(newMaps[0]).toHaveProperty('weightedPPDelta');
		expect(newMaps[0].weightedPPDelta).toBeGreaterThan(0);
	});

	it('attaches weightedPPDelta to improvable maps', () => {
		const maps = [map({ songHash: 'a', pp: 300 })];
		const scores = [score({ songHash: 'a', accuracy: 0.88, pp: 200 })];
		const { improvableMaps } = classifyMaps(scores, maps);
		expect(improvableMaps[0]).toHaveProperty('weightedPPDelta');
		expect(improvableMaps[0].weightedPPDelta).toBeGreaterThan(0);
	});

	it('sorts by weightedPPDelta descending', () => {
		// Two maps: one with high raw pp but low weighted impact, one with lower pp but higher weighted impact
		// In practice weighted delta correlates with pp but let's just verify the sort direction
		const maps = [
			map({ songHash: 'a', pp: 200, stars: 5.0 }),
			map({ songHash: 'b', pp: 400, stars: 6.0 }),
		];
		const { newMaps } = classifyMaps([], maps);
		expect(newMaps[0].weightedPPDelta).toBeGreaterThanOrEqual(newMaps[1].weightedPPDelta);
	});
});

describe('classifyMaps - new maps section', () => {
	it('includes maps the player has never played', () => {
		const maps = [map({ songHash: 'a' }), map({ songHash: 'b' })];
		const { newMaps } = classifyMaps([], maps);
		expect(newMaps).toHaveLength(2);
	});

	it('excludes maps the player has already played', () => {
		const maps = [map({ songHash: 'a' }), map({ songHash: 'b' })];
		const scores = [score({ songHash: 'a', difficulty: 'ExpertPlus' })];
		const { newMaps } = classifyMaps(scores, maps);
		expect(newMaps.map((m) => m.songHash)).not.toContain('a');
	});

	it('sorts new maps by weightedPPDelta descending', () => {
		const maps = [
			map({ songHash: 'low', pp: 100 }),
			map({ songHash: 'high', pp: 400 }),
			map({ songHash: 'mid', pp: 250 }),
		];
		const { newMaps } = classifyMaps([], maps);
		// weighted delta correlates with pp when sortedPPs is empty — higher pp = higher delta
		expect(newMaps[0].weightedPPDelta).toBeGreaterThanOrEqual(newMaps[1].weightedPPDelta);
		expect(newMaps[1].weightedPPDelta).toBeGreaterThanOrEqual(newMaps[2].weightedPPDelta);
	});

	it('caps new maps at 100', () => {
		const maps = Array.from({ length: 150 }, (_, i) => map({ songHash: `hash${i}`, pp: 300 - i }));
		const { newMaps } = classifyMaps([], maps);
		expect(newMaps).toHaveLength(100);
	});

	it('returns all ranked maps as new when player has no scores', () => {
		const maps = [map({ songHash: 'a' }), map({ songHash: 'b' })];
		const { newMaps } = classifyMaps([], maps);
		expect(newMaps).toHaveLength(2);
	});
});

describe('classifyMaps - improvable maps section', () => {
	it('includes played maps with accuracy below 95%', () => {
		const maps = [map({ songHash: 'a', pp: 300 })];
		const scores = [score({ songHash: 'a', accuracy: 0.92, pp: 240 })];
		const { improvableMaps } = classifyMaps(scores, maps);
		expect(improvableMaps).toHaveLength(1);
		expect(improvableMaps[0].songHash).toBe('a');
	});

	it('excludes played maps with accuracy at or above 95%', () => {
		const maps = [map({ songHash: 'perfect', pp: 300 }), map({ songHash: 'nearly', pp: 280 })];
		const scores = [
			score({ songHash: 'perfect', accuracy: 1.0, pp: 300 }),
			score({ songHash: 'nearly', accuracy: 0.95, pp: 280 }),
		];
		const { improvableMaps } = classifyMaps(scores, maps);
		expect(improvableMaps).toHaveLength(0);
	});

	it('calculates potential pp gain correctly', () => {
		const maps = [map({ songHash: 'a', pp: 300 })];
		const scores = [score({ songHash: 'a', accuracy: 0.92, pp: 240 })];
		const { improvableMaps } = classifyMaps(scores, maps);
		expect(improvableMaps[0].weightedPPDelta).toBeGreaterThan(0);
		expect(improvableMaps[0].currentAccuracy).toBe(0.92);
		expect(improvableMaps[0].currentPP).toBe(240);
	});

	it('sorts improvable maps by weightedPPDelta descending', () => {
		const maps = [map({ songHash: 'small-gain', pp: 200 }), map({ songHash: 'big-gain', pp: 500 })];
		const scores = [
			score({ songHash: 'small-gain', accuracy: 0.93, pp: 180 }),
			score({ songHash: 'big-gain', accuracy: 0.8, pp: 300 }),
		];
		const { improvableMaps } = classifyMaps(scores, maps);
		expect(improvableMaps[0].weightedPPDelta).toBeGreaterThanOrEqual(
			improvableMaps[1].weightedPPDelta
		);
	});

	it('caps improvable maps at 100', () => {
		const maps = Array.from({ length: 150 }, (_, i) => map({ songHash: `hash${i}`, pp: 400 }));
		const scores = Array.from({ length: 150 }, (_, i) =>
			score({ songHash: `hash${i}`, accuracy: 0.9, pp: 320 })
		);
		const { improvableMaps } = classifyMaps(scores, maps);
		expect(improvableMaps).toHaveLength(100);
	});

	it('is empty when player has no scores', () => {
		const maps = [map({ songHash: 'a' })];
		const { improvableMaps } = classifyMaps([], maps);
		expect(improvableMaps).toHaveLength(0);
	});
});

describe('classifyMaps - skill-range filtering for new maps', () => {
	it('excludes new maps more than 2 stars above the player ceiling', () => {
		const maps = [
			map({ songHash: 'reachable', stars: 7.5, pp: 300 }),
			map({ songHash: 'too-hard', stars: 12.0, pp: 600 }),
		];
		// player plays 6–7*
		const scores = [score({ songHash: 'played', stars: 6.5, pp: 250 })];
		const { newMaps } = classifyMaps(scores, maps);
		expect(newMaps.map((m) => m.songHash)).toContain('reachable');
		expect(newMaps.map((m) => m.songHash)).not.toContain('too-hard');
	});

	it('excludes new maps more than 0.5 stars below the player floor', () => {
		const maps = [
			map({ songHash: 'in-range', stars: 6.0, pp: 250 }),
			map({ songHash: 'too-easy', stars: 2.0, pp: 80 }),
		];
		const scores = [score({ songHash: 'played', stars: 6.5, pp: 250 })];
		const { newMaps } = classifyMaps(scores, maps);
		expect(newMaps.map((m) => m.songHash)).toContain('in-range');
		expect(newMaps.map((m) => m.songHash)).not.toContain('too-easy');
	});

	it('shows all new maps when player has no scores', () => {
		const maps = [
			map({ songHash: 'easy', stars: 2.0, pp: 100 }),
			map({ songHash: 'hard', stars: 12.0, pp: 600 }),
		];
		const { newMaps } = classifyMaps([], maps);
		expect(newMaps).toHaveLength(2);
	});
});

describe('classifyMaps - difficulty matching', () => {
	it('treats same song hash but different difficulty as a separate play', () => {
		const maps = [
			map({ songHash: 'a', difficulty: 'ExpertPlus', pp: 300 }),
			map({ songHash: 'a', difficulty: 'Expert', pp: 200 }),
		];
		// Player has played Expert, not ExpertPlus
		const scores = [score({ songHash: 'a', difficulty: 'Expert', accuracy: 0.92, pp: 170 })];
		const { newMaps, improvableMaps } = classifyMaps(scores, maps);
		expect(newMaps.some((m) => m.difficulty === 'ExpertPlus')).toBe(true);
		expect(improvableMaps.some((m) => m.difficulty === 'Expert')).toBe(true);
	});

	it('matches ranked map to score when difficulty labels differ (Expert+ vs ExpertPlus)', () => {
		const maps = [map({ songHash: 'song-a', difficulty: 'ExpertPlus', pp: 300 })];
		const scores = [score({ songHash: 'song-a', difficulty: 'Expert+', accuracy: 0.92, pp: 200 })];
		const { improvableMaps, newMaps } = classifyMaps(scores, maps);
		expect(improvableMaps).toHaveLength(1);
		expect(newMaps).toHaveLength(0);
	});

	it('matches songHash case-insensitively', () => {
		const maps = [map({ id: 'mid', songHash: 'abc123', difficulty: 'Expert', pp: 200 })];
		const scores = [score({ songHash: 'ABC123', difficulty: 'Expert', accuracy: 0.9, pp: 150 })];
		const { improvableMaps } = classifyMaps(scores, maps);
		expect(improvableMaps).toHaveLength(1);
	});
});

describe('classifyMaps - platform pp curve', () => {
	it('uses BeatLeader reference curve for potential gain when platform is BeatLeader', () => {
		const maps = [map({ songHash: 'a', pp: 100 })];
		const scores = [score({ songHash: 'a', accuracy: 0.92, pp: 40 })];
		const { improvableMaps } = classifyMaps(scores, maps, Platform.BeatLeader);
		// With a single score, weightedPPDelta equals the raw gain: ppAt95 - currentPP
		expect(improvableMaps[0].weightedPPDelta).toBeCloseTo(100 * applyBlCurve(95) - 40, 5);
	});
});
