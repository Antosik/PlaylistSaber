import {
	Platform,
	type PlayerScore,
	type RankedMap,
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

function ppAtReferenceAccuracy(map: RankedMap, platform: Platform): number {
	if (platform === Platform.BeatLeader) return map.pp * applyBlCurve(95);
	return map.pp * applySsCurve(0.95);
}

/**
 * Classifies ranked maps into new (never played) and improvable (played at <95% accuracy).
 * potentialGain = pp at 95% accuracy − current pp on that map.
 * Each combination of songHash + difficulty is treated as a separate play.
 */
export function classifyMaps(
	playerScores: PlayerScore[],
	rankedMaps: RankedMap[],
	platform: Platform = Platform.ScoreSaber
): PPImprovement {
	// Build set of played hash+difficulty combos
	const played = new Map<string, PlayerScore>();
	for (const score of playerScores) {
		played.set(playLookupKey(score.songHash, score.difficulty), score);
	}

	const skillRange = deriveSkillRange(playerScores);

	const newMaps: RankedMap[] = [];
	const improvableMaps: ImprovableMap[] = [];

	for (const map of rankedMaps) {
		const key = playLookupKey(map.songHash, map.difficulty);
		const score = played.get(key);

		if (!score) {
			if (skillRange && (map.stars < skillRange.min || map.stars > skillRange.max)) continue;
			newMaps.push(map);
		} else if (score.accuracy < 0.95) {
			const ppAt95 = ppAtReferenceAccuracy(map, platform);
			const potentialGain = ppAt95 - score.pp;
			improvableMaps.push({
				...map,
				currentAccuracy: score.accuracy,
				currentPP: score.pp,
				potentialGain,
			});
		}
	}

	newMaps.sort((a, b) => b.pp - a.pp);
	improvableMaps.sort((a, b) => b.potentialGain - a.potentialGain);

	return {
		newMaps: newMaps.slice(0, 100),
		improvableMaps: improvableMaps.slice(0, 100),
	};
}
