<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import CtaButton from '$lib/components/CtaButton.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import PlatformPicker from '$lib/components/PlatformPicker.svelte';
	import { getHistory, removeHistoryEntry, clearHistory } from '$lib/history';
	import type { HistoryEntry } from '$lib/history';
	import { Platform, DEFAULT_PLATFORM } from '$lib/types';
	import { parsePlayerInput } from '$lib/url-parsing';
	import { extractId } from '$lib/utils';

	type PlayerRow = { id: string; label: string; error?: string };

	let platform: Platform = $state(DEFAULT_PLATFORM);
	let players: PlayerRow[] = $state([
		{ id: '', label: 'You' },
		{ id: '', label: 'Friend 1' },
	]);
	let friendsHistory: HistoryEntry[] = $state(getHistory('with-friends'));

	function addPlayer() {
		players = [...players, { id: '', label: `Friend ${players.length}` }];
	}

	function removePlayer(i: number) {
		players = players.filter((_: PlayerRow, idx: number) => idx !== i);
	}

	let canSearch = $derived(
		players.length >= 2 && players.every((p) => p.id.trim()) && !players.some((p) => p.error)
	);

	function navigate(ids: string[]) {
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- search string follows resolved path
		goto(`${resolve(`/friends/${ids.join(',')}`)}?${new URLSearchParams({ platform })}`);
	}

	function search() {
		const ids = players.map((p) => {
			const parsed = parsePlayerInput(p.id.trim());
			return parsed.type === 'resolved' ? parsed.id : extractId(p.id.trim());
		});
		navigate(ids);
	}
</script>

<PageHeader
	title="Play with Friends"
	subtitle="Add everyone's profile - we'll find songs that work for all."
/>

<section>
	<!-- svelte-ignore a11y_label_has_associated_control -->
	<label>Platform</label>
	<PlatformPicker bind:value={platform} />
</section>

<section>
	<!-- svelte-ignore a11y_label_has_associated_control -->
	<label>Players</label>
	<div class="players-box">
		{#each players as player, i (`player-${i}`)}
			<div class="player-row">
				<input
					type="text"
					class="label-input"
					placeholder={i === 0 ? 'You' : `Friend ${i}`}
					bind:value={player.label}
				/>
				<div class="id-wrap" class:has-error={player.error}>
					<input
						type="text"
						class="id-input"
						qa="with-friends-player-id-input-{i}"
						placeholder="76561198… or profile URL"
						bind:value={player.id}
					/>
					{#if player.error}
						<span class="inline-error">✕ {player.error}</span>
					{/if}
				</div>
				{#if i > 0}
					<button type="button" class="remove" onclick={() => removePlayer(i)}>✕</button>
				{:else}
					<span class="remove-spacer"></span>
				{/if}
			</div>
		{/each}
		<button type="button" class="add-player" onclick={addPlayer}>+ Add player</button>
	</div>
</section>

<CtaButton disabled={!canSearch} onclick={search} qa="with-friends-generate-button">
	Find Matching Songs →
</CtaButton>

{#if friendsHistory.length > 0}
	<div qa="history-section" class="history-section">
		<div class="history-header">
			<span class="history-title">Recent searches</span>
			<button
				type="button"
				qa="history-clear"
				class="history-clear"
				onclick={() => {
					clearHistory('with-friends');
					friendsHistory = [];
				}}>Clear</button
			>
		</div>
		{#each friendsHistory as entry, i (`wf-${entry.feature}-${i}-${entry.timestamp}`)}
			{#if entry.feature === 'with-friends'}
				<div
					qa="history-entry"
					class="history-entry"
					role="button"
					tabindex="0"
					onclick={() => navigate(entry.playerIds)}
					onkeydown={(e) => e.key === 'Enter' && navigate(entry.playerIds)}
				>
					<span qa="history-entry-label" class="history-label">{entry.playerIds.join(', ')}</span>
					<span qa="history-entry-timestamp" class="history-ts"
						>{new Date(entry.timestamp).toLocaleDateString()}</span
					>
					<button
						type="button"
						qa="history-entry-remove"
						class="history-remove"
						onclick={(e) => {
							e.stopPropagation();
							removeHistoryEntry('with-friends', i);
							friendsHistory = getHistory('with-friends');
						}}>✕</button
					>
				</div>
			{/if}
		{/each}
	</div>
{/if}

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

	.players-box {
		background: var(--color-surface);
		border-radius: var(--radius-md);
		padding: var(--spacing-md);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.player-row {
		display: flex;
		gap: var(--spacing-sm);
		align-items: flex-start;
	}

	.label-input {
		width: 110px;
		flex-shrink: 0;
		padding: 8px 10px;
		border-radius: var(--radius-sm);
		border: 1.5px solid rgba(255, 255, 255, 0.08);
		background: var(--color-surface-2);
		color: var(--color-text);
		font-size: 13px;
		outline: none;
	}

	.label-input:focus {
		border-color: var(--color-accent);
	}

	.id-wrap {
		flex: 1;
		position: relative;
	}

	.id-input {
		width: 100%;
		padding: 8px 10px;
		border-radius: var(--radius-sm);
		border: 1.5px solid rgba(255, 255, 255, 0.08);
		background: var(--color-surface-2);
		color: var(--color-text);
		font-size: 13px;
		outline: none;
	}

	.id-input:focus {
		border-color: var(--color-accent);
	}
	.id-wrap.has-error .id-input {
		border-color: var(--color-error);
	}

	.inline-error {
		font-size: 11px;
		margin-top: 2px;
		display: block;
		color: var(--color-error);
	}

	.remove {
		flex-shrink: 0;
		width: 28px;
		height: 34px;
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		font-size: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.remove:hover {
		background: var(--color-error-dim);
		color: var(--color-error);
	}
	.remove-spacer {
		width: 28px;
		flex-shrink: 0;
	}

	.add-player {
		color: var(--color-accent);
		font-size: 13px;
		padding: 4px 0;
		text-align: left;
	}

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
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	}

	.history-title {
		font-size: 11px;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.history-clear {
		font-size: 11px;
		color: var(--color-text-muted);
	}
	.history-clear:hover {
		color: var(--color-error, #e55);
	}

	.history-entry {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: 8px 14px;
		cursor: pointer;
		border-bottom: 1px solid rgba(255, 255, 255, 0.04);
	}

	.history-entry:last-child {
		border-bottom: none;
	}
	.history-entry:hover {
		background: rgba(255, 255, 255, 0.04);
	}

	.history-label {
		flex: 1;
		font-size: 12px;
		color: var(--color-text);
		font-family: monospace;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.history-ts {
		font-size: 11px;
		color: var(--color-text-muted);
		white-space: nowrap;
	}
	.history-remove {
		font-size: 11px;
		color: var(--color-text-muted);
		padding: 2px 6px;
		border-radius: 4px;
	}
	.history-remove:hover {
		background: rgba(255, 255, 255, 0.08);
		color: var(--color-error, #e55);
	}
</style>
