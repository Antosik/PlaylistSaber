import blMaps from '../../../static/data/bl-maps.json';
import ssMaps from '../../../static/data/ss-maps.json';
import type { RankedMap } from '../types';
import { Platform } from '../types';

const DATA: Record<Platform, RankedMap[]> = {
	[Platform.ScoreSaber]: ssMaps as RankedMap[],
	[Platform.BeatLeader]: blMaps as RankedMap[],
};

export function getRankedMaps(platform: Platform): RankedMap[] {
	return DATA[platform];
}
