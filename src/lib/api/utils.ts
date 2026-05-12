/**
 * Fetches pages 2..totalPages concurrently.
 * onProgress(p, totalPages) is called as each page resolves.
 */
export async function fetchPagesParallel<T>(
	firstPage: T[],
	totalPages: number,
	fetchPage: (page: number) => Promise<T[]>,
	onProgress?: (page: number, total: number) => void,
): Promise<T[]> {
	const pages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
	const rest = await Promise.all(
		pages.map((p) =>
			fetchPage(p).then((items) => {
				onProgress?.(p, totalPages);
				return items;
			}),
		),
	);
	return [...firstPage, ...rest.flat()];
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
	batchSize = 5,
): Promise<T[]> {
	const all = [...firstPage];
	for (let start = 2; start <= totalPages; start += batchSize) {
		const pages = Array.from(
			{ length: Math.min(batchSize, totalPages - start + 1) },
			(_, i) => start + i,
		);
		const batches = await Promise.all(pages.map(fetchPage));
		for (const items of batches) all.push(...items);
		onProgress?.(all.length, totalItems);
	}
	return all;
}
