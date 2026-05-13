<script lang="ts">
	import { goto } from '$app/navigation';
	import ResultsBar from '$lib/components/ResultsBar.svelte';
	import SongCoverageCard from '$lib/components/SongCoverageCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import CtaButton from '$lib/components/CtaButton.svelte';
	import { coverageToBplist, downloadBplist } from '$lib/playlist';
	import type { PageProps } from './$types';

	let { data } = $props() as PageProps;

	const INITIAL_SHOW = 10;
	let expanded = $state(false);
</script>

<ResultsBar
	info={`${data.platformLabel} · ${data.playerCount} players`}
	onNewSearch={() => goto('/friends')}
/>

{#if data.results.length === 0}
	<EmptyState>
		<p>No songs found that cover all {data.playerCount} players on {data.platformLabel}.</p>
		<p>Your skill ranges may be too far apart for any song to bridge them. Try adding players closer in level.</p>
	</EmptyState>
{:else}
	<p class="summary">{data.results.length} songs cover all {data.playerCount} players</p>
	<div class="cards">
		{#each (expanded ? data.results : data.results.slice(0, INITIAL_SHOW)) as result}
			<SongCoverageCard {result} slots={data.slots} ranges={data.rangeBySlotIndex} />
		{/each}
	</div>
	{#if !expanded && data.results.length > INITIAL_SHOW}
		<button type="button" class="show-more" onclick={() => (expanded = true)}>
			Show more - {data.results.length - INITIAL_SHOW} more songs
		</button>
	{/if}
	<CtaButton onclick={() => downloadBplist(coverageToBplist(data.results, 'With Friends'))}>
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
