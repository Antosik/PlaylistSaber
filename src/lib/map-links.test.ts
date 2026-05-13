import { describe, it, expect } from 'vitest';
import { getBeatSaverUrl, getOneClickUrl } from '$lib/map-links';

describe('getBeatSaverUrl', () => {
	it('returns correct BeatSaver page URL', () => {
		expect(getBeatSaverUrl('abc1')).toBe('https://beatsaver.com/maps/abc1');
	});

	it('URL starts with BeatSaver base', () => {
		expect(getBeatSaverUrl('xyz9').startsWith('https://beatsaver.com/maps/')).toBe(true);
	});

	it('includes the id in the URL', () => {
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

	it('includes the id in the URL', () => {
		expect(getOneClickUrl('deadbeef')).toContain('deadbeef');
	});

	it('does NOT use http:// or https:// protocol', () => {
		const url = getOneClickUrl('abc1');
		expect(url.startsWith('http')).toBe(false);
	});
});
