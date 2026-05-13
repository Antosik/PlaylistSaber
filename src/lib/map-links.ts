export function getBeatSaverUrl(id: string): string {
	return `https://beatsaver.com/maps/${id}`;
}

export function getOneClickUrl(id: string): string {
	return `beatsaver://${id}`;
}
