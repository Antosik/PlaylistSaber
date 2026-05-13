<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ResultsBar from '$lib/components/ResultsBar.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import ErrorBanner from '$lib/components/ErrorBanner.svelte';
	import SectionCard from '$lib/components/SectionCard.svelte';
	import CtaButton from '$lib/components/CtaButton.svelte';
	import { getPlatformApi } from '$lib/api/platform';
	import { classifyMaps } from '$lib/domain/pp-improvement';
	import { deriveSkillRange } from '$lib/domain/skill-range';
	import { rankedMapsToBplist, downloadBplist } from '$lib/playlist';
	import { addHistoryEntry } from '$lib/history';
	import { Platform, DEFAULT_PLATFORM } from '$lib/types';
	import type { PPImprovement, RankedMap, ImprovableMap, SkillRange } from '$lib/types';

	type Progress = { step: number; stepLabel: string; loaded?: number; total?: number };

	const platform = $derived<Platform>(
		$page.url.searchParams.get('platform') === Platform.BeatLeader
			? Platform.BeatLeader
			: DEFAULT_PLATFORM,
	);

	const id = $derived($page.params.id ?? '');

	let progress = $state<Progress>({ step: 1, stepLabel: 'Fetching player scores…' });

	type Result = {
		playerName: string;
		platformLabel: string;
		skillRange: SkillRange | null;
		result: PPImprovement;
		rankedMaps: RankedMap[];
	};

	async function fetchData(playerId: string, plat: Platform): Promise<Result> {
		const api = getPlatformApi(plat);

		progress = { step: 1, stepLabel: 'Fetching player scores…' };
		const info = await api.getPlayer(playerId);

		progress = { step: 1, stepLabel: 'Fetching player scores…', loaded: 0, total: 1 };
		const scores = await api.getScores(playerId, (loaded: number, total: number) => {
			progress = { ...progress, loaded, total };
		});

		progress = { step: 2, stepLabel: 'Fetching ranked maps…', loaded: 0, total: undefined };
		const rankedMaps = await api.getRankedMaps((loaded: number, total: number) => {
			progress = { ...progress, loaded, total };
		});

		progress = { step: 3, stepLabel: 'Calculating PP potential…', loaded: undefined, total: undefined };
		const result = classifyMaps(scores, rankedMaps);
		const skillRange = deriveSkillRange(scores);

		addHistoryEntry({ feature: 'pp-improver', playerId });

		return { playerName: info.name, platformLabel: api.label, skillRange: skillRange ?? null, result, rankedMaps };
	}

	let dataPromise = $state<Promise<Result> | null>(null);

	$effect(() => {
		const plat = platform;
		const playerId = id;
		if (!playerId) {
			dataPromise = Promise.reject(new Error('No player ID'));
			return;
		}
		progress = { step: 1, stepLabel: 'Fetching player scores…' };
		dataPromise = fetchData(playerId, plat);
	});

	function downloadSection(maps: (RankedMap | ImprovableMap)[], title: string) {
		downloadBplist(rankedMapsToBplist(maps as RankedMap[], title));
	}
</script>

{#if dataPromise}
{#await dataPromise}
	<div qa="pp-improver-loading">
		<LoadingCard
			label={progress.stepLabel}
			step={progress.step}
			totalSteps={3}
			loaded={progress.loaded}
			total={progress.total}
			onCancel={() => goto('/')}
		/>
	</div>
{:then data}
	<ResultsBar
		info={`${data.platformLabel} · ${data.playerName}${data.skillRange ? ` · ★${data.skillRange.min.toFixed(1)}–${data.skillRange.max.toFixed(1)}` : ''}`}
		onNewSearch={() => goto('/')}
	/>

	{@const r = data.result}
	<div class="sections">
		<SectionCard
			title="New Maps"
			subtitle="Maps you've never played, ranked by PP potential"
			maps={r.newMaps}
			mode="new"
			{platform}
			onDownload={() => downloadSection(r.newMaps, 'New Maps')}
		/>
		<SectionCard
			title="Improvable Maps"
			subtitle="Maps below 95% accuracy - sorted by potential PP gain"
			maps={r.improvableMaps}
			mode="improvable"
			{platform}
			onDownload={() => downloadSection(r.improvableMaps, 'Improvable Maps')}
		/>
	</div>

	<CtaButton onclick={() => {
		const all = [...r.newMaps, ...r.improvableMaps] as RankedMap[];
		downloadBplist(rankedMapsToBplist(all, 'PP Improvement'));
	}}>
		↓ Download Full Playlist ({r.newMaps.length + r.improvableMaps.length} maps)
	</CtaButton>
{:catch error}
	<ErrorBanner
		message={`Could not fetch data. Check your player ID and try again. (${error instanceof Error ? error.message : 'Unknown error'})`}
		onRetry={() => goto('/')}
	/>
{/await}
{/if}

<style>
	.sections { display: flex; flex-direction: column; gap: var(--spacing-md); }
</style>
