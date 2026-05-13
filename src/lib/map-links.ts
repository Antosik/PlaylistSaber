export type MapPlatform = 'scoresaber' | 'beatleader';

export function getLeaderboardUrl(leaderboardId: string, platform: MapPlatform): string {
	return platform === 'beatleader'
		? `https://beatleader.com/leaderboard/global/${leaderboardId}`
		: `https://scoresaber.com/leaderboard/${leaderboardId}`;
}

export function getBeatSaverUrl(bsKey: string): string {
	return `https://beatsaver.com/maps/${bsKey}`;
}

export function getOneClickUrl(bsKey: string): string {
	return `beatsaver://${bsKey}`;
}
