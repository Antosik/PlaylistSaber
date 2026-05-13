<script lang="ts">
	import { Platform } from '$lib/types';

	let { value = $bindable<Platform>(Platform.ScoreSaber) } = $props();
</script>

<div class="picker">
	<button
		type="button"
		class:active={value === Platform.ScoreSaber}
		onclick={() => (value = Platform.ScoreSaber)}
	>
		<span class="dot"></span>
		ScoreSaber
	</button>
	<button
		type="button"
		class:active={value === Platform.BeatLeader}
		onclick={() => (value = Platform.BeatLeader)}
	>
		<span class="dot"></span>
		BeatLeader
	</button>
</div>

<style>
	.picker {
		display: flex;
		gap: var(--spacing-sm);
	}

	button {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		border-radius: var(--radius-md);
		border: 1.5px solid transparent;
		background: var(--color-surface-2);
		color: var(--color-text-muted);
		font-size: 14px;
		transition: all 0.15s;
	}

	button:hover {
		border-color: rgba(255, 255, 255, 0.12);
		color: var(--color-text);
	}

	button.active {
		border-color: var(--color-accent);
		color: var(--color-text);
		background: var(--color-accent-dim);
	}

	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		border: 2px solid currentColor;
		flex-shrink: 0;
	}

	button.active .dot {
		background: var(--color-accent);
		border-color: var(--color-accent);
	}
</style>
