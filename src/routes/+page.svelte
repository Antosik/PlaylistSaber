<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import PlatformPicker from '$lib/components/PlatformPicker.svelte';
	import SectionCard from '$lib/components/SectionCard.svelte';
	import ErrorBanner from '$lib/components/ErrorBanner.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import ResultsBar from '$lib/components/ResultsBar.svelte';
	import CtaButton from '$lib/components/CtaButton.svelte';
	import { getPlatformApi } from '$lib/api/platform';
	import { classifyMaps } from '$lib/domain/pp-improvement';
	import { deriveSkillRange } from '$lib/domain/skill-range';
	import { rankedMapsToBplist, downloadBplist } from '$lib/playlist';
	import { extractId } from '$lib/utils';
	import { Platform, MapMode } from '$lib/types';
	import type { PPImprovement, RankedMap, ImprovableMap, SkillRange } from '$lib/types';

	type View =
		| { phase: 'input' }
		| { phase: 'loading'; step: number; stepLabel: string; loaded?: number; total?: number; cancel: () => void }
		| { phase: 'results'; playerName: string; platform: string; skillRange: SkillRange | null; result: PPImprovement; rankedMaps: RankedMap[] }
		| { phase: 'error'; message: string };

	let platform: Platform = $state(Platform.ScoreSaber);
	let playerId: string = $state('');
	let view: View = $state({ phase: 'input' });

	async function generate() {
		const id = extractId(playerId);
		if (!id) return;

		const api = getPlatformApi(platform);
		let cancelled = false;
		view = {
			phase: 'loading', step: 1, stepLabel: 'Fetching player scores…',
			cancel: () => { cancelled = true; view = { phase: 'input' }; },
		};

		try {
			const info = await api.getPlayer(id);
			if (cancelled) return;

			view = { ...view as Extract<View, { phase: 'loading' }>, step: 1, loaded: 0, total: 1 };
			const scores = await api.getScores(id, (p, t) => {
				if (!cancelled) view = { ...view as Extract<View, { phase: 'loading' }>, loaded: p, total: t };
			});
			if (cancelled) return;

			view = { ...view as Extract<View, { phase: 'loading' }>, step: 2, stepLabel: 'Fetching ranked maps…', loaded: 0, total: undefined };
			const rankedMaps = await api.getRankedMaps((loaded, total) => {
				if (!cancelled) view = { ...view as Extract<View, { phase: 'loading' }>, loaded, total };
			});
			if (cancelled) return;

			view = { ...view as Extract<View, { phase: 'loading' }>, step: 3, stepLabel: 'Calculating PP potential…', loaded: undefined, total: undefined };
			const result = classifyMaps(scores, rankedMaps);
			const skillRange = deriveSkillRange(scores);
			if (cancelled) return;

			view = { phase: 'results', playerName: info.name, platform: api.label, skillRange: skillRange ?? null, result, rankedMaps };
		} catch (e: unknown) {
			if (!cancelled) {
				const msg = e instanceof Error ? e.message : 'Unknown error';
				view = { phase: 'error', message: `Could not fetch data. Check your player ID and try again. (${msg})` };
			}
		}
	}

	function downloadSection(maps: (RankedMap | ImprovableMap)[], title: string) {
		downloadBplist(rankedMapsToBplist(maps as RankedMap[], title));
	}

	function downloadFull() {
		const v = view as Extract<View, { phase: 'results' }>;
		const all = [...v.result.newMaps, ...v.result.improvableMaps] as RankedMap[];
		downloadBplist(rankedMapsToBplist(all, 'PP Improvement'));
	}
</script>

{#if view.phase === 'input'}
	<PageHeader
		title="Improve Your PP"
		subtitle="Find ranked maps where you can gain the most performance points - split into new maps and maps you can still improve."
	/>

	<section>
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label>Platform</label>
		<PlatformPicker bind:value={platform} />
	</section>

	<section>
		<label for="player-id">Player ID</label>
		<input
			id="player-id"
			type="text"
			placeholder="76561198… or paste your profile URL"
			bind:value={playerId}
		/>
	</section>

	<CtaButton disabled={!playerId.trim()} onclick={generate}>
		Generate PP Playlist →
	</CtaButton>

{:else if view.phase === 'loading'}
	<LoadingCard
		label={view.stepLabel}
		step={view.step}
		totalSteps={3}
		loaded={view.loaded}
		total={view.total}
		onCancel={view.cancel}
	/>

{:else if view.phase === 'results'}
	<ResultsBar
		info="{view.platform} · {view.playerName}{view.skillRange ? ` · ★${view.skillRange.min.toFixed(1)}–${view.skillRange.max.toFixed(1)}` : ''}"
		onNewSearch={() => (view = { phase: 'input' })}
	/>

	{@const r = (view as Extract<View, { phase: 'results' }>).result}
	<div class="sections">
		<SectionCard
			title="New Maps"
			subtitle="Maps you've never played, ranked by PP potential"
			maps={r.newMaps}
			mode={MapMode.New}
			onDownload={() => downloadSection(r.newMaps, 'New Maps')}
		/>
		<SectionCard
			title="Improvable Maps"
			subtitle="Maps below 95% accuracy - sorted by potential PP gain"
			maps={r.improvableMaps}
			mode={MapMode.Improvable}
			onDownload={() => downloadSection(r.improvableMaps, 'Improvable Maps')}
		/>
	</div>

	<CtaButton onclick={downloadFull}>
		↓ Download Full Playlist ({r.newMaps.length + r.improvableMaps.length} maps)
	</CtaButton>

{:else if view.phase === 'error'}
	<ErrorBanner message={view.message} onRetry={() => (view = { phase: 'input' })} />
{/if}

<style>
	section { margin-bottom: var(--spacing-md); }

	label {
		display: block;
		font-size: 12px;
		color: var(--color-text-muted);
		margin-bottom: 6px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	input {
		width: 100%;
		padding: 10px 14px;
		border-radius: var(--radius-md);
		border: 1.5px solid rgba(255,255,255,0.1);
		background: var(--color-surface);
		color: var(--color-text);
		font-size: 14px;
		outline: none;
	}

	input:focus { border-color: var(--color-accent); }
	input::placeholder { color: var(--color-text-muted); }

	.sections { display: flex; flex-direction: column; gap: var(--spacing-md); }
</style>
