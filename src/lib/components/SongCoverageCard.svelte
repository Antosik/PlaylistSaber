<script lang="ts">
	import type { CoverageResult, PlayerSlot, SkillRange } from '$lib/types';

	let {
		result,
		slots,
		ranges,
	}: {
		result: CoverageResult;
		slots: PlayerSlot[];
		ranges?: Map<number, SkillRange>; // slotIndex → derived range (With Friends only)
	} = $props();

	// Group matches by slotIndex, pick best (highest pp) per slot
	let slotMatches = $derived(
		slots.map((slot, i) => {
			const m = result.matches
				.filter((m) => m.slotIndex === i)
				.sort((a, b) => b.pp - a.pp)[0];
			return { slot, match: m };
		}),
	);

	function connector(i: number): string {
		return i === slots.length - 1 ? '└' : '├';
	}
</script>

<div class="card">
	<div class="song-header">
		<span class="name">{result.songName}</span>
		<span class="artist">- {result.artist}</span>
	</div>
	{#each slotMatches as { slot, match }, i}
		{#if match}
			<div class="slot-row">
				<span class="connector">{connector(i)}</span>
				<span class="label">{slot.label || `Slot ${i + 1}`}</span>
				{#if ranges?.has(i)}
					{@const r = ranges.get(i)!}
					<span class="range-tag">[★{r.min.toFixed(1)}–{r.max.toFixed(1)}]</span>
				{/if}
				<span class="diff">{match.difficulty}</span>
				<span class="stars">★ {match.stars.toFixed(1)}</span>
				<span class="pp">{Math.round(match.pp)}pp</span>
			</div>
		{/if}
	{/each}
</div>

<style>
	.card {
		border-radius: var(--radius-md);
		background: var(--color-surface);
		padding: var(--spacing-md);
	}

	.song-header {
		margin-bottom: 8px;
		font-size: 14px;
	}

	.name { font-weight: 600; }
	.artist { color: var(--color-text-muted); margin-left: 4px; }

	.slot-row {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		padding: 2px 0;
	}

	.connector { color: var(--color-text-muted); font-family: monospace; width: 12px; }

	.label { min-width: 80px; color: var(--color-text-muted); }

	.range-tag {
		font-size: 11px;
		color: var(--color-text-muted);
		background: rgba(255,255,255,0.06);
		padding: 1px 5px;
		border-radius: 3px;
	}

	.diff { color: var(--color-text-muted); }

	.stars { color: var(--color-star); margin-left: auto; }

	.pp { color: var(--color-pp); min-width: 50px; text-align: right; }
</style>
