<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import CtaButton from '$lib/components/CtaButton.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import ResultsBar from '$lib/components/ResultsBar.svelte';
	import SongCoverageCard from '$lib/components/SongCoverageCard.svelte';
	import { coverageToBplist, downloadBplist } from '$lib/playlist';

	import type { PageProps } from './$types';

	let { data } = $props() as PageProps;

	const INITIAL_SHOW = 10;
	let expanded = $state(false);
</script>

<ResultsBar
	info={`${data.platformLabel} · ${data.slotCount} ranges`}
	onNewSearch={() => goto(resolve('/ranges'))}
/>

{#if data.results.length === 0}
	<EmptyState>
		<p>No songs found that cover all ranges on {data.platformLabel}.</p>
		<p>Try widening one or more star ranges.</p>
	</EmptyState>
{:else}
	<p class="summary">{data.results.length} songs cover all {data.slotCount} ranges</p>
	<div class="cards">
		{#each expanded ? data.results : data.results.slice(0, INITIAL_SHOW) as result (result.songHash)}
			<SongCoverageCard {result} slots={data.slots} />
		{/each}
	</div>
	{#if !expanded && data.results.length > INITIAL_SHOW}
		<button type="button" class="show-more" onclick={() => (expanded = true)}>
			Show more - {data.results.length - INITIAL_SHOW} more songs
		</button>
	{/if}
	<CtaButton onclick={() => downloadBplist(coverageToBplist(data.results, 'Ranges'))}>
		↓ Download Playlist ({data.results.length} songs)
	</CtaButton>
{/if}

<style>
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
