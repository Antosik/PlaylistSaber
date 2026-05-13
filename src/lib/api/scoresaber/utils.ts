import type { SsLeaderboard } from './types';

const DIFF_NAMES: Record<number, string> = {
	1: 'Easy',
	3: 'Normal',
	5: 'Hard',
	7: 'Expert',
	9: 'ExpertPlus',
};

export function diffName(lb: SsLeaderboard): string {
	return DIFF_NAMES[lb.difficulty.difficulty] ?? lb.difficulty.difficultyRaw;
}
