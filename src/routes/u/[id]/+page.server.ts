import { error } from '@sveltejs/kit';

import { getPlatformApi } from '$lib/api/platform';
import { deriveSkillRange } from '$lib/domain/skill-range';
import { Platform, DEFAULT_PLATFORM } from '$lib/types';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, url }) => {
	const platform =
		url.searchParams.get('platform') === Platform.BeatLeader
			? Platform.BeatLeader
			: DEFAULT_PLATFORM;

	const playerId = params.id ?? '';
	if (!playerId) throw error(400, 'No player ID');

	const api = getPlatformApi(platform);

	const streamed = (async () => {
		const rankedMaps = api.getRankedMaps();
		const [info, scores] = await Promise.all([api.getPlayer(playerId), api.getScores(playerId)]);
		const skillRange = deriveSkillRange(scores);
		return {
			playerName: info.name,
			playerAvatar: info.avatar,
			skillRange: skillRange ?? null,
			scores,
			rankedMaps,
		};
	})();

	return { playerId, platform, platformLabel: api.label, streamed };
};
