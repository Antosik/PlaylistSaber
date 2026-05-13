/**
 * Fetches pages 2..totalPages with bounded concurrency (avoids firing dozens of
 * simultaneous requests against third-party APIs — e.g. ScoreSaber / BeatLeader scores).
 * onProgress(highestPageFetched, totalPages) fires after page 1 is done, then after each batch.
 */
export async function fetchPagesConcurrentLimited<T>(
	firstPage: T[],
	totalPages: number,
	fetchPage: (page: number) => Promise<T[]>,
	onProgress?: (highestPageFetched: number, totalPages: number) => void,
	concurrency = 5
): Promise<T[]> {
	const all = [...firstPage];
	onProgress?.(1, totalPages);
	if (totalPages <= 1) return all;

	for (let start = 2; start <= totalPages; start += concurrency) {
		const end = Math.min(start + concurrency - 1, totalPages);
		const promises = [];
		for (let page = start; page <= end; page += 1) {
			const p = page;
			promises.push(fetchPage(p).then((items) => ({ page: p, items })));
		}
		const fetched = await Promise.all(promises);
		for (const { items } of fetched.sort((a, b) => a.page - b.page)) all.push(...items);
		onProgress?.(end, totalPages);
	}
	return all;
}

/**
 * Fetches pages 2..totalPages in sequential batches.
 * onProgress(loadedItems, totalItems) is called after each batch.
 */
export async function fetchPagesBatched<T>(
	firstPage: T[],
	totalItems: number,
	totalPages: number,
	fetchPage: (page: number) => Promise<T[]>,
	onProgress?: (loaded: number, total: number) => void,
	batchSize = 5
): Promise<T[]> {
	const all = [...firstPage];
	for (let start = 2; start <= totalPages; start += batchSize) {
		const pages = Array.from(
			{ length: Math.min(batchSize, totalPages - start + 1) },
			(_, i) => start + i
		);
		const batches = await Promise.all(pages.map(fetchPage));
		for (const items of batches) all.push(...items);
		onProgress?.(all.length, totalItems);
	}
	return all;
}
