import ky from 'ky';

import type { Platform, RankedMap } from '../../types';

import type { BeatSaverSearchResponse } from './types';
import { flattenBeatSaverMaps, getBeatSaverLeaderboard } from './utils';

const api = ky.extend({ prefix: 'https://beatsaver.com/api', retry: 2, timeout: 30000, fetch });

async function fetchBeatSaverPage(
	page: number,
	platform: Platform,
	from?: string
): Promise<BeatSaverSearchResponse> {
	const searchParams: Record<string, string> = {
		leaderboard: getBeatSaverLeaderboard(platform),
	};
	if (from) searchParams.from = from;

	return api.get(`search/text/${page}`, { searchParams }).json<BeatSaverSearchResponse>();
}

async function getMaps(
	platform: Platform,
	from?: string,
	onProgress?: (loaded: number, total: number) => void
): Promise<RankedMap[]> {
	const first = await fetchBeatSaverPage(0, platform, from);
	onProgress?.(first.docs.length, first.info.total);

	const all = [...first.docs];
	for (let p = 2; p <= first.info.pages; p += 1) {
		const docs = await fetchBeatSaverPage(p - 1, platform, from).then((d) => d.docs);
		all.push(...docs);
		onProgress?.(all.length, first.info.total);
	}

	return flattenBeatSaverMaps(all, platform);
}

export function getAllMaps(
	platform: Platform,
	onProgress?: (loaded: number, total: number) => void
): Promise<RankedMap[]> {
	return getMaps(platform, undefined, onProgress);
}

export function getMapsFrom(
	platform: Platform,
	from: string,
	onProgress?: (loaded: number, total: number) => void
): Promise<RankedMap[]> {
	return getMaps(platform, from, onProgress);
}
