<script lang="ts">
	let { message, onRetry }: { message: string; onRetry?: () => void } = $props();
</script>

<div class="banner">
	<span class="icon">✕</span>
	<p>{message}</p>
	{#if onRetry}
		<button type="button" onclick={onRetry}>Try again</button>
	{/if}
</div>

<style>
	.banner {
		display: flex;
		align-items: flex-start;
		gap: var(--spacing-sm);
		padding: 14px var(--spacing-md);
		border-radius: var(--radius-md);
		border-left: 3px solid var(--color-error);
		background: var(--color-error-dim);
		color: var(--color-text);
	}

	.icon {
		color: var(--color-error);
		flex-shrink: 0;
		font-size: 13px;
		margin-top: 1px;
	}

	p {
		flex: 1;
		font-size: 13px;
	}

	button {
		flex-shrink: 0;
		padding: 4px 10px;
		border-radius: var(--radius-sm);
		background: var(--color-error);
		color: #fff;
		font-size: 12px;
	}
</style>
