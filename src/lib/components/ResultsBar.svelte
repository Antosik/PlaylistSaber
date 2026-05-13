<script lang="ts">
	let { info, onNewSearch }: { info: string; onNewSearch: () => void } = $props();
</script>

<div class="bar">
	<span>{info}</span>
	<button type="button" class="new-search" onclick={onNewSearch}>New search</button>
</div>

<style>
	.bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-md);
		font-size: 13px;
		color: var(--color-text-muted);
	}

	.new-search {
		padding: 5px 12px;
		border-radius: var(--radius-sm);
		background: var(--color-surface);
		color: var(--color-text-muted);
		font-size: 12px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.new-search:hover {
		color: var(--color-text);
	}
</style>
