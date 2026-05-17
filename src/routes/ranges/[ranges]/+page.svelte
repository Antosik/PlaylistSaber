<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import CtaButton from '$lib/components/CtaButton.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import SongCoverageCard from '$lib/components/SongCoverageCard.svelte';
	import SortSelect from '$lib/components/SortSelect.svelte';
	import { sortCoverageResults } from '$lib/domain/coverage';
	import { coverageToBplist, downloadBplist } from '$lib/playlist';

	import type { PageProps } from './$types';

	let { data } = $props() as PageProps;

	const INITIAL_SHOW = 10;
	let expanded = $state(false);
	let sortBy = $state<'default' | 'name' | 'stars' | 'pp'>('default');

	let sortedResults = $derived(sortCoverageResults(data.results, sortBy));
</script>

<div class="header">
	<div class="info-bar">
		<span class="platform">{data.platformLabel}</span>
	</div>
	<div class="ranges-list">
		{#each data.slots as slot, i (i)}
			<div class="range-item">
				<span class="label">{slot.label || `Slot ${i + 1}`}</span>
				<span class="range-value">
					★{slot.min?.toFixed(1) ?? '?'}–{slot.max?.toFixed(1) ?? '?'}
				</span>
			</div>
		{/each}
	</div>
</div>

<div class="controls">
	<button type="button" class="new-search" onclick={() => goto(resolve('/ranges'))}>
		← New Search
	</button>
	<SortSelect bind:value={sortBy} />
</div>

{#if data.results.length === 0}
	<EmptyState>
		<p>No songs found that cover all ranges on {data.platformLabel}.</p>
		<p>Try widening one or more star ranges.</p>
	</EmptyState>
{:else}
	<p class="summary">{data.results.length} songs cover all {data.slotCount} ranges</p>
	<div class="cards">
		{#each expanded ? sortedResults : sortedResults.slice(0, INITIAL_SHOW) as result (result.songHash)}
			<SongCoverageCard {result} slots={data.slots} />
		{/each}
	</div>
	{#if !expanded && sortedResults.length > INITIAL_SHOW}
		<button type="button" class="show-more" onclick={() => (expanded = true)}>
			Show more - {sortedResults.length - INITIAL_SHOW} more songs
		</button>
	{/if}
	<CtaButton onclick={() => downloadBplist(coverageToBplist(sortedResults, 'Ranges'))}>
		↓ Download Playlist ({sortedResults.length} songs)
	</CtaButton>
{/if}

<style>
	.header {
		margin-bottom: var(--spacing-md);
	}

	.info-bar {
		display: flex;
		gap: 12px;
		align-items: center;
		margin-bottom: 12px;
		font-size: 13px;
	}

	.platform {
		color: var(--color-text-muted);
	}

	.ranges-list {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.range-item {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 10px;
		background: var(--color-surface);
		border-radius: var(--radius-md);
		font-size: 12px;
	}

	.label {
		color: var(--color-text);
		font-weight: 500;
		min-width: 60px;
	}

	.range-value {
		color: var(--color-text-muted);
	}

	.controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-md);
	}

	.new-search {
		color: var(--color-text-muted);
		font-size: 13px;
		padding: 4px 0;
	}

	.new-search:hover {
		color: var(--color-text);
	}

	.summary {
		color: var(--color-text-muted);
		font-size: 13px;
		margin-bottom: var(--spacing-md);
	}

	.cards {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.show-more {
		display: block;
		width: 100%;
		margin-top: var(--spacing-sm);
		padding: 10px;
		text-align: center;
		color: var(--color-text-muted);
		font-size: 13px;
		background: var(--color-surface);
		border-radius: var(--radius-md);
	}

	.show-more:hover {
		color: var(--color-text);
	}
</style>
