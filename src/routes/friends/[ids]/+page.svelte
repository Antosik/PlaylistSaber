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
	import { deriveSkillRange } from '$lib/domain/skill-range';
	import { findCoveringSongs } from '$lib/domain/coverage';
	import { coverageToBplist, downloadBplist } from '$lib/playlist';
	import { addHistoryEntry } from '$lib/history';
	import { Platform, DEFAULT_PLATFORM } from '$lib/types';
	import type { CoverageResult, PlayerSlot, SkillRange } from '$lib/types';

	type Progress = {
		step: number;
		stepLabel: string;
		loaded?: number;
		total?: number;
		playerProgress?: Array<{ label: string; status: 'waiting' | 'fetching' | 'done'; range?: SkillRange }>;
	};

	const platform = $derived<Platform>(
		$page.url.searchParams.get('platform') === Platform.BeatLeader
			? Platform.BeatLeader
			: DEFAULT_PLATFORM,
	);

	const ids = $derived(($page.params.ids ?? '').split(',').filter(Boolean));

	let progress = $state<Progress>({ step: 1, stepLabel: 'Fetching player scores…' });

	type Result = {
		platformLabel: string;
		playerCount: number;
		results: CoverageResult[];
		slots: PlayerSlot[];
		ranges: Map<number, SkillRange>;
	};

	async function fetchData(playerIds: string[], plat: Platform): Promise<Result> {
		const api = getPlatformApi(plat);
		const slots: PlayerSlot[] = [];
		const derivedRanges = new Map<number, SkillRange>();

		const playerProgress = playerIds.map((_, i) => ({
			label: i === 0 ? 'You' : `Friend ${i}`,
			status: 'waiting' as const,
		}));
		progress = { step: 1, stepLabel: 'Fetching player scores…', playerProgress: [...playerProgress] };

		for (let i = 0; i < playerIds.length; i++) {
			type PP = { label: string; status: 'waiting' | 'fetching' | 'done'; range?: SkillRange };
			const prog: PP[] = [...(progress.playerProgress ?? [])];
			prog[i] = { ...prog[i], status: 'fetching' };
			progress = { ...progress, playerProgress: prog };

			const scores = await api.getScores(playerIds[i]);
			const range = deriveSkillRange(scores);

			prog[i] = { ...prog[i], status: 'done', range: range ?? undefined };
			progress = { ...progress, playerProgress: [...prog] };

			if (range) {
				slots.push({ label: prog[i].label, min: range.min, max: range.max });
				derivedRanges.set(slots.length - 1, range);
			}
		}

		progress = { step: 2, stepLabel: 'Fetching ranked maps…', loaded: 0, total: undefined };
		const rankedMaps = await api.getRankedMaps((loaded: number, total: number) => {
			progress = { ...progress, loaded, total };
		});

		progress = { step: 3, stepLabel: 'Calculating song coverage…', loaded: undefined, total: undefined };
		const results = findCoveringSongs(rankedMaps, slots);

		addHistoryEntry({ feature: 'with-friends', playerIds });

		return { platformLabel: api.label, playerCount: slots.length, results, slots, ranges: derivedRanges };
	}

	let dataPromise = $state<Promise<Result> | null>(null);

	$effect(() => {
		const plat = platform;
		const playerIds = [...ids];
		if (playerIds.length === 0) {
			dataPromise = Promise.reject(new Error('No player IDs'));
			return;
		}
		progress = { step: 1, stepLabel: 'Fetching player scores…' };
		dataPromise = fetchData(playerIds, plat);
	});

	const INITIAL_SHOW = 10;
	let expanded = $state(false);
</script>

{#if dataPromise}
{#await dataPromise}
	<LoadingCard
		title={`${platform === Platform.ScoreSaber ? 'ScoreSaber' : 'BeatLeader'} · ${ids.length} players`}
		label={progress.stepLabel}
		step={progress.step}
		totalSteps={3}
		loaded={progress.loaded}
		total={progress.total}
		onCancel={() => goto('/friends')}
	>
		{#if progress.step === 1 && progress.playerProgress}
			<div class="player-progress">
				{#each progress.playerProgress as p}
					<div class="pp-row">
						{#if p.status === 'done'}
							<span class="icon done">✓</span>
						{:else if p.status === 'fetching'}
							<span class="icon fetching">·</span>
						{:else}
							<span class="icon waiting">○</span>
						{/if}
						<span class="pp-label">{p.label}</span>
						{#if p.status === 'done' && p.range}
							<span class="pp-range">★{p.range.min.toFixed(1)}–{p.range.max.toFixed(1)} detected</span>
						{:else if p.status === 'fetching'}
							<span class="pp-fetching">fetching…</span>
						{:else}
							<span class="pp-waiting">waiting</span>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</LoadingCard>
{:then data}
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
				<SongCoverageCard {result} slots={data.slots} ranges={data.ranges} />
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
{:catch error}
	<ErrorBanner
		message={`Could not fetch data. Check your player IDs and try again. (${error instanceof Error ? error.message : 'Unknown error'})`}
		onRetry={() => goto('/friends')}
	/>
{/await}
{/if}

<style>
	.player-progress { display: flex; flex-direction: column; gap: 4px; }
	.pp-row { display: flex; align-items: center; gap: 8px; font-size: 13px; }

	.icon { width: 16px; text-align: center; }
	.icon.done { color: var(--color-success); }
	.icon.fetching { color: var(--color-accent); }
	.icon.waiting { color: var(--color-text-muted); }

	.pp-label { min-width: 120px; }
	.pp-range { color: var(--color-success); font-size: 12px; }
	.pp-fetching { color: var(--color-text-muted); font-size: 12px; font-style: italic; }
	.pp-waiting { color: var(--color-text-muted); font-size: 12px; }

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
