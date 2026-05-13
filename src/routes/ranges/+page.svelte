<script lang="ts">
	import { gotoRangesSearch } from '$lib/app-navigation';
	import CtaButton from '$lib/components/CtaButton.svelte';
	import HistorySection from '$lib/components/HistorySection.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import PlatformPicker from '$lib/components/PlatformPicker.svelte';
	import { getHistory } from '$lib/history';
	import type { HistoryEntry } from '$lib/history';
	import { Platform, DEFAULT_PLATFORM } from '$lib/types';

	type SlotRow = { label: string; min: string; max: string };

	let platform: Platform = $state(DEFAULT_PLATFORM);
	let slotRows: SlotRow[] = $state([
		{ label: 'You (optional)', min: '', max: '' },
		{ label: 'Friend 1', min: '', max: '' },
	]);
	let rangesHistory: HistoryEntry[] = $state(getHistory('ranges'));

	function addSlot() {
		slotRows = [...slotRows, { label: `Friend ${slotRows.length}`, min: '', max: '' }];
	}

	function removeSlot(i: number) {
		slotRows = slotRows.filter((_: SlotRow, idx: number) => idx !== i);
	}

	function hasRangeError(r: SlotRow): boolean {
		return r.min !== '' && r.max !== '' && parseFloat(r.min) > parseFloat(r.max);
	}

	let canSearch = $derived(
		slotRows.length >= 2 &&
			slotRows.every((r) => r.min !== '' || r.max !== '') &&
			!slotRows.some(hasRangeError)
	);

	function navigate(rangeStrs: string[]) {
		gotoRangesSearch(rangeStrs, platform);
	}

	function search() {
		const rangeStrs = slotRows.map((r) => `${r.min}-${r.max}`);
		navigate(rangeStrs);
	}
</script>

<PageHeader
	title="Ranges"
	subtitle="Manually set star ranges and find songs that cover all of them. Use this when you don't have everyone's profile handy."
/>

<section>
	<!-- svelte-ignore a11y_label_has_associated_control -->
	<label>Platform</label>
	<PlatformPicker bind:value={platform} />
</section>

<section>
	<!-- svelte-ignore a11y_label_has_associated_control -->
	<label>Star Ranges</label>
	<div class="slots-box">
		{#each slotRows as row, i (`slot-${i}`)}
			<div class="slot-row">
				<input
					type="text"
					class="label-input"
					placeholder={i === 0 ? 'You (optional)' : `Friend ${i}`}
					bind:value={row.label}
				/>
				<span class="star-icon">★</span>
				<input
					type="number"
					class="star-input"
					data-testid="ranges-slot-{i}-min"
					placeholder="min"
					min="0"
					step="0.1"
					bind:value={row.min}
					class:error={hasRangeError(row)}
				/>
				<span class="sep">–</span>
				<input
					type="number"
					class="star-input"
					data-testid="ranges-slot-{i}-max"
					placeholder="max"
					min="0"
					step="0.1"
					bind:value={row.max}
					class:error={hasRangeError(row)}
				/>
				{#if i > 0}
					<button type="button" class="remove" onclick={() => removeSlot(i)}>✕</button>
				{:else}
					<span class="remove-spacer"></span>
				{/if}
			</div>
			{#if hasRangeError(row)}
				<p class="range-error">Min must be ≤ max</p>
			{/if}
		{/each}
		<button type="button" class="add-slot" onclick={addSlot}>+ Add range</button>
	</div>
</section>

<CtaButton disabled={!canSearch} onclick={search} data-testid="ranges-generate-button">
	Find Matching Songs →
</CtaButton>

<HistorySection
	bind:entries={rangesHistory}
	feature="ranges"
	onActivate={(e) => {
		if (e.feature === 'ranges') navigate(e.ranges);
	}}
/>

<style>
	section {
		margin-bottom: var(--spacing-md);
	}

	label {
		display: block;
		font-size: 12px;
		color: var(--color-text-muted);
		margin-bottom: 6px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.slots-box {
		background: var(--color-surface);
		border-radius: var(--radius-md);
		padding: var(--spacing-md);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.slot-row {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.label-input {
		width: 120px;
		flex-shrink: 0;
		padding: 8px 10px;
		border-radius: var(--radius-sm);
		border: 1.5px solid rgba(255, 255, 255, 0.08);
		background: var(--color-surface-2);
		color: var(--color-text);
		font-size: 13px;
		outline: none;
	}

	.label-input:focus {
		border-color: var(--color-accent);
	}

	.star-icon {
		color: var(--color-star);
		font-size: 13px;
	}
	.sep {
		color: var(--color-text-muted);
	}

	.star-input {
		width: 72px;
		padding: 8px 10px;
		border-radius: var(--radius-sm);
		border: 1.5px solid rgba(255, 255, 255, 0.08);
		background: var(--color-surface-2);
		color: var(--color-text);
		font-size: 13px;
		outline: none;
	}

	.star-input:focus {
		border-color: var(--color-accent);
	}
	.star-input.error {
		border-color: var(--color-error);
	}

	input[type='number']::-webkit-inner-spin-button {
		opacity: 0.5;
	}

	.range-error {
		font-size: 11px;
		color: var(--color-error);
		margin-left: 132px;
		margin-top: -4px;
	}

	.remove {
		flex-shrink: 0;
		width: 28px;
		height: 34px;
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		font-size: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.remove:hover {
		background: var(--color-error-dim);
		color: var(--color-error);
	}
	.remove-spacer {
		width: 28px;
		flex-shrink: 0;
	}

	.add-slot {
		color: var(--color-accent);
		font-size: 13px;
		padding: 4px 0;
		text-align: left;
	}
</style>
