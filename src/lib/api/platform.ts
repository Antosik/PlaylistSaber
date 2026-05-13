import { getSsPlayer, getSsPlayerScores } from './scoresaber';
import { getBlPlayer, getBlPlayerScores } from './beatleader';
import { getRankedMaps } from './maps-cache';
import { Platform } from '../types';

export function getPlatformApi(platform: Platform) {
	return {
		getPlayer: platform === Platform.ScoreSaber ? getSsPlayer : getBlPlayer,
		getScores: platform === Platform.ScoreSaber ? getSsPlayerScores : getBlPlayerScores,
		getRankedMaps: (kitFetch?: typeof fetch) => getRankedMaps(platform, kitFetch ?? fetch),
		label: platform === Platform.ScoreSaber ? 'ScoreSaber' : 'BeatLeader',
	};
}
