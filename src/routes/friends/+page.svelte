<script lang="ts">
	import { gotoFriendsSearch } from '$lib/app-navigation';
	import CtaButton from '$lib/components/CtaButton.svelte';
	import HistorySection from '$lib/components/HistorySection.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import PlatformPicker from '$lib/components/PlatformPicker.svelte';
	import PlayerProfileUrlField from '$lib/components/PlayerProfileUrlField.svelte';
	import { getHistory } from '$lib/history';
	import type { HistoryEntry } from '$lib/history';
	import { Platform, DEFAULT_PLATFORM } from '$lib/types';
	import { parsePlayerInput, profileInputValidationMessage } from '$lib/url-parsing';

	type PlayerRow = { id: string };

	let platform: Platform = $state(DEFAULT_PLATFORM);
	let players: PlayerRow[] = $state([{ id: '' }, { id: '' }]);
	let friendsHistory: HistoryEntry[] = $state(getHistory('with-friends'));

	function addPlayer() {
		players = [...players, { id: '' }];
	}

	function removePlayer(i: number) {
		players = players.filter((_, idx) => idx !== i);
	}

	let canSearch = $derived(
		players.length >= 2 &&
			players.every((p) => p.id.trim() !== '' && profileInputValidationMessage(p.id) === '')
	);

	function navigate(ids: string[]) {
		gotoFriendsSearch(ids, platform);
	}

	function search() {
		const parsed = players.map((p) => parsePlayerInput(p.id.trim()));
		if (!parsed.every((r): r is { type: 'resolved'; id: string } => r.type === 'resolved')) {
			return;
		}
		navigate(parsed.map((r) => r.id));
	}
</script>

<PageHeader
	title="Play with Friends"
	subtitle="Add everyone's profile - we'll find songs that work for all."
/>

<section>
	<fieldset class="form-field-group">
		<legend>Platform</legend>
		<PlatformPicker bind:value={platform} />
	</fieldset>
</section>

<section>
	<fieldset class="form-field-group">
		<legend>Players</legend>
		<div class="players-box">
			{#each players as player, i (`player-${i}`)}
				<div class="player-row">
					<span class="player-index">{i + 1}</span>
					<div class="id-wrap">
						<PlayerProfileUrlField
							variant="compact"
							bind:value={player.id}
							error={profileInputValidationMessage(player.id)}
							dataTestId={`with-friends-player-id-input-${i}`}
							ariaLabel={`Player ${i + 1} profile URL or ID`}
						/>
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
	</fieldset>
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
