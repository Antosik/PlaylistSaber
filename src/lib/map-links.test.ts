import { describe, it, expect } from 'vitest';
import { getLeaderboardUrl, getBeatSaverUrl, getOneClickUrl } from '$lib/map-links';

describe('getLeaderboardUrl', () => {
	it('returns ScoreSaber leaderboard URL for platform scoresaber', () => {
		expect(getLeaderboardUrl('1234', 'scoresaber')).toBe(
			'https://scoresaber.com/leaderboard/1234'
		);
	});

	it('returns BeatLeader leaderboard URL for platform beatleader', () => {
		expect(getLeaderboardUrl('5678', 'beatleader')).toBe(
			'https://beatleader.com/leaderboard/global/5678'
		);
	});

	it('ScoreSaber URL starts with correct base', () => {
		const url = getLeaderboardUrl('9999', 'scoresaber');
		expect(url.startsWith('https://scoresaber.com/leaderboard/')).toBe(true);
	});

	it('BeatLeader URL starts with correct base', () => {
		const url = getLeaderboardUrl('9999', 'beatleader');
		expect(url.startsWith('https://beatleader.com/leaderboard/')).toBe(true);
	});

	it('includes the leaderboard ID in the URL', () => {
		expect(getLeaderboardUrl('abc123', 'scoresaber')).toContain('abc123');
		expect(getLeaderboardUrl('abc123', 'beatleader')).toContain('abc123');
	});
});

describe('getBeatSaverUrl', () => {
	it('returns correct BeatSaver page URL', () => {
		expect(getBeatSaverUrl('abc1')).toBe('https://beatsaver.com/maps/abc1');
	});

	it('URL starts with BeatSaver base', () => {
		expect(getBeatSaverUrl('xyz9').startsWith('https://beatsaver.com/maps/')).toBe(true);
	});

	it('includes the bsKey in the URL', () => {
		expect(getBeatSaverUrl('deadbeef')).toContain('deadbeef');
	});
});

describe('getOneClickUrl', () => {
	it('returns correct one-click install URL', () => {
		expect(getOneClickUrl('abc1')).toBe('beatsaver://abc1');
	});

	it('URL uses beatsaver:// protocol', () => {
		expect(getOneClickUrl('abc1').startsWith('beatsaver://')).toBe(true);
	});

	it('includes the bsKey in the URL', () => {
		expect(getOneClickUrl('deadbeef')).toContain('deadbeef');
	});

	it('does NOT use http:// or https:// protocol', () => {
		const url = getOneClickUrl('abc1');
		expect(url.startsWith('http')).toBe(false);
	});
});
