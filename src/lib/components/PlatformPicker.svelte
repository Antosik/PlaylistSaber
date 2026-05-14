<script lang="ts">
	import { Platform } from '$lib/types';

	let {
		value = $bindable<Platform>(Platform.ScoreSaber),
		groupName = 'playlist-saber-platform',
	}: {
		value?: Platform;
		groupName?: string;
	} = $props();
</script>

<div class="picker">
	<label class="option" class:active={value === Platform.ScoreSaber}>
		<input
			type="radio"
			class="sr-input"
			name={groupName}
			value={Platform.ScoreSaber}
			bind:group={value}
		/>
		<span class="option-body">
			<span class="dot" aria-hidden="true"></span>
			ScoreSaber
		</span>
	</label>
	<label class="option" class:active={value === Platform.BeatLeader}>
		<input
			type="radio"
			class="sr-input"
			name={groupName}
			value={Platform.BeatLeader}
			bind:group={value}
		/>
		<span class="option-body">
			<span class="dot" aria-hidden="true"></span>
			BeatLeader
		</span>
	</label>
</div>

<style>
	.picker {
		display: flex;
		gap: var(--spacing-sm);
	}

	.option {
		flex: 1;
		cursor: pointer;
		display: block;
	}

	.sr-input {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}

	.option-body {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		border-radius: var(--radius-md);
		border: 1.5px solid transparent;
		background: var(--color-surface-2);
		color: var(--color-text-muted);
		font-size: 14px;
		transition:
			border-color 0.15s,
			color 0.15s,
			background 0.15s;
	}

	.option:hover .option-body {
		border-color: rgba(255, 255, 255, 0.12);
		color: var(--color-text);
	}

	.option.active .option-body {
		border-color: var(--color-accent);
		color: var(--color-text);
		background: var(--color-accent-dim);
	}

	.sr-input:focus-visible + .option-body {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		border: 2px solid currentColor;
		flex-shrink: 0;
	}

	.option.active .dot {
		background: var(--color-accent);
		border-color: var(--color-accent);
	}
</style>
