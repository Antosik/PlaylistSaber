<script lang="ts">
	import { gotoPpImprovement } from '$lib/app-navigation';
	import CtaButton from '$lib/components/CtaButton.svelte';
	import HistorySection from '$lib/components/HistorySection.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import PlatformPicker from '$lib/components/PlatformPicker.svelte';
	import { getHistory } from '$lib/history';
	import type { HistoryEntry } from '$lib/history';
	import { Platform, DEFAULT_PLATFORM } from '$lib/types';
	import { parsePlayerInput } from '$lib/url-parsing';

	let platform: Platform = $state(DEFAULT_PLATFORM);
	let playerId: string = $state('');
	let inputError: string = $state('');
	let ppHistory: HistoryEntry[] = $state(getHistory('pp-improver'));

	function navigate(id: string) {
		gotoPpImprovement(id, platform);
	}

	function generate() {
		inputError = '';
		const parsed = parsePlayerInput(playerId.trim());
		if (parsed.type === 'error') {
			inputError = parsed.message;
			return;
		}
		navigate(parsed.id);
	}
</script>

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
		data-testid="pp-improver-player-id-input"
		type="text"
		placeholder="76561198… or paste your profile URL"
		bind:value={playerId}
		class:has-error={!!inputError}
		oninput={() => {
			inputError = '';
		}}
	/>
	{#if inputError}
		<span class="input-error">{inputError}</span>
	{/if}
</section>

<CtaButton disabled={!playerId.trim()} onclick={generate} data-testid="pp-improver-generate-button">
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
		border: 1.5px solid rgba(255, 255, 255, 0.1);
		background: var(--color-surface);
		color: var(--color-text);
		font-size: 14px;
		outline: none;
	}

	input:focus {
		border-color: var(--color-accent);
	}
	input::placeholder {
		color: var(--color-text-muted);
	}
	input.has-error {
		border-color: var(--color-error, #e55);
	}

	.input-error {
		display: block;
		margin-top: 4px;
		font-size: 12px;
		color: var(--color-error, #e55);
	}
</style>
