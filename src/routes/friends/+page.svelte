<script lang="ts">
	import { gotoFriendsSearch } from '$lib/app-navigation';
	import CtaButton from '$lib/components/CtaButton.svelte';
	import HistorySection from '$lib/components/HistorySection.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import PlatformPicker from '$lib/components/PlatformPicker.svelte';
	import { getHistory } from '$lib/history';
	import type { HistoryEntry } from '$lib/history';
	import { Platform, DEFAULT_PLATFORM } from '$lib/types';
	import { extractId, parsePlayerInput } from '$lib/url-parsing';

	type PlayerRow = { id: string; error?: string };

	let platform: Platform = $state(DEFAULT_PLATFORM);
	let players: PlayerRow[] = $state([{ id: '' }, { id: '' }]);
	let friendsHistory: HistoryEntry[] = $state(getHistory('with-friends'));

	function addPlayer() {
		players = [...players, { id: '' }];
	}

	function removePlayer(i: number) {
		players = players.filter((_: PlayerRow, idx: number) => idx !== i);
	}

	let canSearch = $derived(
		players.length >= 2 && players.every((p) => p.id.trim()) && !players.some((p) => p.error)
	);

	function navigate(ids: string[]) {
		gotoFriendsSearch(ids, platform);
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
				<span class="player-index">{i + 1}</span>
				<div class="id-wrap" class:has-error={player.error}>
					<input
						type="text"
						class="id-input"
						data-testid="with-friends-player-id-input-{i}"
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

<CtaButton disabled={!canSearch} onclick={search} data-testid="with-friends-generate-button">
	Find Matching Songs →
</CtaButton>

<HistorySection
	bind:entries={friendsHistory}
	feature="with-friends"
	onActivate={(e) => {
		if (e.feature === 'with-friends') navigate(e.playerIds);
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

	.player-index {
		flex-shrink: 0;
		width: 22px;
		height: 34px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		font-variant-numeric: tabular-nums;
		color: var(--color-text-muted);
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
</style>
