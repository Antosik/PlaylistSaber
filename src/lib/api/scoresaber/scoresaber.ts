import ky from 'ky';
import type { PlayerScore, RankedMap } from '../../types';
import { fetchPagesBatched, fetchPagesParallel } from '../utils';
import type { SsLeaderboard, SsPlayerInfo, SsPlayerScore } from './types';
import { diffName, mapBasePP } from './utils';

const api = ky.extend({ prefix: 'https://scoresaber.com/api', retry: 2, timeout: 10000 });

export async function getSsPlayer(id: string): Promise<SsPlayerInfo> {
	const data = await api.get(`player/${id}/full`).json<{ id: string; name: string; pp: number }>();
	return { id: data.id, name: data.name, pp: data.pp };
}

export async function getSsPlayerScores(
	id: string,
	onProgress?: (page: number, total: number) => void,
): Promise<PlayerScore[]> {
	const limit = 100;
	const first = await api
		.get(`player/${id}/scores`, { searchParams: { sort: 'top', limit, page: 1 } })
		.json<{ playerScores: SsPlayerScore[]; metadata: { total: number } }>();

	const totalPages = Math.ceil(first.metadata.total / limit);
	onProgress?.(1, totalPages);

	const all = await fetchPagesParallel(
		first.playerScores,
		totalPages,
		(p) =>
			api.get(`player/${id}/scores`, { searchParams: { sort: 'top', limit, page: p } })
				.json<{ playerScores: SsPlayerScore[] }>()
				.then((d) => d.playerScores),
		onProgress,
	);

	return all.map(({ score, leaderboard }) => ({
		songHash: leaderboard.songHash,
		difficulty: diffName(leaderboard),
		accuracy: leaderboard.maxScore > 0 ? score.baseScore / leaderboard.maxScore : 0,
		pp: score.pp,
		stars: leaderboard.stars,
	}));
}

export async function getAllSsRankedMaps(
	onProgress?: (loaded: number, total: number) => void,
): Promise<RankedMap[]> {
	const first = await api
		.get('leaderboards', { searchParams: { ranked: 'true', category: 3, sort: 0, page: 1 } })
		.json<{ leaderboards: SsLeaderboard[]; metadata: { total: number; itemsPerPage: number } }>();

	const perPage = first.metadata.itemsPerPage || 14;
	const totalPages = Math.ceil(first.metadata.total / perPage);
	onProgress?.(first.leaderboards.length, first.metadata.total);

	const all = await fetchPagesBatched(
		first.leaderboards,
		first.metadata.total,
		totalPages,
		(p) =>
			api.get('leaderboards', { searchParams: { ranked: 'true', category: 3, sort: 0, page: p } })
				.json<{ leaderboards: SsLeaderboard[] }>()
				.then((d) => d.leaderboards),
		onProgress,
	);

	return all.map((lb) => ({
		songHash: lb.songHash,
		songName: lb.songName,
		artist: lb.songAuthorName,
		difficulty: diffName(lb),
		stars: lb.stars,
		pp: mapBasePP(lb),
		leaderboardId: String(lb.id),
	}));
}
