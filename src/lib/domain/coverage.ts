import type { RankedMap, PlayerSlot, CoverageResult } from '../types';

function inSlot(stars: number, slot: PlayerSlot): boolean {
	if (slot.min !== null && stars < slot.min) return false;
	if (slot.max !== null && stars > slot.max) return false;
	return true;
}

/**
 * Finds songs whose difficulties cover every player slot simultaneously.
 * One difficulty can satisfy multiple overlapping slots.
 * Capped at 200 results, sorted by highest matched star descending.
 */
export function findCoveringSongs(rankedMaps: RankedMap[], slots: PlayerSlot[]): CoverageResult[] {
	const byHash = new Map<string, RankedMap[]>();
	for (const map of rankedMaps) {
		const group = byHash.get(map.songHash);
		if (group) group.push(map);
		else byHash.set(map.songHash, [map]);
	}

	const results: CoverageResult[] = [];

	for (const [songHash, diffs] of byHash) {
		const matches: CoverageResult['matches'] = [];
		let allSlotsCovered = true;

		for (let slotIndex = 0; slotIndex < slots.length; slotIndex++) {
			const slot = slots[slotIndex];
			const matching = diffs.filter((d) => inSlot(d.stars, slot));

			if (matching.length === 0) {
				allSlotsCovered = false;
				break;
			}

			for (const d of matching) {
				matches.push({ slotIndex, difficulty: d.difficulty, stars: d.stars, pp: d.pp });
			}
		}

		if (!allSlotsCovered) continue;

		const first = diffs[0];
		results.push({ songHash, songName: first.songName, artist: first.artist, matches });
	}

	results.sort((a, b) => {
		const aMax = Math.max(...a.matches.map((m) => m.stars));
		const bMax = Math.max(...b.matches.map((m) => m.stars));
		return bMax - aMax;
	});

	return results.slice(0, 200);
}

export function sortCoverageResults(
	results: CoverageResult[],
	by: 'default' | 'name' | 'stars' | 'pp'
): CoverageResult[] {
	const copy = [...results];
	switch (by) {
		case 'name':
			return copy.sort((a, b) => a.songName.localeCompare(b.songName));
		case 'stars':
			return copy.sort(
				(a, b) =>
					Math.max(...b.matches.map((m) => m.stars)) - Math.max(...a.matches.map((m) => m.stars))
			);
		case 'pp':
			return copy.sort(
				(a, b) => b.matches.reduce((s, m) => s + m.pp, 0) - a.matches.reduce((s, m) => s + m.pp, 0)
			);
		default:
			return copy;
	}
}
