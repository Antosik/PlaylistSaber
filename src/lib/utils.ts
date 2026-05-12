/** Extracts a numeric player ID from a raw string or profile URL. */
export function extractId(raw: string): string {
	const m = raw.match(/(\d{17,})/);
	return m ? m[1] : raw.trim();
}
