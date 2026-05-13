import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

import { getAllMaps, getMapsFrom, mergeRankedMaps } from '../src/lib/api/beatsaver';
import { Platform, type RankedMap } from '../src/lib/types.ts';

const DATA_DIR = 'static/data';
const OUTPUTS: Record<Platform, string> = {
	[Platform.ScoreSaber]: `${DATA_DIR}/ss-maps.json`,
	[Platform.BeatLeader]: `${DATA_DIR}/bl-maps.json`,
};

const from = process.argv.find((arg) => arg.startsWith('--from='))?.slice('--from='.length);

mkdirSync(DATA_DIR, { recursive: true });

function readExistingMaps(path: string): RankedMap[] {
	if (!existsSync(path)) return [];
	return JSON.parse(readFileSync(path, 'utf8')) as RankedMap[];
}

async function fetchPlatform(platform: Platform): Promise<void> {
	const path = OUTPUTS[platform];
	const label = platform === Platform.ScoreSaber ? 'ScoreSaber' : 'BeatLeader';
	console.log(from ? `Fetching ${label} maps from ${from}...` : `Fetching all ${label} maps...`);

	const fetched = from
		? await getMapsFrom(platform, from, (loaded, total) =>
				process.stdout.write(`\r  ${loaded} / ${total}`)
			)
		: await getAllMaps(platform, (loaded, total) =>
				process.stdout.write(`\r  ${loaded} / ${total}`)
			);

	if (!from && fetched.length === 0) throw new Error(`${label} returned 0 maps`);

	const maps = from ? mergeRankedMaps(readExistingMaps(path), fetched) : fetched;
	if (maps.length === 0) throw new Error(`${label} snapshot would be empty`);

	writeFileSync(path, JSON.stringify(maps));
	console.log(`\nWrote ${maps.length} ${label} maps`);
}

await fetchPlatform(Platform.ScoreSaber);
await fetchPlatform(Platform.BeatLeader);
