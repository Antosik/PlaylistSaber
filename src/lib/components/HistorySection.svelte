<script lang="ts">
	import { formatHistoryDateTime } from '$lib/format-datetime';
	import { clearHistory, getHistory, removeHistoryEntry } from '$lib/history';
	import type { HistoryEntry } from '$lib/history';

	let {
		feature,
		entries = $bindable(),
		labelFor,
		onActivate,
	}: {
		feature: HistoryEntry['feature'];
		entries: HistoryEntry[];
		labelFor: (entry: HistoryEntry) => string;
		onActivate: (entry: HistoryEntry) => void;
	} = $props();
</script>

{#if entries.length > 0}
	<div data-testid="history-section" class="history-section">
		<div class="history-header">
			<span class="history-title">Recent searches</span>
			<button
				type="button"
				data-testid="history-clear"
				class="history-clear"
				onclick={() => {
					clearHistory(feature);
					entries = getHistory(feature);
				}}>Clear</button
			>
		</div>
		{#each entries as entry, i (`${feature}-${i}-${entry.timestamp}`)}
			<div
				data-testid="history-entry"
				class="history-entry"
				role="button"
				tabindex="0"
				onclick={() => onActivate(entry)}
				onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && onActivate(entry)}
			>
				<span data-testid="history-entry-label" class="history-label">{labelFor(entry)}</span>
				<span data-testid="history-entry-timestamp" class="history-ts"
					>{formatHistoryDateTime(entry.timestamp)}</span
				>
				<button
					type="button"
					data-testid="history-entry-remove"
					class="history-remove"
					onclick={(e) => {
						e.stopPropagation();
						removeHistoryEntry(feature, i);
						entries = getHistory(feature);
					}}>✕</button
				>
			</div>
		{/each}
	</div>
{/if}

<style>
	.history-section {
		margin-top: var(--spacing-md);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		overflow: hidden;
	}

	.history-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 14px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	}

	.history-title {
		font-size: 11px;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.history-clear {
		font-size: 11px;
		color: var(--color-text-muted);
	}
	.history-clear:hover {
		color: var(--color-error, #e55);
	}

	.history-entry {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: 8px 14px;
		cursor: pointer;
		border-bottom: 1px solid rgba(255, 255, 255, 0.04);
	}

	.history-entry:last-child {
		border-bottom: none;
	}
	.history-entry:hover {
		background: rgba(255, 255, 255, 0.04);
	}

	.history-label {
		flex: 1;
		min-width: 0;
		font-size: 13px;
		color: var(--color-text);
		font-family: monospace;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.history-ts {
		font-size: 11px;
		color: var(--color-text-muted);
		white-space: nowrap;
	}
	.history-remove {
		font-size: 11px;
		color: var(--color-text-muted);
		padding: 2px 6px;
		border-radius: 4px;
	}
	.history-remove:hover {
		background: rgba(255, 255, 255, 0.08);
		color: var(--color-error, #e55);
	}
</style>
