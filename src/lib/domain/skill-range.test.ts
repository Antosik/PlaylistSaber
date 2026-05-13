import { describe, it, expect } from 'vitest';

import { deriveSkillRange, RANGE_SIGMA_LOW, RANGE_SIGMA_HIGH } from '$lib/domain/skill-range';
import type { PlayerScore } from '$lib/types';

const score = (stars: number, pp = 100): PlayerScore => ({
	songHash: `hash-${stars}-${pp}`,
	difficulty: 'ExpertPlus',
	accuracy: 0.95,
	pp,
	stars,
});

describe('deriveSkillRange', () => {
	it('returns null when the player has no scores', () => {
		expect(deriveSkillRange([])).toBeNull();
	});

	it('centers the range on the median, not the min or max', () => {
		// [4, 6, 6, 6, 8] - median 6, mean 6, symmetric → min = max(0, 6 − σ), max = 6 + σ
		const scores = [4, 6, 6, 6, 8].map((s) => score(s));
		const result = deriveSkillRange(scores)!;
		expect(result.min).toBeLessThan(6);
		expect(result.max).toBeGreaterThan(6);
		// Center should be nearer to 6 than to 4 or 8
		const center = (result.min + result.max) / 2;
		expect(Math.abs(center - 6)).toBeLessThan(1);
	});

	it('produces a wider range when scores are more spread out', () => {
		const tight = [5, 5.5, 6, 6.5, 7].map((s) => score(s));
		const wide = [2, 4, 6, 8, 10].map((s) => score(s));
		const tightResult = deriveSkillRange(tight)!;
		const wideResult = deriveSkillRange(wide)!;
		const tightWidth = tightResult.max - tightResult.min;
		const wideWidth = wideResult.max - wideResult.min;
		expect(wideWidth).toBeGreaterThan(tightWidth);
	});

	it('enforces a minimum spread so the window never collapses', () => {
		// All scores identical → σ = 0, should be floored
		const scores = Array.from({ length: 10 }, () => score(6.0, 200));
		const result = deriveSkillRange(scores)!;
		expect(result.max).toBeGreaterThan(result.min);
		expect(result.max - result.min).toBeGreaterThan(0);
	});

	it('min is never negative', () => {
		const scores = [score(0.5), score(1.0)];
		const result = deriveSkillRange(scores)!;
		expect(result.min).toBeGreaterThanOrEqual(0);
	});

	it('max is further from center than min, reflecting asymmetric coefficients', () => {
		const scores = Array.from({ length: 10 }, () => score(6.0, 200));
		const result = deriveSkillRange(scores)!;
		const median = 6.0;
		expect(result.max - median).toBeGreaterThan(median - result.min);
	});

	it('satisfies min = median − RANGE_SIGMA_LOW × σ and max = median + RANGE_SIGMA_HIGH × σ for known inputs', () => {
		// Two scores at 4 and 8: median=6, mean=6, variance=4, σ=2
		const scores = [score(4.0, 200), score(8.0, 100)];
		const result = deriveSkillRange(scores)!;
		const sigma = 2;
		expect(result.min).toBeCloseTo(6 - RANGE_SIGMA_LOW * sigma, 5);
		expect(result.max).toBeCloseTo(6 + RANGE_SIGMA_HIGH * sigma, 5);
	});

	it('uses only the top 50 plays by pp', () => {
		// 50 high-pp plays at 6★, 10 low-pp plays at 12★ - 12★ should not affect the range
		const top50 = Array.from({ length: 50 }, (_, i) => score(6.0, 1000 - i));
		const rest = Array.from({ length: 10 }, (_, i) => score(12.0, 1 + i));
		const result = deriveSkillRange([...rest, ...top50])!;
		// With only 6★ in top 50: median=6, max < 6 + RANGE_SIGMA_HIGH * MIN_SIGMA * some small factor
		expect(result.max).toBeLessThan(10);
	});
});
