import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

import type { Platform } from './types';

/* eslint-disable svelte/no-navigation-without-resolve -- pathname from resolve(); rule does not see it inside template string passed to goto */

/** Client navigation with `paths.base`-aware pathname + `platform` query. */
export function gotoPpImprovement(playerId: string, platform: Platform) {
	return goto(`${resolve('/u/[id]', { id: playerId })}?${new URLSearchParams({ platform })}`);
}

export function gotoFriendsSearch(playerIds: string[], platform: Platform) {
	return goto(
		`${resolve('/friends/[ids]', { ids: playerIds.join(',') })}?${new URLSearchParams({ platform })}`
	);
}

export function gotoRangesSearch(rangeStrs: string[], platform: Platform) {
	return goto(
		`${resolve('/ranges/[ranges]', { ranges: rangeStrs.join(',') })}?${new URLSearchParams({
			platform,
		})}`
	);
}
