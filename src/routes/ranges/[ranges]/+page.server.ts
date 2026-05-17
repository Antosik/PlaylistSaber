import { error } from '@sveltejs/kit';

import { getPlatformApi } from '$lib/api/platform';
import { findCoveringSongs } from '$lib/domain/coverage';
import { Platform, DEFAULT_PLATFORM } from '$lib/types';
import type { PlayerSlot } from '$lib/types';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, url }) => {
	const platform =
		url.searchParams.get('platform') === Platform.BeatLeader
			? Platform.BeatLeader
			: DEFAULT_PLATFORM;

	const tokens = Array.from(new Set((params.ranges ?? '').split(',').filter(Boolean)));
	if (tokens.length === 0) throw error(400, 'No ranges');

	const rangeRegex = /^(\d+(?:\.\d+)?)?-(\d+(?:\.\d+)?)?$/;
	const slots: PlayerSlot[] = tokens.map((t, i) => {
		const m = t.match(rangeRegex);
		const minStr = m?.[1] ?? '';
		const maxStr = m?.[2] ?? '';
		return {
			label: i === 0 ? 'You' : `Friend ${i}`,
			min: minStr !== '' ? parseFloat(minStr) : null,
			max: maxStr !== '' ? parseFloat(maxStr) : null,
		};
	});

	const api = getPlatformApi(platform);

	const streamed = (async () => {
		const results = findCoveringSongs(api.getRankedMaps(), slots);
		return { results };
	})();

	return { platformLabel: api.label, slotCount: slots.length, slots, tokens, streamed };
};
