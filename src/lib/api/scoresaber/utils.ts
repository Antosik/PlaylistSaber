import { applySsCurve } from '../../domain/pp-curve';
import type { SsLeaderboard } from './types';

const DIFF_NAMES: Record<number, string> = {
	1: 'Easy', 3: 'Normal', 5: 'Hard', 7: 'Expert', 9: 'ExpertPlus',
};

export function diffName(lb: SsLeaderboard): string {
	return DIFF_NAMES[lb.difficulty.difficulty] ?? lb.difficulty.difficultyRaw;
}

// map.pp = PP earned at 95% accuracy = mapBasePP (since applySsCurve(0.95) = 1.0)
// maxPP from API = mapBasePP × applySsCurve(1.0); if absent, estimate from stars
export function mapBasePP(lb: SsLeaderboard): number {
	if (lb.maxPP && lb.maxPP > 0) return lb.maxPP / applySsCurve(1.0);
	return lb.stars * 50;
}
