<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import ErrorBanner from '$lib/components/ErrorBanner.svelte';
	import ResultsBar from '$lib/components/ResultsBar.svelte';
	import SongCoverageCard from '$lib/components/SongCoverageCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import CtaButton from '$lib/components/CtaButton.svelte';
	import { getPlatformApi } from '$lib/api/platform';
	import { findCoveringSongs } from '$lib/domain/coverage';
	import { coverageToBplist, downloadBplist } from '$lib/playlist';
	import { addHistoryEntry } from '$lib/history';
	import { Platform, DEFAULT_PLATFORM } from '$lib/types';
	import type { CoverageResult, PlayerSlot } from '$lib/types';

	type Progress = { step: number; stepLabel: string; loaded?: number; total?: number };

	const platform = $derived<Platform>(
		$page.url.searchParams.get('platform') === Platform.BeatLeader
			? Platform.BeatLeader
			: DEFAULT_PLATFORM,
	);

	const rangeTokens = $derived(($page.params.ranges ?? '').split(',').filter(Boolean));

	let progress = $state<Progress>({ step: 1, stepLabel: 'Fetching ranked maps…' });

	type Result = {
		platformLabel: string;
		slotCount: number;
		results: CoverageResult[];
		slots: PlayerSlot[];
	};

	async function fetchData(tokens: string[], plat: Platform): Promise<Result> {
		const rangeRegex = /^(\d+(?:\.\d+)?)?-(\d+(?:\.\d+)?)?$/;
		const slots: PlayerSlot[] = tokens.map((t, i) => {
			const m = t.match(rangeRegex);
			const minStr = m?.[1] ?? '';
			const maxStr = m?.[2] ?? '';
			return {
				label: i === 0 ? 'You' : `Friend ${i}`,
				min: minStr !== '' ? parseFloat(minStr) : null,
				max: maxStr !== '' ? parseFloat(maxStr) : null,
			};
		});

		const { getRankedMaps, label } = getPlatformApi(plat);

		progress = { step: 1, stepLabel: 'Fetching ranked maps…', loaded: 0, total: undefined };
		const rankedMaps = await getRankedMaps((loaded, total) => {
			progress = { ...progress, loaded, total };
		});

		progress = { step: 2, stepLabel: 'Calculating song coverage…', loaded: undefined, total: undefined };
		const results = findCoveringSongs(rankedMaps, slots);

		addHistoryEntry({ feature: 'ranges', ranges: tokens });

		return { platformLabel: label, slotCount: slots.length, results, slots };
	}

	let dataPromise = $state<Promise<Result> | null>(null);

	$effect(() => {
		const plat = platform;
		const tokens = [...rangeTokens];
		if (tokens.length === 0) {
			dataPromise = Promise.reject(new Error('No ranges'));
			return;
		}
		progress = { step: 1, stepLabel: 'Fetching ranked maps…' };
		dataPromise = fetchData(tokens, plat);
	});

	const INITIAL_SHOW = 10;
	let expanded = $state(false);
</script>

{#if dataPromise}
{#await dataPromise}
	<LoadingCard
		label={progress.stepLabel}
		step={progress.step}
		totalSteps={2}
		loaded={progress.loaded}
		total={progress.total}
		onCancel={() => goto('/ranges')}
	/>
{:then data}
	<ResultsBar
		info={`${data.platformLabel} · ${data.slotCount} ranges`}
		onNewSearch={() => goto('/ranges')}
	/>

	{#if data.results.length === 0}
		<EmptyState>
			<p>No songs found that cover all ranges on {data.platformLabel}.</p>
			<p>Try widening one or more star ranges.</p>
		</EmptyState>
	{:else}
		<p class="summary">{data.results.length} songs cover all {data.slotCount} ranges</p>
		<div class="cards">
			{#each (expanded ? data.results : data.results.slice(0, INITIAL_SHOW)) as result}
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
{:catch error}
	<ErrorBanner
		message={`Could not fetch ranked maps. (${error instanceof Error ? error.message : 'Unknown error'})`}
		onRetry={() => goto('/ranges')}
	/>
{/await}
{/if}

<style>
	.summary { color: var(--color-text-muted); font-size: 13px; margin-bottom: var(--spacing-md); }
	.cards { display: flex; flex-direction: column; gap: var(--spacing-sm); }

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

	.show-more:hover { color: var(--color-text); }
</style>
