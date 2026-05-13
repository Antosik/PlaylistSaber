import { describe, it, expect, beforeEach } from 'vitest';

import { addHistoryEntry, getHistory, removeHistoryEntry, clearHistory } from '$lib/history';

// #region localStorage mock
const createLocalStorageMock = () => {
	let store: Record<string, string> = {};
	return {
		getItem: (key: string) => store[key] ?? null,
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		},
		get length() {
			return Object.keys(store).length;
		},
		key: (index: number) => Object.keys(store)[index] ?? null,
	};
};

const localStorageMock = createLocalStorageMock();
Object.defineProperty(globalThis, 'localStorage', {
	value: localStorageMock,
	writable: true,
});

beforeEach(() => {
	localStorageMock.clear();
});
// #endregion localStorage mock

// #region PP Improver history
describe('PP Improver history', () => {
	it('Adding an entry saves it and makes it retrievable via getHistory', () => {
		addHistoryEntry({ feature: 'pp-improver', playerId: '76561198082215374' });
		const history = getHistory('pp-improver');
		expect(history).toHaveLength(1);
		expect(history[0]).toMatchObject({ feature: 'pp-improver', playerId: '76561198082215374' });
		expect(typeof history[0].timestamp).toBe('number');
	});

	it('Empty history returns empty array', () => {
		expect(getHistory('pp-improver')).toEqual([]);
	});

	it('Adding same playerId again moves existing entry to top with updated timestamp', () => {
		addHistoryEntry({ feature: 'pp-improver', playerId: '76561198082215374' });
		const firstTimestamp = getHistory('pp-improver')[0].timestamp;

		// Slight delay to ensure timestamp differs
		const laterTimestamp = firstTimestamp + 1000;
		// Simulate time passing by overriding Date.now temporarily
		const originalNow = Date.now;
		Date.now = () => laterTimestamp;

		addHistoryEntry({ feature: 'pp-improver', playerId: '76561198082215374' });
		Date.now = originalNow;

		const history = getHistory('pp-improver');
		expect(history).toHaveLength(1);
		expect(history[0].timestamp).toBe(laterTimestamp);
	});

	it('History is capped at 5: adding a 6th entry drops the oldest', () => {
		for (let i = 1; i <= 6; i++) {
			addHistoryEntry({ feature: 'pp-improver', playerId: `7656119808221537${i}` });
		}
		const history = getHistory('pp-improver');
		expect(history).toHaveLength(5);
		// Oldest (first added) should be gone — id ending in '1'
		const ids = history.map((e) => (e as { playerId: string }).playerId);
		expect(ids).not.toContain('76561198082215371');
	});

	it('getHistory returns at most 5 entries even if localStorage has 6', () => {
		// Manually stuff 6 entries into localStorage to simulate a corrupt state
		const entries = Array.from({ length: 6 }, (_, i) => ({
			feature: 'pp-improver' as const,
			playerId: `7656119808221537${i + 1}`,
			timestamp: Date.now() + i,
		}));
		localStorage.setItem('history_pp-improver', JSON.stringify(entries));

		const history = getHistory('pp-improver');
		expect(history.length).toBeLessThanOrEqual(5);
	});

	it('clearHistory removes all entries for that feature', () => {
		addHistoryEntry({ feature: 'pp-improver', playerId: '76561198082215374' });
		addHistoryEntry({ feature: 'pp-improver', playerId: '76561198000000001' });
		clearHistory('pp-improver');
		expect(getHistory('pp-improver')).toEqual([]);
	});

	it('removeHistoryEntry removes just that entry, others remain', () => {
		addHistoryEntry({ feature: 'pp-improver', playerId: '76561198082215371' });
		addHistoryEntry({ feature: 'pp-improver', playerId: '76561198082215372' });
		addHistoryEntry({ feature: 'pp-improver', playerId: '76561198082215373' });

		const before = getHistory('pp-improver');
		expect(before).toHaveLength(3);

		// Remove the entry at index 1 (middle entry in display order)
		removeHistoryEntry('pp-improver', 1);

		const after = getHistory('pp-improver');
		expect(after).toHaveLength(2);
	});
});
// #endregion PP Improver history

// #region With Friends history
describe('With Friends history', () => {
	it('Adding an entry saves it with playerIds array', () => {
		addHistoryEntry({
			feature: 'with-friends',
			playerIds: ['76561198082215374', '76561198000000001'],
		});
		const history = getHistory('with-friends');
		expect(history).toHaveLength(1);
		expect(history[0]).toMatchObject({
			feature: 'with-friends',
			playerIds: ['76561198082215374', '76561198000000001'],
		});
	});

	it('Same playerIds array in same order is treated as duplicate (no duplicate added)', () => {
		addHistoryEntry({
			feature: 'with-friends',
			playerIds: ['76561198082215374', '76561198000000001'],
		});
		addHistoryEntry({
			feature: 'with-friends',
			playerIds: ['76561198082215374', '76561198000000001'],
		});
		expect(getHistory('with-friends')).toHaveLength(1);
	});

	it('Different order of same playerIds is treated as distinct entry', () => {
		addHistoryEntry({
			feature: 'with-friends',
			playerIds: ['76561198082215374', '76561198000000001'],
		});
		addHistoryEntry({
			feature: 'with-friends',
			playerIds: ['76561198000000001', '76561198082215374'],
		});
		expect(getHistory('with-friends')).toHaveLength(2);
	});

	it('Empty history returns empty array', () => {
		expect(getHistory('with-friends')).toEqual([]);
	});
});
// #endregion With Friends history

// #region Ranges history
describe('Ranges history', () => {
	it('Adding a ranges entry saves it with ranges array', () => {
		addHistoryEntry({ feature: 'ranges', ranges: ['1-3', '3-5'] });
		const history = getHistory('ranges');
		expect(history).toHaveLength(1);
		expect(history[0]).toMatchObject({ feature: 'ranges', ranges: ['1-3', '3-5'] });
	});

	it('Empty history returns empty array', () => {
		expect(getHistory('ranges')).toEqual([]);
	});
});
// #endregion Ranges history

// #region Feature isolation
describe('History is per-feature', () => {
	it('PP Improver and With Friends histories are independent', () => {
		addHistoryEntry({ feature: 'pp-improver', playerId: '76561198082215374' });
		addHistoryEntry({
			feature: 'with-friends',
			playerIds: ['76561198082215374', '76561198000000001'],
		});

		expect(getHistory('pp-improver')).toHaveLength(1);
		expect(getHistory('with-friends')).toHaveLength(1);

		clearHistory('pp-improver');

		expect(getHistory('pp-improver')).toEqual([]);
		expect(getHistory('with-friends')).toHaveLength(1);
	});

	it('PP Improver and Ranges histories are independent', () => {
		addHistoryEntry({ feature: 'pp-improver', playerId: '76561198082215374' });
		addHistoryEntry({ feature: 'ranges', ranges: ['1-3'] });

		clearHistory('ranges');

		expect(getHistory('pp-improver')).toHaveLength(1);
		expect(getHistory('ranges')).toEqual([]);
	});
});
// #endregion Feature isolation
