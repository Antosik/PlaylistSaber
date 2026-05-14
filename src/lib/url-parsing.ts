export type ParseResult = { type: 'resolved'; id: string } | { type: 'error'; message: string };

/** Extracts a numeric player ID from a raw string or profile URL. */
export function extractId(raw: string): string {
	const m = raw.match(/(\d{17,})/);
	return m ? m[1] : raw.trim();
}

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
		return {
			type: 'error',
			message:
				'Steam vanity URLs are not supported — use your numerical Steam ID or a ScoreSaber/BeatLeader profile URL instead.',
		};

	return {
		type: 'error',
		message:
			'Unrecognized format. Enter a 17-digit Steam ID or a profile URL from Steam, ScoreSaber, or BeatLeader.',
	};
}

/** Empty when blank or parsed OK; otherwise the same message as parsePlayerInput errors. */
export function profileInputValidationMessage(input: string): string {
	const t = input.trim();
	if (!t) return '';
	const p = parsePlayerInput(t);
	return p.type === 'error' ? p.message : '';
}
