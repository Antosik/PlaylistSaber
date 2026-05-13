<script lang="ts">
	import type { Snippet } from 'svelte';

	type CtaProps = {
		disabled?: boolean;
		onclick: () => void;
		children: Snippet;
		'data-testid'?: string;
	};

	let {
		disabled = false,
		onclick,
		children,
		...rest
	}: CtaProps = $props();
</script>

<div class="wrap">
	<button type="button" class="cta" {...rest} {disabled} {onclick}>
		{@render children()}
	</button>
</div>

<style>
	.wrap {
		display: flex;
		justify-content: center;
		margin-top: var(--spacing-lg);
	}

	.cta {
		padding: 12px 28px;
		border-radius: var(--radius-md);
		background: var(--color-accent);
		color: #fff;
		font-size: 14px;
		font-weight: 600;
		transition: opacity 0.15s;
	}

	.cta:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.cta:hover:not(:disabled) {
		opacity: 0.9;
	}
</style>
