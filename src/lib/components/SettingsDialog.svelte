<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		content,
		dialogEl = $bindable<HTMLDialogElement | null>(null),
	}: {
		title: string;
		content: Snippet;
		dialogEl?: HTMLDialogElement | null;
	} = $props();

	function openDialog() {
		dialogEl?.showModal();
	}

	function closeDialog() {
		dialogEl?.close();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === dialogEl) {
			closeDialog();
		}
	}
</script>

<button type="button" class="settings-btn" aria-label="Settings" onclick={openDialog}> ⚙ </button>

<dialog bind:this={dialogEl} class="settings-dialog" onclick={handleBackdropClick}>
	<div class="dialog-header">
		<h3>{title}</h3>
		<button type="button" class="close-btn" onclick={closeDialog}>✕</button>
	</div>
	<div class="dialog-body">
		{@render content()}
	</div>
</dialog>

<style>
	.settings-btn {
		padding: 5px 8px;
		border-radius: var(--radius-sm);
		background: rgba(255, 255, 255, 0.06);
		color: var(--color-text-muted);
		font-size: 13px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s;
	}

	.settings-btn:hover {
		background: rgba(255, 255, 255, 0.12);
		color: var(--color-text);
	}

	.settings-dialog {
		background: var(--color-surface);
		color: var(--color-text);
		border: 1.5px solid rgba(255, 255, 255, 0.1);
		border-radius: var(--radius-md);
		padding: 0;
		min-width: 300px;
		max-width: 420px;
		width: 90vw;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
		position: fixed;
		top: 50%;
		left: 50%;
		translate: -50% -50%;
	}

	.settings-dialog::backdrop {
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
	}

	.dialog-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-md);
		border-bottom: 1.5px solid rgba(255, 255, 255, 0.06);
	}

	.dialog-header h3 {
		font-size: 14px;
		font-weight: 600;
		margin: 0;
	}

	.close-btn {
		background: none;
		border: none;
		color: var(--color-text-muted);
		font-size: 16px;
		cursor: pointer;
		padding: 4px 8px;
		margin: -4px -8px;
		border-radius: var(--radius-sm);
		transition:
			background 0.15s,
			color 0.15s;
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.08);
		color: var(--color-text);
	}

	.dialog-body {
		padding: var(--spacing-md);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}
</style>
