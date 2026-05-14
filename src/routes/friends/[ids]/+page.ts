import { error } from '@sveltejs/kit';

import { getPlatformApi } from '$lib/api/platform';
import { findCoveringSongs } from '$lib/domain/coverage';
import { deriveSkillRange } from '$lib/domain/skill-range';
import { addHistoryEntry } from '$lib/history';
import { Platform, DEFAULT_PLATFORM } from '$lib/types';
import type { PlayerSlot, SkillRange } from '$lib/types';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, fetch }) => {
	const platform =
		url.searchParams.get('platform') === Platform.BeatLeader
			? Platform.BeatLeader
			: DEFAULT_PLATFORM;

	const playerIds = Array.from(new Set((params.ids ?? '').split(',').filter(Boolean)));
	if (playerIds.length === 0) throw error(400, 'No player IDs');

	const api = getPlatformApi(platform);
	const slots: PlayerSlot[] = [];

	const players: Array<{ id: string; name: string; avatar?: string; skillRange?: SkillRange }> = [];

	for (let i = 0; i < playerIds.length; i++) {
		const id = playerIds[i];
		const [scores, pinfo] = await Promise.all([api.getScores(id), api.getPlayer(id)]);
		const skillRange = deriveSkillRange(scores);
		if (skillRange) {
			slots.push({ label: pinfo.name, min: skillRange.min, max: skillRange.max });
			players.push({
				id,
				name: pinfo.name,
				avatar: pinfo.avatar,
				skillRange,
			});
		}
	}

	const rankedMaps = await api.getRankedMaps(fetch);
	const results = findCoveringSongs(rankedMaps, slots);

	addHistoryEntry({ feature: 'with-friends', playerIds, playerNames: players.map((p) => p.name) });

	return {
		platform: platform,
		platformLabel: api.label,
		players,
		playerCount: slots.length,
		results,
		slots,
	};
};
