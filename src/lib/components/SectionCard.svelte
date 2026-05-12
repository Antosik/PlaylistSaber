<script lang="ts">
	import type { RankedMap, ImprovableMap, MapMode } from '$lib/types';
	import MapRow from './MapRow.svelte';

	let {
		title,
		subtitle,
		maps,
		mode,
		onDownload,
	}: {
		title: string;
		subtitle: string;
		maps: (RankedMap | ImprovableMap)[];
		mode: MapMode;
		onDownload: () => void;
	} = $props();

	const INITIAL_SHOW = 5;
	let expanded = $state(false);

	let visible = $derived(expanded ? maps : maps.slice(0, INITIAL_SHOW));
	let remaining = $derived(maps.length - INITIAL_SHOW);
</script>

<div class="card">
	<div class="header">
		<div>
			<h2>{title} <span class="count">({maps.length})</span></h2>
			<p class="subtitle">{subtitle}</p>
		</div>
		<button type="button" class="dl-btn" onclick={onDownload}>↓ Download section</button>
	</div>

	<div class="list">
		{#each visible as map}
			<MapRow {map} {mode} />
		{/each}
	</div>

	{#if !expanded && remaining > 0}
		<button type="button" class="show-more" onclick={() => (expanded = true)}>
			Show more - {remaining} more {remaining === 1 ? 'map' : 'maps'}
		</button>
	{/if}
</div>

<style>
	.card {
		border-radius: var(--radius-md);
		background: var(--color-surface);
		overflow: hidden;
	}

	.header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--spacing-md);
		padding: var(--spacing-md);
		border-bottom: 1px solid rgba(255,255,255,0.06);
	}

	h2 { font-size: 15px; font-weight: 600; }
	.count { color: var(--color-text-muted); font-weight: 400; }
	.subtitle { font-size: 12px; color: var(--color-text-muted); margin-top: 2px; }

	.dl-btn {
		flex-shrink: 0;
		padding: 5px 10px;
		border-radius: var(--radius-sm);
		background: var(--color-accent-dim);
		color: var(--color-accent);
		font-size: 12px;
		border: 1px solid var(--color-accent);
		white-space: nowrap;
	}

	.dl-btn:hover { background: var(--color-accent); color: #fff; }

	.list { overflow: hidden; }

	.show-more {
		display: block;
		width: 100%;
		padding: 10px;
		text-align: center;
		color: var(--color-text-muted);
		font-size: 12px;
		background: rgba(255,255,255,0.03);
		border-top: 1px solid rgba(255,255,255,0.06);
	}

	.show-more:hover { color: var(--color-text); }
</style>
