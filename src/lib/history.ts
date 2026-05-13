export type HistoryEntry =
	| { feature: 'pp-improver'; playerId: string; timestamp: number }
	| { feature: 'with-friends'; playerIds: string[]; timestamp: number }
	| { feature: 'ranges'; ranges: string[]; timestamp: number };

function storageKey(feature: HistoryEntry['feature']): string {
	return `history_${feature}`;
}

export function getHistory(feature: HistoryEntry['feature']): HistoryEntry[] {
	try {
		const raw = localStorage.getItem(storageKey(feature));
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
	} catch {
		return [];
	}
}

function save(feature: HistoryEntry['feature'], entries: HistoryEntry[]): void {
	try {
		localStorage.setItem(storageKey(feature), JSON.stringify(entries));
	} catch {
		/* ignore storage failures */
	}
}

export type HistoryInput =
	| { feature: 'pp-improver'; playerId: string }
	| { feature: 'with-friends'; playerIds: string[] }
	| { feature: 'ranges'; ranges: string[] };

export function addHistoryEntry(entry: HistoryInput): void {
	const existing = getHistory(entry.feature);
	const newEntry = { ...entry, timestamp: Date.now() } as HistoryEntry;

	let filtered: HistoryEntry[];
	switch (entry.feature) {
		case 'pp-improver': {
			const pid = entry.playerId;
			filtered = existing.filter((e) => e.feature !== 'pp-improver' || e.playerId !== pid);
			break;
		}
		case 'with-friends': {
			const ids = JSON.stringify(entry.playerIds);
			filtered = existing.filter(
				(e) => e.feature !== 'with-friends' || JSON.stringify(e.playerIds) !== ids
			);
			break;
		}
		case 'ranges': {
			const ranges = JSON.stringify(entry.ranges);
			filtered = existing.filter(
				(e) => e.feature !== 'ranges' || JSON.stringify(e.ranges) !== ranges
			);
			break;
		}
	}

	save(entry.feature, [newEntry, ...filtered].slice(0, 5));
}

export function removeHistoryEntry(feature: HistoryEntry['feature'], index: number): void {
	const entries = getHistory(feature);
	entries.splice(index, 1);
	save(feature, entries);
}

export function clearHistory(feature: HistoryEntry['feature']): void {
	try {
		localStorage.removeItem(storageKey(feature));
	} catch {
		/* ignore storage failures */
	}
}
