import ky from 'ky';
import type { PlayerScore, RankedMap } from '../../types';
import { fetchPagesBatched, fetchPagesParallel } from '../utils';
import type { BlLeaderboard, BlPlayerInfo, BlPlayerScore, BlSong, BlDifficulty } from './types';
import { PP_PER_STAR } from './utils';

const api = ky.extend({ prefix: 'https://api.beatleader.xyz', retry: 2, timeout: 10000 });

export async function getBlPlayer(id: string): Promise<BlPlayerInfo> {
	const data = await api.get(`player/${id}`).json<{ id: string; name: string; pp: number }>();
	return { id: data.id, name: data.name, pp: data.pp };
}

export async function getBlPlayerScores(
	id: string,
	onProgress?: (page: number, total: number) => void,
): Promise<PlayerScore[]> {
	const count = 100;
	const first = await api
		.get(`player/${id}/scores`, { searchParams: { sortBy: 'pp', order: 'desc', count, page: 1 } })
		.json<{ data: BlPlayerScore[]; metadata: { total: number } }>();

	const totalPages = Math.ceil(first.metadata.total / count);
	onProgress?.(1, totalPages);

	const all = await fetchPagesParallel(
		first.data,
		totalPages,
		(p) =>
			api.get(`player/${id}/scores`, { searchParams: { sortBy: 'pp', order: 'desc', count, page: p } })
				.json<{ data: BlPlayerScore[] }>()
				.then((d) => d.data),
		onProgress,
	);

	return all.map((s) => ({
		songHash: s.leaderboard.song.hash,
		difficulty: s.leaderboard.difficulty.difficultyName,
		accuracy: s.accuracy, // BL provides accuracy directly (0–1)
		pp: s.pp,
		stars: s.leaderboard.difficulty.stars,
	}));
}

export async function getAllBlRankedMaps(
	onProgress?: (loaded: number, total: number) => void,
): Promise<RankedMap[]> {
	const count = 100;
	type BlMapEntry = { id: string; song: BlSong; difficulty: BlDifficulty };
	const first = await api
		.get('leaderboards', { searchParams: { type: 'ranked', sortBy: 'stars', order: 'desc', count, page: 1 } })
		.json<{ data: BlMapEntry[]; metadata: { total: number } }>();

	const totalPages = Math.ceil(first.metadata.total / count);
	onProgress?.(first.data.length, first.metadata.total);

	const all = await fetchPagesBatched(
		first.data,
		first.metadata.total,
		totalPages,
		(p) =>
			api.get('leaderboards', { searchParams: { type: 'ranked', sortBy: 'stars', order: 'desc', count, page: p } })
				.json<{ data: BlMapEntry[] }>()
				.then((d) => d.data),
		onProgress,
	);

	return all.map((lb) => ({
		songHash: lb.song.hash,
		songName: lb.song.name,
		artist: lb.song.author,
		difficulty: lb.difficulty.difficultyName,
		stars: lb.difficulty.stars,
		pp: lb.difficulty.stars * PP_PER_STAR,
	}));
}
