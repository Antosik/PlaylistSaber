import type { RankedMap, Platform } from '../../types';
import { Platform as PlatformValue } from '../../types';
import { basePpFromStars as blBasePpFromStars } from '../beatleader/utils';
import { basePpFromStars as ssBasePpFromStars } from '../scoresaber/utils';

import type { BeatSaverDoc, BeatSaverLeaderboard } from './types';

export function getBeatSaverLeaderboard(platform: Platform): BeatSaverLeaderboard {
	return platform === PlatformValue.ScoreSaber ? 'ScoreSaber' : 'BeatLeader';
}

function mapBasePP(stars: number, platform: Platform): number {
	return platform === PlatformValue.ScoreSaber
		? ssBasePpFromStars(stars)
		: blBasePpFromStars(stars);
}

export function flattenBeatSaverMaps(docs: BeatSaverDoc[], platform: Platform): RankedMap[] {
	return docs.flatMap((doc) => {
		const version = doc.versions?.[0];
		if (!doc.id || !doc.metadata?.songName || !doc.metadata.songAuthorName || !version?.hash)
			return [];

		return (version.diffs ?? [])
			.filter(
				(diff) =>
					diff.characteristic === 'Standard' && diff.difficulty && typeof diff.stars === 'number'
			)
			.map((diff) => ({
				id: doc.id!,
				songHash: version.hash!,
				songName: doc.metadata!.songName!,
				artist: doc.metadata!.songAuthorName!,
				difficulty: diff.difficulty!,
				stars: diff.stars!,
				pp: mapBasePP(diff.stars!, platform),
			}));
	});
}

export function mergeRankedMaps(existing: RankedMap[], delta: RankedMap[]): RankedMap[] {
	const byKey = new Map(existing.map((map) => [`${map.songHash}:${map.difficulty}`, map]));
	for (const map of delta) byKey.set(`${map.songHash}:${map.difficulty}`, map);
	return [...byKey.values()];
}
