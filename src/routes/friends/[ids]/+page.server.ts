import { error } from '@sveltejs/kit';

import { getPlatformApi } from '$lib/api/platform';
import { findCoveringSongs } from '$lib/domain/coverage';
import { deriveSkillRange } from '$lib/domain/skill-range';
import { Platform, DEFAULT_PLATFORM } from '$lib/types';
import type { PlayerSlot, SkillRange } from '$lib/types';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, url }) => {
	const platform =
		url.searchParams.get('platform') === Platform.BeatLeader
			? Platform.BeatLeader
			: DEFAULT_PLATFORM;

	const playerIds = Array.from(new Set((params.ids ?? '').split(',').filter(Boolean)));
	if (playerIds.length === 0) throw error(400, 'No player IDs');

	const api = getPlatformApi(platform);

	const streamed = (async () => {
		const rankedMaps = api.getRankedMaps();
		const playerResults = await Promise.all(
			playerIds.map((id) => Promise.all([api.getScores(id), api.getPlayer(id)]))
		);

		const slots: PlayerSlot[] = [];
		const players: Array<{ id: string; name: string; avatar?: string; skillRange?: SkillRange }> =
			[];

		for (let i = 0; i < playerIds.length; i++) {
			const [scores, pinfo] = playerResults[i];
			const skillRange = deriveSkillRange(scores);
			if (skillRange) {
				slots.push({ label: pinfo.name, min: skillRange.min, max: skillRange.max });
				players.push({ id: playerIds[i], name: pinfo.name, avatar: pinfo.avatar, skillRange });
			}
		}

		const results = findCoveringSongs(rankedMaps, slots);
		return { players, playerCount: slots.length, results, slots };
	})();

	return { platform, platformLabel: api.label, playerIds, streamed };
};
