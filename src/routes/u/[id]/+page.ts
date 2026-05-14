import { error } from '@sveltejs/kit';

import { getPlatformApi } from '$lib/api/platform';
import { deriveSkillRange } from '$lib/domain/skill-range';
import { addHistoryEntry } from '$lib/history';
import { Platform, DEFAULT_PLATFORM } from '$lib/types';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, fetch }) => {
	const platform =
		url.searchParams.get('platform') === Platform.BeatLeader
			? Platform.BeatLeader
			: DEFAULT_PLATFORM;

	const playerId = params.id ?? '';
	if (!playerId) throw error(400, 'No player ID');

	const api = getPlatformApi(platform);

	const [info, scores, rankedMaps] = await Promise.all([
		api.getPlayer(playerId),
		api.getScores(playerId),
		api.getRankedMaps(fetch),
	]);
	const skillRange = deriveSkillRange(scores);

	addHistoryEntry({ feature: 'pp-improver', playerId, playerName: info.name });

	return {
		playerName: info.name,
		platformLabel: api.label,
		platform,
		skillRange: skillRange ?? null,
		scores,
		rankedMaps,
	};
};
