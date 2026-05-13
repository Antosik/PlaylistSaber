<script lang="ts">
	import { goto } from '$app/navigation';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import PlatformPicker from '$lib/components/PlatformPicker.svelte';
	import CtaButton from '$lib/components/CtaButton.svelte';
	import { parsePlayerInput } from '$lib/url-parsing';
	import { getHistory, removeHistoryEntry, clearHistory } from '$lib/history';
	import type { HistoryEntry } from '$lib/history';
	import { Platform, DEFAULT_PLATFORM } from '$lib/types';

	let platform: Platform = $state(DEFAULT_PLATFORM);
	let playerId: string = $state('');
	let inputError: string = $state('');
	let ppHistory: HistoryEntry[] = $state(getHistory('pp-improver'));

	function navigate(id: string) {
		goto(`/u/${id}?platform=${platform}`);
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

	function formatTs(ts: number): string {
		const d = new Date(ts);
		return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
		qa="pp-improver-player-id-input"
		type="text"
		placeholder="76561198… or paste your profile URL"
		bind:value={playerId}
		class:has-error={!!inputError}
		oninput={() => { inputError = ''; }}
	/>
	{#if inputError}
		<span class="input-error">{inputError}</span>
	{/if}
</section>

<CtaButton disabled={!playerId.trim()} onclick={generate} qa="pp-improver-generate-button">
	Generate PP Playlist →
</CtaButton>

{#if ppHistory.length > 0}
	<div qa="history-section" class="history-section">
		<div class="history-header">
			<span class="history-title">Recent searches</span>
			<button type="button" qa="history-clear" class="history-clear" onclick={() => { clearHistory('pp-improver'); ppHistory = []; }}>Clear</button>
		</div>
		{#each ppHistory as entry, i}
			{#if entry.feature === 'pp-improver'}
				<div qa="history-entry" class="history-entry" role="button" tabindex="0"
					onclick={() => navigate(entry.playerId)}
					onkeydown={(e) => e.key === 'Enter' && navigate(entry.playerId)}>
					<span qa="history-entry-label" class="history-label">{entry.playerId}</span>
					<span qa="history-entry-timestamp" class="history-ts">{formatTs(entry.timestamp)}</span>
					<button type="button" qa="history-entry-remove" class="history-remove"
						onclick={(e) => { e.stopPropagation(); removeHistoryEntry('pp-improver', i); ppHistory = getHistory('pp-improver'); }}>✕</button>
				</div>
			{/if}
		{/each}
	</div>
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
	input.has-error { border-color: var(--color-error, #e55); }

	.input-error { display: block; margin-top: 4px; font-size: 12px; color: var(--color-error, #e55); }

	.history-section {
		margin-top: var(--spacing-md);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		overflow: hidden;
	}

	.history-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 14px;
		border-bottom: 1px solid rgba(255,255,255,0.06);
	}

	.history-title { font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
	.history-clear { font-size: 11px; color: var(--color-text-muted); }
	.history-clear:hover { color: var(--color-error, #e55); }

	.history-entry {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: 8px 14px;
		cursor: pointer;
		border-bottom: 1px solid rgba(255,255,255,0.04);
	}

	.history-entry:last-child { border-bottom: none; }
	.history-entry:hover { background: rgba(255,255,255,0.04); }

	.history-label { flex: 1; font-size: 13px; color: var(--color-text); font-family: monospace; }
	.history-ts { font-size: 11px; color: var(--color-text-muted); white-space: nowrap; }
	.history-remove { font-size: 11px; color: var(--color-text-muted); padding: 2px 6px; border-radius: 4px; }
	.history-remove:hover { background: rgba(255,255,255,0.08); color: var(--color-error, #e55); }
</style>
