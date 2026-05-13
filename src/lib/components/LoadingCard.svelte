<script lang="ts">
	import type { Snippet } from 'svelte';

	import ProgressBar from './ProgressBar.svelte';

	let {
		label,
		title = label,
		step,
		totalSteps,
		loaded,
		total,
		onCancel,
		children,
	}: {
		label: string;
		title?: string;
		step: number;
		totalSteps: number;
		loaded?: number;
		total?: number;
		onCancel: () => void;
		children?: Snippet;
	} = $props();
</script>

<div class="card">
	<div class="header">
		<span class="title">{title}</span>
		<button type="button" class="cancel" onclick={onCancel}>✕</button>
	</div>
	{@render children?.()}
	<ProgressBar {label} {step} {totalSteps} {loaded} {total} />
</div>

<style>
	.card {
		background: var(--color-surface);
		border-radius: var(--radius-md);
		padding: var(--spacing-md);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.title {
		font-size: 14px;
		color: var(--color-text);
	}

	.cancel {
		color: var(--color-text-muted);
		font-size: 16px;
		padding: 4px 8px;
		border-radius: var(--radius-sm);
	}

	.cancel:hover {
		color: var(--color-text);
		background: rgba(255, 255, 255, 0.06);
	}
</style>
