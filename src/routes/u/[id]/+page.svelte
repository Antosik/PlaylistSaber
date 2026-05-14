<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import CtaButton from '$lib/components/CtaButton.svelte';
	import RangeInput from '$lib/components/RangeInput.svelte';
	import ResultsBar from '$lib/components/ResultsBar.svelte';
	import SectionCard from '$lib/components/SectionCard.svelte';
	import { classifyMaps } from '$lib/domain/pp-improvement';
	import { rankedMapsToBplist, downloadBplist } from '$lib/playlist';
	import type { NewMap, ImprovableMap } from '$lib/types';

	import type { PageProps } from './$types';

	let { data } = $props() as PageProps;

	let accuracyThreshold = $state(0.95);
	let newMapsSortBy = $state<'weightedDelta' | 'stars' | 'name'>('weightedDelta');
	let improvableSortBy = $state<'weightedDelta' | 'accuracy' | 'stars' | 'name'>('weightedDelta');

	const r = $derived(
		classifyMaps(data.scores, data.rankedMaps, data.platform, { accuracyThreshold })
	);

	const sortedNewMaps = $derived(sortNewMaps(r.newMaps, newMapsSortBy));
	const sortedImprovableMaps = $derived(sortImprovableMaps(r.improvableMaps, improvableSortBy));

	function sortNewMaps(maps: NewMap[], by: typeof newMapsSortBy): NewMap[] {
		if (by === 'stars') return [...maps].sort((a, b) => b.stars - a.stars);
		if (by === 'name') return [...maps].sort((a, b) => a.songName.localeCompare(b.songName));
		return maps; // 'weightedDelta' — already sorted by classifyMaps
	}

	function sortImprovableMaps(maps: ImprovableMap[], by: typeof improvableSortBy): ImprovableMap[] {
		if (by === 'accuracy') return [...maps].sort((a, b) => a.currentAccuracy - b.currentAccuracy);
		if (by === 'stars') return [...maps].sort((a, b) => b.stars - a.stars);
		if (by === 'name') return [...maps].sort((a, b) => a.songName.localeCompare(b.songName));
		return maps; // 'weightedDelta'
	}

	function downloadSection(maps: (NewMap | ImprovableMap)[], title: string) {
		downloadBplist(rankedMapsToBplist(maps, title));
	}
</script>

<ResultsBar
	info={`${data.platformLabel} · ${data.playerName}${data.skillRange ? ` · ★${data.skillRange.min.toFixed(1)}–${data.skillRange.max.toFixed(1)}` : ''}`}
	onNewSearch={() => goto(resolve('/'))}
/>

<div class="sections">
	<SectionCard
		title="New Maps"
		subtitle="Maps you've never played"
		maps={sortedNewMaps}
		mode="new"
		onDownload={() => downloadSection(sortedNewMaps, 'New Maps')}
	>
		{#snippet settingsContent()}
			<div class="dialog-field">
				<label for="new-sort">Sort by</label>
				<select id="new-sort" bind:value={newMapsSortBy}>
					<option value="weightedDelta">Weighted PP gain</option>
					<option value="stars">Stars</option>
					<option value="name">Song name</option>
				</select>
			</div>
		{/snippet}
	</SectionCard>

	<SectionCard
		title="Improvable Maps"
		subtitle="Maps below {(accuracyThreshold * 100).toFixed(0)}% accuracy"
		maps={sortedImprovableMaps}
		mode="improvable"
		onDownload={() => downloadSection(sortedImprovableMaps, 'Improvable Maps')}
	>
		{#snippet settingsContent()}
			<RangeInput
				label="Accuracy threshold: {(accuracyThreshold * 100).toFixed(0)}%"
				id="imp-threshold"
				bind:value={accuracyThreshold}
				min={0.8}
				max={0.99}
				step={0.01}
			/>
			<div class="dialog-field">
				<label for="imp-sort">Sort by</label>
				<select id="imp-sort" bind:value={improvableSortBy}>
					<option value="weightedDelta">Weighted PP gain</option>
					<option value="accuracy">Current accuracy (easiest wins first)</option>
					<option value="stars">Stars</option>
					<option value="name">Song name</option>
				</select>
			</div>
		{/snippet}
	</SectionCard>
</div>

<CtaButton
	onclick={() => {
		const all = [...sortedNewMaps, ...sortedImprovableMaps];
		downloadBplist(rankedMapsToBplist(all, 'PP Improvement'));
	}}
>
	↓ Download Full Playlist ({sortedNewMaps.length + sortedImprovableMaps.length} maps)
</CtaButton>

<style>
	.sections {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.dialog-field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.dialog-field label {
		display: block;
		font-size: 12px;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.dialog-field select {
		width: 100%;
		padding: 8px 10px;
		border-radius: var(--radius-sm);
		border: 1.5px solid rgba(255, 255, 255, 0.1);
		background: var(--color-surface-2);
		color: var(--color-text);
		font-size: 13px;
		outline: none;
	}

	.dialog-field select:focus {
		border-color: var(--color-accent);
	}
</style>
