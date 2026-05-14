export type SsPlayerInfo = { id: string; name: string; pp: number; avatar?: string };

export interface SsLeaderboard {
	id: number;
	songHash: string;
	songName: string;
	songAuthorName: string;
	difficulty: { difficulty: number; difficultyRaw: string };
	maxScore: number;
	maxPP?: number;
	stars: number;
}

export interface SsPlayerScore {
	score: { pp: number; weight: number; baseScore: number };
	leaderboard: SsLeaderboard;
}
