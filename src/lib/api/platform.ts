import { getSsPlayer, getSsPlayerScores, getAllSsRankedMaps } from './scoresaber';
import { getBlPlayer, getBlPlayerScores, getAllBlRankedMaps } from './beatleader';
import { Platform } from '../types';

export function getPlatformApi(platform: Platform) {
	return {
		getPlayer:     platform === Platform.ScoreSaber ? getSsPlayer     : getBlPlayer,
		getScores:     platform === Platform.ScoreSaber ? getSsPlayerScores : getBlPlayerScores,
		getRankedMaps: platform === Platform.ScoreSaber ? getAllSsRankedMaps : getAllBlRankedMaps,
		label:         platform === Platform.ScoreSaber ? 'ScoreSaber'    : 'BeatLeader',
	};
}
