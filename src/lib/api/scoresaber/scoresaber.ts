import ky from 'ky';

import type { PlayerScore } from '../../types';
import { fetchPagesConcurrentLimited } from '../utils';

import type { SsPlayerInfo, SsPlayerScore } from './types';
import { diffName } from './utils';

const api = ky.extend({ prefix: 'https://scoresaber.com/api', retry: 2, timeout: 10000 });

export async function getSsPlayer(id: string): Promise<SsPlayerInfo> {
	const data = await api.get(`player/${id}/full`).json<{ id: string; name: string; pp: number }>();
	return { id: data.id, name: data.name, pp: data.pp };
}

export async function getSsPlayerScores(
	id: string,
	onProgress?: (page: number, total: number) => void
): Promise<PlayerScore[]> {
	const limit = 100;
	const first = await api
		.get(`player/${id}/scores`, { searchParams: { sort: 'top', limit, page: 1 } })
		.json<{ playerScores: SsPlayerScore[]; metadata: { total: number } }>();

	const totalPages = Math.ceil(first.metadata.total / limit);
	onProgress?.(1, totalPages);

	const all = await fetchPagesConcurrentLimited(
		first.playerScores,
		totalPages,
		(p) =>
			api
				.get(`player/${id}/scores`, { searchParams: { sort: 'top', limit, page: p } })
				.json<{ playerScores: SsPlayerScore[] }>()
				.then((d) => d.playerScores),
		onProgress
	);

	return all.map(({ score, leaderboard }) => ({
		songHash: leaderboard.songHash,
		difficulty: diffName(leaderboard),
		accuracy: leaderboard.maxScore > 0 ? score.baseScore / leaderboard.maxScore : 0,
		pp: score.pp,
		stars: leaderboard.stars,
	}));
}
