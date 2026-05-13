import type { PlayerScore, SkillRange } from '../types';

export const RANGE_SIGMA_LOW = 1.0;
export const RANGE_SIGMA_HIGH = 1.5;
const MIN_SIGMA = 1.0;

/**
 * Derives skill range from a player's top 50 scores by pp.
 * Center = median stars; spread = std deviation (floored at MIN_SIGMA).
 * Returns null if no scores.
 */
export function deriveSkillRange(scores: PlayerScore[]): SkillRange | null {
	if (scores.length === 0) return null;

	const top50 = [...scores].sort((a, b) => b.pp - a.pp).slice(0, 50);
	const sorted = top50.map((s) => s.stars ?? 0).sort((a, b) => a - b);

	const mid = Math.floor(sorted.length / 2);
	const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

	const mean = sorted.reduce((s, v) => s + v, 0) / sorted.length;
	const sigma = Math.max(
		Math.sqrt(sorted.reduce((s, v) => s + (v - mean) ** 2, 0) / sorted.length),
		MIN_SIGMA
	);

	return {
		min: Math.max(0, median - RANGE_SIGMA_LOW * sigma),
		max: median + RANGE_SIGMA_HIGH * sigma,
	};
}
