<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- external BeatSaver URLs */
	import { getBeatSaverUrl, getOneClickUrl } from '$lib/map-links';
	import type { CoverageResult, PlayerSlot } from '$lib/types';

	let {
		result,
		slots,
	}: {
		result: CoverageResult;
		slots: PlayerSlot[];
	} = $props();

	// Group matches by slotIndex, pick best (highest pp) per slot
	let slotMatches = $derived(
		slots.map((slot, i) => {
			const m = result.matches.filter((m) => m.slotIndex === i).sort((a, b) => b.pp - a.pp)[0];
			return { slot, match: m };
		})
	);
</script>

<div class="card">
	<div class="song-header">
		<div>
			<span class="name">{result.songName}</span>
			<span class="artist">- {result.artist}</span>
		</div>
		<div class="map-links">
			<a
				href={getBeatSaverUrl(result.songHash)}
				target="_blank"
				rel="noopener noreferrer"
				class="map-link"
				title="Open on BeatSaver">BS</a
			>
			<a href={getOneClickUrl(result.songHash)} class="map-link" title="One-click install">↓</a>
		</div>
	</div>
	<div class="slots-container">
		{#each slotMatches as { slot, match }, i (i)}
			{#if match}
				<div class="slot-badge">
					<span class="player-name">{slot.label || `Slot ${i + 1}`}</span>
					<span class="badge-item diff">{match.difficulty}</span>
					<span class="badge-item stars">★{match.stars.toFixed(1)}</span>
					<span class="badge-item pp">{Math.round(match.pp)}pp</span>
				</div>
			{/if}
		{/each}
	</div>
</div>

<style>
	.card {
		border-radius: var(--radius-md);
		background: var(--color-surface);
		padding: var(--spacing-md);
	}

	.song-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 8px;
		font-size: 14px;
	}

	.name {
		font-weight: 600;
	}

	.artist {
		color: var(--color-text-muted);
		margin-left: 4px;
	}

	.map-links {
		display: flex;
		gap: 4px;
		align-items: center;
		flex-shrink: 0;
	}

	.map-link {
		font-size: 11px;
		padding: 2px 6px;
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.07);
		color: var(--color-text-muted);
		white-space: nowrap;
		text-decoration: none;
	}

	.map-link:hover {
		background: rgba(255, 255, 255, 0.14);
		color: var(--color-text);
	}

	.slots-container {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-top: 2px;
	}

	.slot-badge {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 6px;
		background: rgba(255, 255, 255, 0.04);
		border-radius: var(--radius-sm);
		font-size: 11px;
	}

	.player-name {
		min-width: 60px;
		color: var(--color-text);
		font-weight: 500;
		margin-right: auto;
	}

	.badge-item {
		padding: 2px 4px;
		background: rgba(255, 255, 255, 0.08);
		border-radius: 3px;
		white-space: nowrap;
	}

	.diff {
		color: var(--color-text-muted);
	}

	.stars {
		color: var(--color-star);
	}

	.pp {
		color: var(--color-pp);
	}
</style>
