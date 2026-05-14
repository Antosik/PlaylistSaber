import {
	Platform,
	type PlayerScore,
	type RankedMap,
	type NewMap,
	type ImprovableMap,
	type PPImprovement,
} from '../types';

import { applySsCurve, applyBlCurve } from './pp-curve';
import { deriveSkillRange } from './skill-range';

/** Canonical difficulty key so ScoreSaber/BeatSaver/BeatLeader name variants still match ranked snapshots. */
function difficultyMatchKey(difficulty: string): string {
	const compact = difficulty
		.trim()
		.toLowerCase()
		.replace(/[\s_-]/g, '');
	if (compact === 'expertplus' || compact === 'expert+') return 'expertplus';
	if (compact === 'expert') return 'expert';
	if (compact === 'hard') return 'hard';
	if (compact === 'normal') return 'normal';
	if (compact === 'easy') return 'easy';
	return compact;
}

function playLookupKey(songHash: string, difficulty: string): string {
	return `${songHash.trim().toLowerCase()}|${difficultyMatchKey(difficulty)}`;
}

function weightedTotal(sortedPPs: number[]): number {
	return sortedPPs.reduce((sum, pp, i) => sum + pp * Math.pow(0.965, i), 0);
}

/**
 * Simulates inserting newPP into the player's sorted score list (optionally
 * removing oldPP first for improvable maps) and returns the delta in weighted total PP.
 * sortedPPs must be sorted descending.
 */
export function calculateWeightedDelta(sortedPPs: number[], newPP: number, oldPP?: number): number {
	const modified = [...sortedPPs];
	if (oldPP !== undefined) {
		const idx = modified.indexOf(oldPP);
		if (idx !== -1) modified.splice(idx, 1);
	}
	const insertAt = modified.findIndex((pp) => pp < newPP);
	if (insertAt === -1) modified.push(newPP);
	else modified.splice(insertAt, 0, newPP);
	return weightedTotal(modified) - weightedTotal(sortedPPs);
}

function ppAtReferenceAccuracy(map: RankedMap, platform: Platform): number {
	if (platform === Platform.BeatLeader) return map.pp * applyBlCurve(95);
	return map.pp * applySsCurve(0.95);
}

/**
 * Classifies ranked maps into new (never played) and improvable (played at <accuracy threshold).
 * potentialGain = pp at 95% accuracy − current pp on that map.
 * Each combination of songHash + difficulty is treated as a separate play.
 */
export function classifyMaps(
	playerScores: PlayerScore[],
	rankedMaps: RankedMap[],
	platform: Platform = Platform.ScoreSaber,
	options: { accuracyThreshold?: number } = {}
): PPImprovement {
	const { accuracyThreshold = 0.95 } = options;

	const played = new Map<string, PlayerScore>();
	for (const score of playerScores) {
		played.set(playLookupKey(score.songHash, score.difficulty), score);
	}

	const skillRange = deriveSkillRange(playerScores);
	const sortedPPs = [...playerScores].map((s) => s.pp).sort((a, b) => b - a);

	const newMaps: NewMap[] = [];
	const improvableMaps: ImprovableMap[] = [];

	for (const map of rankedMaps) {
		const key = playLookupKey(map.songHash, map.difficulty);
		const score = played.get(key);

		if (!score) {
			if (skillRange && (map.stars < skillRange.min || map.stars > skillRange.max)) continue;
			const ppAt95 = ppAtReferenceAccuracy(map, platform);
			newMaps.push({ ...map, weightedPPDelta: calculateWeightedDelta(sortedPPs, ppAt95) });
		} else if (score.accuracy < accuracyThreshold) {
			if (skillRange && (map.stars < skillRange.min || map.stars > skillRange.max)) continue;
			const ppAt95 = ppAtReferenceAccuracy(map, platform);
			const potentialGain = ppAt95 - score.pp;
			if (potentialGain <= 0) continue;
			const weightedPPDelta = calculateWeightedDelta(sortedPPs, ppAt95, score.pp);
			improvableMaps.push({
				...map,
				currentAccuracy: score.accuracy,
				currentPP: score.pp,
				potentialGain,
				weightedPPDelta,
			});
		}
	}

	newMaps.sort((a, b) => b.weightedPPDelta - a.weightedPPDelta);
	improvableMaps.sort((a, b) => b.weightedPPDelta - a.weightedPPDelta);

	return {
		newMaps: newMaps.slice(0, 100),
		improvableMaps: improvableMaps.slice(0, 100),
	};
}
