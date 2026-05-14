<script lang="ts">
	import { gotoPpImprovement } from '$lib/app-navigation';
	import CtaButton from '$lib/components/CtaButton.svelte';
	import HistorySection from '$lib/components/HistorySection.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import PlatformPicker from '$lib/components/PlatformPicker.svelte';
	import PlayerProfileUrlField from '$lib/components/PlayerProfileUrlField.svelte';
	import { getHistory } from '$lib/history';
	import type { HistoryEntry } from '$lib/history';
	import { Platform, DEFAULT_PLATFORM } from '$lib/types';
	import { parsePlayerInput } from '$lib/url-parsing';

	let platform: Platform = $state(DEFAULT_PLATFORM);
	let playerId: string = $state('');
	let ppHistory: HistoryEntry[] = $state(getHistory('pp-improver'));

	let trimmedId = $derived(playerId.trim());
	let ppParsed = $derived(trimmedId === '' ? null : parsePlayerInput(trimmedId));
	let validationError = $derived(ppParsed?.type === 'error' ? ppParsed.message : '');
	let canGenerate = $derived(ppParsed?.type === 'resolved');

	function navigate(id: string) {
		gotoPpImprovement(id, platform);
	}

	function generate() {
		if (!ppParsed || ppParsed.type !== 'resolved') return;
		navigate(ppParsed.id);
	}
</script>

<PageHeader
	title="Improve Your PP"
	subtitle="Find ranked maps where you can gain the most performance points - split into new maps and maps you can still improve."
/>

<section>
	<fieldset class="form-field-group">
		<legend>Platform</legend>
		<PlatformPicker bind:value={platform} />
	</fieldset>
</section>

<section>
	<PlayerProfileUrlField
		label="Player ID"
		inputId="player-id"
		bind:value={playerId}
		error={validationError}
		dataTestId="pp-improver-player-id-input"
	/>
</section>

<CtaButton disabled={!canGenerate} onclick={generate} data-testid="pp-improver-generate-button">
	Generate PP Playlist →
</CtaButton>

<HistorySection
	bind:entries={ppHistory}
	feature="pp-improver"
	onActivate={(e) => {
		if (e.feature === 'pp-improver') navigate(e.playerId);
	}}
/>

<style>
	section {
		margin-bottom: var(--spacing-md);
	}

</style>
