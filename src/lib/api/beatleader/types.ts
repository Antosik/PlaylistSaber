export type BlPlayerInfo = { id: string; name: string; pp: number };

export interface BlDifficulty {
	difficultyName: string;
	stars: number;
}

export interface BlSong {
	hash: string;
	name: string;
	author: string;
}

export interface BlLeaderboard {
	id: string;
	song: BlSong;
	difficulty: BlDifficulty;
}

export interface BlPlayerScore {
	accuracy: number;
	pp: number;
	weight: number;
	leaderboard: BlLeaderboard;
}
