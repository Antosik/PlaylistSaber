<script lang="ts">
	let { label, step, totalSteps, loaded, total }: {
		label: string;
		step: number;
		totalSteps: number;
		loaded?: number;
		total?: number;
	} = $props();

	let pct = $derived(
		loaded != null && total != null && total > 0
			? Math.round((loaded / total) * 100)
			: Math.round(((step - 1) / totalSteps) * 100),
	);
</script>

<div class="wrap">
	<div class="label-row">
		<span>{label}</span>
		{#if loaded != null && total != null}
			<span class="count">{loaded.toLocaleString()} / {total.toLocaleString()}</span>
		{:else}
			<span class="count">step {step} of {totalSteps}</span>
		{/if}
	</div>
	<div class="track">
		<div class="fill" style="width: {pct}%"></div>
	</div>
</div>

<style>
	.wrap { display: flex; flex-direction: column; gap: 6px; }

	.label-row {
		display: flex;
		justify-content: space-between;
		font-size: 13px;
		color: var(--color-text);
	}

	.count { color: var(--color-text-muted); }

	.track {
		height: 6px;
		border-radius: 3px;
		background: rgba(255,255,255,0.08);
		overflow: hidden;
	}

	.fill {
		height: 100%;
		border-radius: 3px;
		background: var(--color-accent);
		transition: width 0.3s ease;
	}
</style>
