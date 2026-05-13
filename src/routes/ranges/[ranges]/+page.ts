import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getPlatformApi } from '$lib/api/platform';
import { findCoveringSongs } from '$lib/domain/coverage';
import { addHistoryEntry } from '$lib/history';
import { Platform, DEFAULT_PLATFORM } from '$lib/types';
import type { PlayerSlot } from '$lib/types';

export const load: PageLoad = async ({ params, url, fetch }) => {
	const platform =
		url.searchParams.get('platform') === Platform.BeatLeader ? Platform.BeatLeader : DEFAULT_PLATFORM;

	const tokens = (params.ranges ?? '').split(',').filter(Boolean);
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
	const rankedMaps = await api.getRankedMaps(fetch);
	const results = findCoveringSongs(rankedMaps, slots);

	addHistoryEntry({ feature: 'ranges', ranges: tokens });

	return {
		platformLabel: api.label,
		slotCount: slots.length,
		results,
		slots,
	};
};
