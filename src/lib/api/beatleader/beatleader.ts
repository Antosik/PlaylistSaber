import ky from 'ky';

import type { PlayerScore } from '../../types';
import { fetchPagesConcurrentLimited } from '../utils';

import type { BlPlayerInfo, BlPlayerScore } from './types';

const api = ky.extend({ prefix: 'https://api.beatleader.xyz', retry: 2, timeout: 10000, fetch });

export async function getBlPlayer(id: string): Promise<BlPlayerInfo> {
	const data = await api
		.get(`player/${id}`)
		.json<{ id: string; name: string; pp: number; avatar?: string }>();
	return { id: data.id, name: data.name, pp: data.pp, avatar: data.avatar };
}

export async function getBlPlayerScores(
	id: string,
	onProgress?: (page: number, total: number) => void
): Promise<PlayerScore[]> {
	const count = 100;
	const first = await api
		.get(`player/${id}/scores`, { searchParams: { sortBy: 'pp', order: 'desc', count, page: 1 } })
		.json<{ data: BlPlayerScore[]; metadata: { total: number } }>();

	const totalPages = Math.ceil(first.metadata.total / count);
	onProgress?.(1, totalPages);

	const all = await fetchPagesConcurrentLimited(
		first.data,
		totalPages,
		(p) =>
			api
				.get(`player/${id}/scores`, {
					searchParams: { sortBy: 'pp', order: 'desc', count, page: p },
				})
				.json<{ data: BlPlayerScore[] }>()
				.then((d) => d.data),
		onProgress
	);

	return all.map((s) => ({
		songHash: s.leaderboard.song.hash,
		difficulty: s.leaderboard.difficulty.difficultyName,
		accuracy: s.accuracy, // BL provides accuracy directly (0–1)
		pp: s.pp,
		stars: s.leaderboard.difficulty.stars,
	}));
}
