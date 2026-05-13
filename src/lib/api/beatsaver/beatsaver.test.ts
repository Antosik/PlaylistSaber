import { describe, it, expect } from 'vitest';

import { Platform } from '../../types';

import { flattenBeatSaverMaps, getBeatSaverLeaderboard, mergeRankedMaps } from './beatsaver';

const beatSaverDoc = {
	id: '4ee15',
	metadata: {
		songName: 'TOGETHER',
		songAuthorName: 'Kaneda7',
	},
	versions: [
		{
			hash: '29c813fc4eee39117f930bddddf4d36af57ccf11',
			diffs: [
				{ characteristic: 'Standard', difficulty: 'Expert', stars: 5.35 },
				{ characteristic: 'Standard', difficulty: 'ExpertPlus', stars: 8.35 },
				{ characteristic: 'OneSaber', difficulty: 'Expert', stars: 6.1 },
				{ characteristic: 'Standard', difficulty: 'Hard' },
			],
		},
	],
};

describe('getBeatSaverLeaderboard', () => {
	it('maps ScoreSaber platform to BeatSaver leaderboard name', () => {
		expect(getBeatSaverLeaderboard(Platform.ScoreSaber)).toBe('ScoreSaber');
	});

	it('maps BeatLeader platform to BeatSaver leaderboard name', () => {
		expect(getBeatSaverLeaderboard(Platform.BeatLeader)).toBe('BeatLeader');
	});
});

describe('flattenBeatSaverMaps', () => {
	it('flattens standard ranked diffs into ScoreSaber RankedMap entries', () => {
		const maps = flattenBeatSaverMaps([beatSaverDoc], Platform.ScoreSaber);

		expect(maps).toEqual([
			{
				id: '4ee15',
				songHash: '29c813fc4eee39117f930bddddf4d36af57ccf11',
				songName: 'TOGETHER',
				artist: 'Kaneda7',
				difficulty: 'Expert',
				stars: 5.35,
				pp: 267.5,
			},
			{
				id: '4ee15',
				songHash: '29c813fc4eee39117f930bddddf4d36af57ccf11',
				songName: 'TOGETHER',
				artist: 'Kaneda7',
				difficulty: 'ExpertPlus',
				stars: 8.35,
				pp: 417.5,
			},
		]);
	});

	it('uses BeatLeader pp formula for BeatLeader maps', () => {
		const [map] = flattenBeatSaverMaps([beatSaverDoc], Platform.BeatLeader);

		expect(map.pp).toBeCloseTo(5.35 * 42.114296);
	});

	it('skips docs without a current version hash', () => {
		const maps = flattenBeatSaverMaps([{ ...beatSaverDoc, versions: [] }], Platform.ScoreSaber);

		expect(maps).toEqual([]);
	});
});

describe('mergeRankedMaps', () => {
	it('adds new maps and replaces existing maps by songHash and difficulty', () => {
		const existing = [
			{
				id: 'old',
				songHash: 'aaa',
				songName: 'Old',
				artist: 'A',
				difficulty: 'Expert',
				stars: 5,
				pp: 250,
			},
			{
				id: 'keep',
				songHash: 'bbb',
				songName: 'Keep',
				artist: 'B',
				difficulty: 'Hard',
				stars: 3,
				pp: 150,
			},
		];
		const delta = [
			{
				id: 'new',
				songHash: 'aaa',
				songName: 'Updated',
				artist: 'A',
				difficulty: 'Expert',
				stars: 6,
				pp: 300,
			},
			{
				id: 'add',
				songHash: 'ccc',
				songName: 'Added',
				artist: 'C',
				difficulty: 'ExpertPlus',
				stars: 9,
				pp: 450,
			},
		];

		expect(mergeRankedMaps(existing, delta)).toEqual([
			{
				id: 'new',
				songHash: 'aaa',
				songName: 'Updated',
				artist: 'A',
				difficulty: 'Expert',
				stars: 6,
				pp: 300,
			},
			{
				id: 'keep',
				songHash: 'bbb',
				songName: 'Keep',
				artist: 'B',
				difficulty: 'Hard',
				stars: 3,
				pp: 150,
			},
			{
				id: 'add',
				songHash: 'ccc',
				songName: 'Added',
				artist: 'C',
				difficulty: 'ExpertPlus',
				stars: 9,
				pp: 450,
			},
		]);
	});
});
