<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- external BeatSaver URLs */
	import { getBeatSaverUrl, getOneClickUrl } from '$lib/map-links';
	import { MapMode } from '$lib/types';
	import type { NewMap, ImprovableMap } from '$lib/types';

	let { map, mode }: { map: NewMap | ImprovableMap; mode: MapMode } = $props();

	function isImprovable(m: NewMap | ImprovableMap): m is ImprovableMap {
		return 'currentAccuracy' in m;
	}

	let imp = $derived(isImprovable(map) ? map : null);
</script>

<div class="row" data-testid="map-result-row">
	<span class="stars">★ {map.stars.toFixed(1)}</span>
	<div class="info">
		<span class="name">{map.songName}</span>
		<span class="artist">{map.artist}</span>
	</div>
	<span class="diff">{map.difficulty}</span>
	{#if mode === MapMode.Improvable && imp}
		<span class="gain">
			{(imp.currentAccuracy * 100).toFixed(1)}% →
			<strong>+{Math.round(imp.weightedPPDelta)}pp</strong>
		</span>
	{:else}
		<span class="pp">+{Math.round(map.weightedPPDelta)}pp</span>
	{/if}
	<div class="map-links">
		<a
			data-testid="map-beatsaver-link"
			href={getBeatSaverUrl(map.id)}
			target="_blank"
			rel="noopener noreferrer"
			class="map-link">BS</a
		>
		<a data-testid="map-oneclick-link" href={getOneClickUrl(map.id)} class="map-link">↓</a>
	</div>
</div>

<style>
	.row {
		display: grid;
		grid-template-columns: 52px 1fr auto auto auto;
		align-items: center;
		gap: var(--spacing-sm);
		padding: 8px var(--spacing-md);
		border-bottom: 1px solid rgba(255, 255, 255, 0.04);
		font-size: 13px;
	}

	.row:last-child {
		border-bottom: none;
	}

	.stars {
		color: var(--color-star);
		font-size: 12px;
	}

	.info {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		gap: 1px;
	}

	.name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.artist {
		font-size: 11px;
		color: var(--color-text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.diff {
		color: var(--color-text-muted);
		font-size: 12px;
		white-space: nowrap;
	}

	.pp {
		color: var(--color-pp);
		font-size: 12px;
		white-space: nowrap;
	}

	.gain {
		font-size: 12px;
		white-space: nowrap;
		color: var(--color-text-muted);
	}
	.gain strong {
		color: var(--color-success);
	}

	.map-links {
		display: flex;
		gap: 4px;
		align-items: center;
	}

	.map-link {
		font-size: 11px;
		padding: 2px 6px;
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.07);
		color: var(--color-text-muted);
		white-space: nowrap;
		text-decoration: none;
	}

	.map-link:hover {
		background: rgba(255, 255, 255, 0.14);
		color: var(--color-text);
	}
</style>
