<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import CtaButton from '$lib/components/CtaButton.svelte';
	import ResultsBar from '$lib/components/ResultsBar.svelte';
	import SectionCard from '$lib/components/SectionCard.svelte';
	import { rankedMapsToBplist, downloadBplist } from '$lib/playlist';
	import type { RankedMap, ImprovableMap } from '$lib/types';

	import type { PageProps } from './$types';

	let { data } = $props() as PageProps;

	const r = $derived(data.result);

	function downloadSection(maps: (RankedMap | ImprovableMap)[], title: string) {
		downloadBplist(rankedMapsToBplist(maps as RankedMap[], title));
	}
</script>

<ResultsBar
	info={`${data.platformLabel} · ${data.playerName}${data.skillRange ? ` · ★${data.skillRange.min.toFixed(1)}–${data.skillRange.max.toFixed(1)}` : ''}`}
	onNewSearch={() => goto(resolve('/'))}
/>

<div class="sections">
	<SectionCard
		title="New Maps"
		subtitle="Maps you've never played, ranked by PP potential"
		maps={r.newMaps}
		mode="new"
		onDownload={() => downloadSection(r.newMaps, 'New Maps')}
	/>
	<SectionCard
		title="Improvable Maps"
		subtitle="Maps below 95% accuracy - sorted by potential PP gain"
		maps={r.improvableMaps}
		mode="improvable"
		onDownload={() => downloadSection(r.improvableMaps, 'Improvable Maps')}
	/>
</div>

<CtaButton
	onclick={() => {
		const all = [...r.newMaps, ...r.improvableMaps] as RankedMap[];
		downloadBplist(rankedMapsToBplist(all, 'PP Improvement'));
	}}
>
	↓ Download Full Playlist ({r.newMaps.length + r.improvableMaps.length} maps)
</CtaButton>

<style>
	.sections {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}
</style>
