<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="empty">
	{@render children()}
</div>

<style>
	.empty {
		background: var(--color-surface);
		border-radius: var(--radius-md);
		padding: var(--spacing-md);
		color: var(--color-text-muted);
		font-size: 13px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
</style>
