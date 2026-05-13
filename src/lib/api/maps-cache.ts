import type { RankedMap } from '../types';
import { Platform } from '../types';

const DATA_URL: Record<Platform, string> = {
	[Platform.ScoreSaber]: '/data/ss-maps.json',
	[Platform.BeatLeader]: '/data/bl-maps.json',
};

const cache = new Map<Platform, RankedMap[]>();

export async function getRankedMaps(
	platform: Platform,
	kitFetch: typeof fetch = fetch,
): Promise<RankedMap[]> {
	if (cache.has(platform)) {
		return cache.get(platform)!;
	}
	
	const res = await kitFetch(DATA_URL[platform]);
	const maps: RankedMap[] = await res.json();
	cache.set(platform, maps);
	return maps;
}
