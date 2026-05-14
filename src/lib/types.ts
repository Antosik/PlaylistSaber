export type ValueOf<T> = T[keyof T];

export const Platform = { ScoreSaber: 'scoresaber', BeatLeader: 'beatleader' } as const;
export type Platform = ValueOf<typeof Platform>;

export const DEFAULT_PLATFORM: Platform = Platform.ScoreSaber;

export const MapMode = { New: 'new', Improvable: 'improvable' } as const;
export type MapMode = ValueOf<typeof MapMode>;

export type RankedMap = {
	id: string;
	songHash: string;
	songName: string;
	artist: string;
	difficulty: string;
	stars: number;
	pp: number;
};

export type PlayerScore = {
	songHash: string;
	difficulty: string;
	accuracy: number; // 0–1
	pp: number;
	stars?: number; // optional - required for skill-range, not for pp-improvement
};

export type PlayerSlot = {
	label: string;
	min: number | null; // null = no lower bound
	max: number | null; // null = no upper bound
};

export type SkillRange = { min: number; max: number };

export type CoverageResult = {
	songHash: string;
	songName: string;
	artist: string;
	matches: Array<{ slotIndex: number; difficulty: string; stars: number; pp: number }>;
};

export type ImprovableMap = RankedMap & {
	currentAccuracy: number;
	currentPP: number;
	potentialGain: number;
};

export type PPImprovement = {
	newMaps: RankedMap[];
	improvableMaps: ImprovableMap[];
};
