import { Platform } from '../types';

import { getBlPlayer, getBlPlayerScores } from './beatleader';
import { getRankedMaps } from './maps-cache';
import { getSsPlayer, getSsPlayerScores } from './scoresaber';

export function getPlatformApi(platform: Platform) {
	return {
		getPlayer: platform === Platform.ScoreSaber ? getSsPlayer : getBlPlayer,
		getScores: platform === Platform.ScoreSaber ? getSsPlayerScores : getBlPlayerScores,
		getRankedMaps: (kitFetch?: typeof fetch) => getRankedMaps(platform, kitFetch ?? fetch),
		label: platform === Platform.ScoreSaber ? 'ScoreSaber' : 'BeatLeader',
	};
}
