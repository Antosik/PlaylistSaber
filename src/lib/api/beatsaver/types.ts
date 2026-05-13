export type BeatSaverLeaderboard = 'ScoreSaber' | 'BeatLeader';

export type BeatSaverDiff = {
	characteristic?: string;
	difficulty?: string;
	stars?: number;
};

export type BeatSaverVersion = {
	hash?: string;
	diffs?: BeatSaverDiff[];
};

export type BeatSaverDoc = {
	id?: string;
	metadata?: {
		songName?: string;
		songAuthorName?: string;
	};
	versions?: BeatSaverVersion[];
};

export type BeatSaverSearchResponse = {
	docs: BeatSaverDoc[];
	info: {
		total: number;
		pages: number;
	};
};
