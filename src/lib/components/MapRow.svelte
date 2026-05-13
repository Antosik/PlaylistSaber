<script lang="ts">
	import { MapMode } from '$lib/types';
	import type { RankedMap, ImprovableMap } from '$lib/types';
	import { getLeaderboardUrl, getBeatSaverUrl, getOneClickUrl } from '$lib/map-links';
	import type { MapPlatform } from '$lib/map-links';

	let { map, mode, platform = 'scoresaber' }: { map: RankedMap | ImprovableMap; mode: MapMode; platform?: MapPlatform } = $props();

	function isImprovable(m: RankedMap | ImprovableMap): m is ImprovableMap {
		return 'currentAccuracy' in m;
	}

	let imp = $derived(isImprovable(map) ? map : null);
</script>

<div class="row" qa="map-result-row">
	<span class="stars">★ {map.stars.toFixed(1)}</span>
	<span class="name">{map.songName}</span>
	<span class="diff">{map.difficulty}</span>
	{#if mode === MapMode.Improvable && imp}
		<span class="gain">
			{(imp.currentAccuracy * 100).toFixed(1)}% → <strong>+{Math.round(imp.potentialGain)}pp</strong>
		</span>
	{:else}
		<span class="pp">{Math.round(map.pp)}pp</span>
	{/if}
	<div class="map-links">
		{#if map.leaderboardId}
			<a qa="map-leaderboard-link" href={getLeaderboardUrl(map.leaderboardId, platform)} target="_blank" rel="noopener noreferrer" class="map-link">LB</a>
		{/if}
		{#if map.bsKey}
			<a qa="map-beatsaver-link" href={getBeatSaverUrl(map.bsKey)} target="_blank" rel="noopener noreferrer" class="map-link">BS</a>
			<a qa="map-oneclick-link" href={getOneClickUrl(map.bsKey)} class="map-link">↓</a>
		{/if}
	</div>
</div>

<style>
	.row {
		display: grid;
		grid-template-columns: 52px 1fr auto auto auto;
		align-items: center;
		gap: var(--spacing-sm);
		padding: 8px var(--spacing-md);
		border-bottom: 1px solid rgba(255,255,255,0.04);
		font-size: 13px;
	}

	.row:last-child { border-bottom: none; }

	.stars { color: var(--color-star); font-size: 12px; }

	.name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

	.diff { color: var(--color-text-muted); font-size: 12px; white-space: nowrap; }

	.pp { color: var(--color-pp); font-size: 12px; white-space: nowrap; }

	.gain { font-size: 12px; white-space: nowrap; color: var(--color-text-muted); }
	.gain strong { color: var(--color-success); }

	.map-links { display: flex; gap: 4px; align-items: center; }

	.map-link {
		font-size: 11px;
		padding: 2px 6px;
		border-radius: 4px;
		background: rgba(255,255,255,0.07);
		color: var(--color-text-muted);
		white-space: nowrap;
		text-decoration: none;
	}

	.map-link:hover { background: rgba(255,255,255,0.14); color: var(--color-text); }
</style>
