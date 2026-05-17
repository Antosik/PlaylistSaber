<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import CtaButton from '$lib/components/CtaButton.svelte';
	import PlayerHeader from '$lib/components/PlayerHeader.svelte';
	import RangeInput from '$lib/components/RangeInput.svelte';
	import SectionCard from '$lib/components/SectionCard.svelte';
	import SettingsDialog from '$lib/components/SettingsDialog.svelte';
	import SortSelect from '$lib/components/SortSelect.svelte';
	import { classifyMaps } from '$lib/domain/pp-improvement';
	import { rankedMapsToBplist, downloadBplist } from '$lib/playlist';
	import type { NewMap, ImprovableMap } from '$lib/types';

	import type { PageProps } from './$types';

	let { data } = $props() as PageProps;

	let accuracyThreshold = $state(0.95);
	let newMapsSortBy = $state<'weightedDelta' | 'stars' | 'name'>('weightedDelta');
	let improvableSortBy = $state<'weightedDelta' | 'accuracy' | 'stars' | 'name'>('weightedDelta');

	const r = $derived(classifyMaps(data.scores, data.rankedMaps, data.platform, accuracyThreshold));

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

<PlayerHeader
	players={[
		{
			id: data.playerId,
			name: data.playerName,
			avatar: data.playerAvatar,
			skillRange: data.skillRange ?? undefined,
		},
	]}
	platform={data.platformLabel}
/>

<div class="controls">
	<button type="button" class="new-search" onclick={() => goto(resolve('/'))}>
		← New Search
	</button>
	<SortSelect
		bind:value={newMapsSortBy}
		options={[
			{ value: 'weightedDelta', label: 'Weighted PP gain' },
			{ value: 'stars', label: 'Stars' },
			{ value: 'name', label: 'Song name' },
		]}
	/>
</div>

<div class="sections">
	<SectionCard
		title="New Maps"
		subtitle="Never played (above {(accuracyThreshold * 100).toFixed(0)}% threshold)"
		maps={sortedNewMaps}
		mode="new"
		onDownload={() => downloadSection(sortedNewMaps, 'New Maps')}
	/>

	<div class="section-controls">
		<SortSelect
			bind:value={improvableSortBy}
			options={[
				{ value: 'weightedDelta', label: 'Weighted PP gain' },
				{ value: 'accuracy', label: 'Current accuracy' },
				{ value: 'stars', label: 'Stars' },
				{ value: 'name', label: 'Song name' },
			]}
		/>
		<SettingsDialog title="Settings">
			{#snippet content()}
				<RangeInput
					label="Accuracy threshold: {(accuracyThreshold * 100).toFixed(0)}%"
					id="acc-threshold"
					bind:value={accuracyThreshold}
					min={0.8}
					max={0.99}
					step={0.01}
				/>
			{/snippet}
		</SettingsDialog>
	</div>

	<SectionCard
		title="Improvable Maps"
		subtitle="Below {(accuracyThreshold * 100).toFixed(0)}% accuracy"
		maps={sortedImprovableMaps}
		mode="improvable"
		onDownload={() => downloadSection(sortedImprovableMaps, 'Improvable Maps')}
	/>
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
	.controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-md);
		flex-wrap: wrap;
	}

	.new-search {
		color: var(--color-text-muted);
		font-size: 13px;
		padding: 4px 0;
		white-space: nowrap;
	}

	.new-search:hover {
		color: var(--color-text);
	}

	.section-controls {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--spacing-sm);
		margin-top: var(--spacing-sm);
		margin-bottom: var(--spacing-sm);
	}

	.sections {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}
</style>
