import type { NewMap, ImprovableMap, CoverageResult } from './types';

const BLANK_IMAGE =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

interface BplistSong {
	hash: string;
	songName: string;
	difficulties: Array<{ characteristic: string; name: string }>;
}

interface Bplist {
	playlistTitle: string;
	playlistAuthor: string;
	image: string;
	songs: BplistSong[];
}

function toBplist(title: string, songs: BplistSong[]): Bplist {
	return { playlistTitle: title, playlistAuthor: 'PlaylistSaber', image: BLANK_IMAGE, songs };
}

export function rankedMapsToBplist(maps: (NewMap | ImprovableMap)[], title: string): Bplist {
	const songs = maps.map((m) => ({
		hash: m.songHash.toLowerCase(),
		songName: m.songName,
		difficulties: [{ characteristic: 'Standard', name: m.difficulty }],
	}));
	return toBplist(title, songs);
}

export function coverageToBplist(results: CoverageResult[], title: string): Bplist {
	const seen = new Set<string>();
	const songs: BplistSong[] = [];
	for (const r of results) {
		if (seen.has(r.songHash)) continue;
		seen.add(r.songHash);
		const diffs = [...new Set(r.matches.map((m) => m.difficulty))].map((d) => ({
			characteristic: 'Standard',
			name: d,
		}));
		songs.push({ hash: r.songHash.toLowerCase(), songName: r.songName, difficulties: diffs });
	}
	return toBplist(title, songs);
}

export function downloadBplist(bplist: Bplist): void {
	const json = JSON.stringify(bplist, null, 2);
	const blob = new Blob([json], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `${bplist.playlistTitle.replace(/[^a-z0-9]/gi, '_')}.bplist`;
	a.click();
	URL.revokeObjectURL(url);
}
