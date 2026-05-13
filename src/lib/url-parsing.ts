export type ParseResult =
	| { type: 'resolved'; id: string }
	| { type: 'error'; message: string };

export function parsePlayerInput(input: string): ParseResult {
	const s = input.trim();

	if (/^\d{17}$/.test(s)) return { type: 'resolved', id: s };

	let m = s.match(/^https?:\/\/steamcommunity\.com\/profiles\/(\d{17})/);
	if (m) return { type: 'resolved', id: m[1] };

	m = s.match(/^https?:\/\/scoresaber\.com\/u\/(\d{17})/);
	if (m) return { type: 'resolved', id: m[1] };

	m = s.match(/^https?:\/\/beatleader\.com\/u\/(\d{17})/);
	if (m) return { type: 'resolved', id: m[1] };

	if (/^https?:\/\/steamcommunity\.com\/id\//.test(s))
		return { type: 'error', message: 'Steam vanity URLs are not supported — use your numerical Steam ID or a ScoreSaber/BeatLeader profile URL instead.' };

	return {
		type: 'error',
		message: 'Unrecognized format. Enter a 17-digit Steam ID or a profile URL from Steam, ScoreSaber, or BeatLeader.',
	};
}
