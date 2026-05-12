import type { PlayerScore, RankedMap, ImprovableMap, PPImprovement } from '../types';
import { applySsCurve } from './pp-curve';
import { deriveSkillRange } from './skill-range';

/**
 * Classifies ranked maps into new (never played) and improvable (played at <95% accuracy).
 * potentialGain = pp at 95% accuracy − current pp on that map.
 * Each combination of songHash + difficulty is treated as a separate play.
 */
export function classifyMaps(playerScores: PlayerScore[], rankedMaps: RankedMap[]): PPImprovement {
	// Build set of played hash+difficulty combos
	const played = new Map<string, PlayerScore>();
	for (const score of playerScores) {
		played.set(`${score.songHash}|${score.difficulty}`, score);
	}

	const skillRange = deriveSkillRange(playerScores);

	const newMaps: RankedMap[] = [];
	const improvableMaps: ImprovableMap[] = [];

	for (const map of rankedMaps) {
		const key = `${map.songHash}|${map.difficulty}`;
		const score = played.get(key);

		if (!score) {
			if (skillRange && (map.stars < skillRange.min || map.stars > skillRange.max)) continue;
			newMaps.push(map);
		} else if (score.accuracy < 0.95) {
			const ppAt95 = map.pp * applySsCurve(0.95);
			const potentialGain = ppAt95 - score.pp;
			improvableMaps.push({ ...map, currentAccuracy: score.accuracy, currentPP: score.pp, potentialGain });
		}
	}

	newMaps.sort((a, b) => b.pp - a.pp);
	improvableMaps.sort((a, b) => b.potentialGain - a.potentialGain);

	return {
		newMaps: newMaps.slice(0, 100),
		improvableMaps: improvableMaps.slice(0, 100),
	};
}
