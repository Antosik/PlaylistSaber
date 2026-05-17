<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import CtaButton from '$lib/components/CtaButton.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import PlayerHeader from '$lib/components/PlayerHeader.svelte';
	import SongCoverageCard from '$lib/components/SongCoverageCard.svelte';
	import SortSelect from '$lib/components/SortSelect.svelte';
	import { sortCoverageResults } from '$lib/domain/coverage';
	import { addHistoryEntry } from '$lib/history';
	import { coverageToBplist, downloadBplist } from '$lib/playlist';

	import type { PageProps } from './$types';

	let { data } = $props() as PageProps;

	const INITIAL_SHOW = 10;
	let expanded = $state(false);
	let sortBy = $state<'default' | 'name' | 'stars' | 'pp'>('default');

	$effect(() => {
		data.streamed.then(({ players }) => {
			addHistoryEntry({
				feature: 'with-friends',
				playerIds: data.playerIds,
				playerNames: players.map((p) => p.name),
			});
		});
	});
</script>

<PlayerHeader players={[]} platform={data.platformLabel} />

{#await data.streamed}
	<p class="loading">Loading players…</p>
{:then { players, results, playerCount, slots }}
	<PlayerHeader {players} platform={data.platformLabel} />

	<div class="controls">
		<button type="button" class="new-search" onclick={() => goto(resolve('/friends'))}>
			← New Search
		</button>
		<SortSelect bind:value={sortBy} />
	</div>

	{#if results.length === 0}
		<EmptyState>
			<p>No songs found that cover all {playerCount} players on {data.platformLabel}.</p>
			<p>
				Your skill ranges may be too far apart for any song to bridge them. Try adding players
				closer in level.
			</p>
		</EmptyState>
	{:else}
		{@const sortedResults = sortCoverageResults(results, sortBy)}
		<p class="summary">{results.length} songs cover all {playerCount} players</p>
		<div class="cards">
			{#each expanded ? sortedResults : sortedResults.slice(0, INITIAL_SHOW) as result (result.songHash)}
				<SongCoverageCard {result} {slots} />
			{/each}
		</div>
		{#if !expanded && sortedResults.length > INITIAL_SHOW}
			<button type="button" class="show-more" onclick={() => (expanded = true)}>
				Show more - {sortedResults.length - INITIAL_SHOW} more songs
			</button>
		{/if}
		<CtaButton onclick={() => downloadBplist(coverageToBplist(sortedResults, 'With Friends'))}>
			↓ Download Playlist ({sortedResults.length} songs)
		</CtaButton>
	{/if}
{:catch err}
	<p class="error">Failed to load players: {err.message}</p>
{/await}

<style>
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

	.loading {
		color: var(--color-text-muted);
		font-size: 13px;
	}

	.error {
		color: var(--color-error, red);
		font-size: 13px;
	}
</style>
