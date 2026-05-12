<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import PlatformPicker from '$lib/components/PlatformPicker.svelte';
	import SongCoverageCard from '$lib/components/SongCoverageCard.svelte';
	import ErrorBanner from '$lib/components/ErrorBanner.svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import ResultsBar from '$lib/components/ResultsBar.svelte';
	import CtaButton from '$lib/components/CtaButton.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { getPlatformApi } from '$lib/api/platform';
	import { findCoveringSongs } from '$lib/domain/coverage';
	import { coverageToBplist, downloadBplist } from '$lib/playlist';
	import { Platform } from '$lib/types';
	import type { CoverageResult, PlayerSlot } from '$lib/types';

	type SlotRow = { label: string; min: string; max: string };

	type View =
		| { phase: 'input' }
		| { phase: 'loading'; step: number; stepLabel: string; loaded?: number; total?: number; cancel: () => void }
		| { phase: 'results'; platform: string; slotCount: number; results: CoverageResult[]; slots: PlayerSlot[] }
		| { phase: 'error'; message: string };

	let platform: Platform = $state(Platform.ScoreSaber);
	let slotRows: SlotRow[] = $state([
		{ label: 'You (optional)', min: '', max: '' },
		{ label: 'Friend 1', min: '', max: '' },
	]);
	let view: View = $state({ phase: 'input' });

	function addSlot() {
		slotRows = [...slotRows, { label: `Friend ${slotRows.length}`, min: '', max: '' }];
	}

	function removeSlot(i: number) {
		slotRows = slotRows.filter((_: SlotRow, idx: number) => idx !== i);
	}

	function parseSlots(): PlayerSlot[] {
		return slotRows.map((r) => ({
			label: r.label || '',
			min: r.min !== '' ? parseFloat(r.min) : null,
			max: r.max !== '' ? parseFloat(r.max) : null,
		}));
	}

	function hasRangeError(r: SlotRow): boolean {
		if (r.min !== '' && r.max !== '' && parseFloat(r.min) > parseFloat(r.max)) return true;
		return false;
	}

	let canSearch = $derived(
		slotRows.length >= 2 &&
		slotRows.every((r) => r.min !== '' || r.max !== '') &&
		!slotRows.some(hasRangeError),
	);

	async function search() {
		let cancelled = false;
		const cancel = () => { cancelled = true; view = { phase: 'input' }; };
		const slots = parseSlots();

		view = { phase: 'loading', step: 1, stepLabel: 'Fetching ranked maps…', loaded: 0, total: undefined, cancel };

		try {
			const { getRankedMaps, label } = getPlatformApi(platform);

			const rankedMaps = await getRankedMaps((loaded, total) => {
				if (!cancelled) view = { ...view as Extract<View, { phase: 'loading' }>, loaded, total };
			});
			if (cancelled) return;

			view = { ...view as Extract<View, { phase: 'loading' }>, step: 2, stepLabel: 'Calculating song coverage…', loaded: undefined, total: undefined };
			const results = findCoveringSongs(rankedMaps, slots);
			if (cancelled) return;

			view = { phase: 'results', platform: label, slotCount: slots.length, results, slots };
		} catch (e: unknown) {
			if (!cancelled) {
				const msg = e instanceof Error ? e.message : 'Unknown error';
				view = { phase: 'error', message: `Could not fetch ranked maps. (${msg})` };
			}
		}
	}

	const INITIAL_SHOW = 10;
	let expanded = $state(false);
</script>

{#if view.phase === 'input'}
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
			{#each slotRows as row, i}
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

	<CtaButton disabled={!canSearch} onclick={search}>
		Find Matching Songs →
	</CtaButton>

{:else if view.phase === 'loading'}
	<LoadingCard
		label={view.stepLabel}
		step={view.step}
		totalSteps={2}
		loaded={view.loaded}
		total={view.total}
		onCancel={view.cancel}
	/>

{:else if view.phase === 'results'}
	<ResultsBar
		info="{view.platform} · {view.slotCount} ranges"
		onNewSearch={() => (view = { phase: 'input' })}
	/>

	{#if view.results.length === 0}
		<EmptyState>
			<p>No songs found that cover all ranges on {view.platform}.</p>
			<p>Try widening one or more star ranges.</p>
		</EmptyState>
	{:else}
		<p class="summary">{view.results.length} songs cover all {view.slotCount} ranges</p>
		<div class="cards">
			{#each (expanded ? view.results : view.results.slice(0, INITIAL_SHOW)) as result}
				<SongCoverageCard {result} slots={view.slots} />
			{/each}
		</div>
		{#if !expanded && view.results.length > INITIAL_SHOW}
			<button type="button" class="show-more" onclick={() => (expanded = true)}>
				Show more - {view.results.length - INITIAL_SHOW} more songs
			</button>
		{/if}
		<CtaButton onclick={() => {
			const s = view as Extract<View, { phase: 'results' }>;
			downloadBplist(coverageToBplist(s.results, 'Ranges'));
		}}>
			↓ Download Playlist ({view.results.length} songs)
		</CtaButton>
	{/if}

{:else if view.phase === 'error'}
	<ErrorBanner message={view.message} onRetry={() => (view = { phase: 'input' })} />
{/if}

<style>
	section { margin-bottom: var(--spacing-md); }

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

	.slot-row { display: flex; align-items: center; gap: var(--spacing-sm); }

	.label-input {
		width: 120px;
		flex-shrink: 0;
		padding: 8px 10px;
		border-radius: var(--radius-sm);
		border: 1.5px solid rgba(255,255,255,0.08);
		background: var(--color-surface-2);
		color: var(--color-text);
		font-size: 13px;
		outline: none;
	}

	.label-input:focus { border-color: var(--color-accent); }

	.star-icon { color: var(--color-star); font-size: 13px; }
	.sep { color: var(--color-text-muted); }

	.star-input {
		width: 72px;
		padding: 8px 10px;
		border-radius: var(--radius-sm);
		border: 1.5px solid rgba(255,255,255,0.08);
		background: var(--color-surface-2);
		color: var(--color-text);
		font-size: 13px;
		outline: none;
	}

	.star-input:focus { border-color: var(--color-accent); }
	.star-input.error { border-color: var(--color-error); }

	input[type=number]::-webkit-inner-spin-button { opacity: 0.5; }

	.range-error { font-size: 11px; color: var(--color-error); margin-left: 132px; margin-top: -4px; }

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

	.remove:hover { background: var(--color-error-dim); color: var(--color-error); }
	.remove-spacer { width: 28px; flex-shrink: 0; }

	.add-slot { color: var(--color-accent); font-size: 13px; padding: 4px 0; text-align: left; }

	.summary { color: var(--color-text-muted); font-size: 13px; margin-bottom: var(--spacing-md); }
	.cards { display: flex; flex-direction: column; gap: var(--spacing-sm); }

	.show-more {
		display: block;
		width: 100%;
		margin-top: var(--spacing-sm);
		padding: 10px;
		text-align: center;
		color: var(--color-text-muted);
		font-size: 13px;
		background: var(--color-surface);
		border-radius: var(--radius-md);
	}

	.show-more:hover { color: var(--color-text); }
</style>
