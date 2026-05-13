import ky from 'ky';
import type { RankedMap, Platform } from '../../types';
import { Platform as PlatformValue } from '../../types';
import { fetchPagesBatched } from '../utils';
import { PP_PER_STAR } from '../beatleader/utils';

const api = ky.extend({ prefix: 'https://beatsaver.com/api', retry: 2, timeout: 30000 });

const BEATSAVER_BATCH_SIZE = 1;
const BEATSAVER_PAGE_ATTEMPTS = 4;

type BeatSaverLeaderboard = 'ScoreSaber' | 'BeatLeader';

type BeatSaverDiff = {
	characteristic?: string;
	difficulty?: string;
	stars?: number;
};

type BeatSaverVersion = {
	hash?: string;
	diffs?: BeatSaverDiff[];
};

type BeatSaverDoc = {
	id?: string;
	metadata?: {
		songName?: string;
		songAuthorName?: string;
	};
	versions?: BeatSaverVersion[];
};

type BeatSaverSearchResponse = {
	docs: BeatSaverDoc[];
	info: {
		total: number;
		pages: number;
	};
};

export function getBeatSaverLeaderboard(platform: Platform): BeatSaverLeaderboard {
	return platform === PlatformValue.ScoreSaber ? 'ScoreSaber' : 'BeatLeader';
}

function mapBasePP(stars: number, platform: Platform): number {
	return platform === PlatformValue.ScoreSaber ? stars * 50 : stars * PP_PER_STAR;
}

export function flattenBeatSaverMaps(docs: BeatSaverDoc[], platform: Platform): RankedMap[] {
	return docs.flatMap((doc) => {
		const version = doc.versions?.[0];
		if (!doc.id || !doc.metadata?.songName || !doc.metadata.songAuthorName || !version?.hash) return [];

		return (version.diffs ?? [])
			.filter((diff) => diff.characteristic === 'Standard' && diff.difficulty && typeof diff.stars === 'number')
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

async function fetchBeatSaverPage(
	page: number,
	platform: Platform,
	from?: string,
): Promise<BeatSaverSearchResponse> {
	const searchParams: Record<string, string> = {
		leaderboard: getBeatSaverLeaderboard(platform),
	};
	if (from) searchParams.from = from;

	let lastError: unknown;
	for (let attempt = 1; attempt <= BEATSAVER_PAGE_ATTEMPTS; attempt += 1) {
		try {
			return await api.get(`search/text/${page}`, { searchParams }).json<BeatSaverSearchResponse>();
		} catch (error) {
			lastError = error;
			if (attempt < BEATSAVER_PAGE_ATTEMPTS) await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
		}
	}

	throw lastError;
}

async function getMaps(platform: Platform, from?: string, onProgress?: (loaded: number, total: number) => void): Promise<RankedMap[]> {
	const first = await fetchBeatSaverPage(0, platform, from);
	onProgress?.(first.docs.length, first.info.total);

	const all = await fetchPagesBatched(
		first.docs,
		first.info.total,
		first.info.pages,
		(page) => fetchBeatSaverPage(page - 1, platform, from).then((data) => data.docs),
		onProgress,
		BEATSAVER_BATCH_SIZE,
	);

	return flattenBeatSaverMaps(all, platform);
}

export function getAllMaps(
	platform: Platform,
	onProgress?: (loaded: number, total: number) => void,
): Promise<RankedMap[]> {
	return getMaps(platform, undefined, onProgress);
}

export function getMapsFrom(
	platform: Platform,
	from: string,
	onProgress?: (loaded: number, total: number) => void,
): Promise<RankedMap[]> {
	return getMaps(platform, from, onProgress);
}
