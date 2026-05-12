import { describe, it, expect } from 'vitest';
import { classifyMaps } from '$lib/domain/pp-improvement';
import type { PlayerScore, RankedMap } from '$lib/types';

const map = (overrides: Partial<RankedMap> = {}): RankedMap => ({
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

	it('sorts new maps by pp descending', () => {
		const maps = [
			map({ songHash: 'low', pp: 100 }),
			map({ songHash: 'high', pp: 400 }),
			map({ songHash: 'mid', pp: 250 }),
		];
		const { newMaps } = classifyMaps([], maps);
		expect(newMaps[0].pp).toBe(400);
		expect(newMaps[1].pp).toBe(250);
		expect(newMaps[2].pp).toBe(100);
	});

	it('caps new maps at 100', () => {
		const maps = Array.from({ length: 150 }, (_, i) =>
			map({ songHash: `hash${i}`, pp: 300 - i }),
		);
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
		const maps = [
			map({ songHash: 'perfect', pp: 300 }),
			map({ songHash: 'nearly', pp: 280 }),
		];
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
		// gain = pp at 95% − current pp
		expect(improvableMaps[0].potentialGain).toBeGreaterThan(0);
		expect(improvableMaps[0].currentAccuracy).toBe(0.92);
		expect(improvableMaps[0].currentPP).toBe(240);
	});

	it('sorts improvable maps by potential pp gain descending', () => {
		const maps = [
			map({ songHash: 'small-gain', pp: 200 }),
			map({ songHash: 'big-gain', pp: 500 }),
		];
		const scores = [
			score({ songHash: 'small-gain', accuracy: 0.93, pp: 180 }),
			score({ songHash: 'big-gain', accuracy: 0.80, pp: 300 }),
		];
		const { improvableMaps } = classifyMaps(scores, maps);
		expect(improvableMaps[0].songHash).toBe('big-gain');
	});

	it('caps improvable maps at 100', () => {
		const maps = Array.from({ length: 150 }, (_, i) =>
			map({ songHash: `hash${i}`, pp: 400 }),
		);
		const scores = Array.from({ length: 150 }, (_, i) =>
			score({ songHash: `hash${i}`, accuracy: 0.90, pp: 320 }),
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
});
