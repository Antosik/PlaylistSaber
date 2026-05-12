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
	import { deriveSkillRange } from '$lib/domain/skill-range';
	import { findCoveringSongs } from '$lib/domain/coverage';
	import { coverageToBplist, downloadBplist } from '$lib/playlist';
	import { extractId } from '$lib/utils';
	import { Platform } from '$lib/types';
	import type { CoverageResult, PlayerSlot, SkillRange } from '$lib/types';

	type PlayerRow = { id: string; label: string; error?: string; warning?: string };

	type View =
		| { phase: 'input' }
		| { phase: 'loading'; playerProgress: Array<{ label: string; status: 'waiting' | 'fetching' | 'done'; range?: SkillRange }>; step: number; stepLabel: string; loaded?: number; total?: number; cancel: () => void }
		| { phase: 'results'; platform: string; playerCount: number; results: CoverageResult[]; slots: PlayerSlot[]; ranges: Map<number, SkillRange> }
		| { phase: 'error'; message: string };

	let platform: Platform = $state(Platform.ScoreSaber);
	let players: PlayerRow[] = $state([
		{ id: '', label: 'You' },
		{ id: '', label: 'Friend 1' },
	]);
	let view: View = $state({ phase: 'input' });

	function addPlayer() {
		players = [...players, { id: '', label: `Friend ${players.length}` }];
	}

	function removePlayer(i: number) {
		players = players.filter((_: PlayerRow, idx: number) => idx !== i);
	}

	let canSearch = $derived(
		players.length >= 2 &&
		players.every((p) => p.id.trim()) &&
		!players.some((p) => p.error),
	);

	async function search() {
		let cancelled = false;
		const cancel = () => { cancelled = true; view = { phase: 'input' }; };

		const progress = players.map((p) => ({ label: p.label || p.id, status: 'waiting' as const }));
		view = { phase: 'loading', playerProgress: progress, step: 1, stepLabel: 'Fetching player scores…', cancel };

		try {
			const api = getPlatformApi(platform);
			const slots: PlayerSlot[] = [];
			const derivedRanges = new Map<number, SkillRange>();

			for (let i = 0; i < players.length; i++) {
				if (cancelled) return;
				const id = extractId(players[i].id);
				type PP = { label: string; status: 'waiting' | 'fetching' | 'done'; range?: SkillRange };
				const prog: PP[] = [...(view as Extract<View, { phase: 'loading' }>).playerProgress];
				prog[i] = { ...prog[i], status: 'fetching' };
				view = { ...view as Extract<View, { phase: 'loading' }>, playerProgress: prog };

				const scores = await api.getScores(id);
				if (cancelled) return;

				const range = deriveSkillRange(scores);
				prog[i] = { ...prog[i], status: 'done', range: range ?? undefined };
				view = { ...view as Extract<View, { phase: 'loading' }>, playerProgress: [...prog] };

				if (range) {
					slots.push({ label: players[i].label || `Friend ${i}`, min: range.min, max: range.max });
					derivedRanges.set(slots.length - 1, range);
				}
			}

			if (cancelled) return;

			view = { ...view as Extract<View, { phase: 'loading' }>, step: 2, stepLabel: 'Fetching ranked maps…', loaded: 0, total: undefined };
			const rankedMaps = await api.getRankedMaps((loaded: number, total: number) => {
				if (!cancelled) view = { ...view as Extract<View, { phase: 'loading' }>, loaded, total };
			});
			if (cancelled) return;

			view = { ...view as Extract<View, { phase: 'loading' }>, step: 3, stepLabel: 'Calculating song coverage…', loaded: undefined, total: undefined };
			const results = findCoveringSongs(rankedMaps, slots);
			if (cancelled) return;

			view = {
				phase: 'results',
				platform: api.label,
				playerCount: slots.length,
				results,
				slots,
				ranges: derivedRanges,
			};
		} catch (e: unknown) {
			if (!cancelled) {
				const msg = e instanceof Error ? e.message : 'Unknown error';
				view = { phase: 'error', message: `Could not fetch data. Check your player IDs and try again. (${msg})` };
			}
		}
	}

	const INITIAL_SHOW = 10;
	let expanded = $state(false);
</script>

{#if view.phase === 'input'}
	<PageHeader
		title="Play with Friends"
		subtitle="Add everyone's profile - we'll find songs that work for all."
	/>

	<section>
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label>Platform</label>
		<PlatformPicker bind:value={platform} />
	</section>

	<section>
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label>Players</label>
		<div class="players-box">
			{#each players as player, i}
				<div class="player-row">
					<input
						type="text"
						class="label-input"
						placeholder={i === 0 ? 'You' : `Friend ${i}`}
						bind:value={player.label}
					/>
					<div class="id-wrap" class:has-error={player.error}>
						<input
							type="text"
							class="id-input"
							placeholder="76561198… or profile URL"
							bind:value={player.id}
						/>
						{#if player.error}
							<span class="inline-error">✕ {player.error}</span>
						{:else if player.warning}
							<span class="inline-warning">⚠ {player.warning}</span>
						{/if}
					</div>
					{#if i > 0}
						<button type="button" class="remove" onclick={() => removePlayer(i)}>✕</button>
					{:else}
						<span class="remove-spacer"></span>
					{/if}
				</div>
			{/each}
			<button type="button" class="add-player" onclick={addPlayer}>+ Add player</button>
		</div>
	</section>

	<CtaButton disabled={!canSearch} onclick={search}>
		Find Matching Songs →
	</CtaButton>

{:else if view.phase === 'loading'}
	<LoadingCard
		title="{platform === Platform.ScoreSaber ? 'ScoreSaber' : 'BeatLeader'} · {players.length} players"
		label={view.stepLabel}
		step={view.step}
		totalSteps={3}
		loaded={view.loaded}
		total={view.total}
		onCancel={view.cancel}
	>
		{#if view.step === 1}
			<div class="player-progress">
				{#each view.playerProgress as p}
					<div class="pp-row">
						{#if p.status === 'done'}
							<span class="icon done">✓</span>
						{:else if p.status === 'fetching'}
							<span class="icon fetching">·</span>
						{:else}
							<span class="icon waiting">○</span>
						{/if}
						<span class="pp-label">{p.label}</span>
						{#if p.status === 'done' && p.range}
							<span class="pp-range">★{p.range.min.toFixed(1)}–{p.range.max.toFixed(1)} detected</span>
						{:else if p.status === 'fetching'}
							<span class="pp-fetching">fetching…</span>
						{:else}
							<span class="pp-waiting">waiting</span>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</LoadingCard>

{:else if view.phase === 'results'}
	<ResultsBar
		info="{view.platform} · {view.playerCount} players"
		onNewSearch={() => (view = { phase: 'input' })}
	/>

	{#if view.results.length === 0}
		<EmptyState>
			<p>No songs found that cover all {view.playerCount} players on {view.platform}.</p>
			<p>Your skill ranges may be too far apart for any song to bridge them. Try adding players closer in level.</p>
		</EmptyState>
	{:else}
		<p class="summary">{view.results.length} songs cover all {view.playerCount} players</p>
		<div class="cards">
			{#each (expanded ? view.results : view.results.slice(0, INITIAL_SHOW)) as result}
				<SongCoverageCard {result} slots={view.slots} ranges={view.ranges} />
			{/each}
		</div>
		{#if !expanded && view.results.length > INITIAL_SHOW}
			<button type="button" class="show-more" onclick={() => (expanded = true)}>
				Show more - {view.results.length - INITIAL_SHOW} more songs
			</button>
		{/if}
		<CtaButton onclick={() => {
			const s = view as Extract<View, { phase: 'results' }>;
			downloadBplist(coverageToBplist(s.results, 'With Friends'));
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

	.players-box {
		background: var(--color-surface);
		border-radius: var(--radius-md);
		padding: var(--spacing-md);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.player-row {
		display: flex;
		gap: var(--spacing-sm);
		align-items: flex-start;
	}

	.label-input {
		width: 110px;
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

	.id-wrap { flex: 1; position: relative; }

	.id-input {
		width: 100%;
		padding: 8px 10px;
		border-radius: var(--radius-sm);
		border: 1.5px solid rgba(255,255,255,0.08);
		background: var(--color-surface-2);
		color: var(--color-text);
		font-size: 13px;
		outline: none;
	}

	.id-input:focus { border-color: var(--color-accent); }
	.id-wrap.has-error .id-input { border-color: var(--color-error); }

	.inline-error, .inline-warning { font-size: 11px; margin-top: 2px; display: block; }
	.inline-error { color: var(--color-error); }
	.inline-warning { color: var(--color-warning); }

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

	.add-player { color: var(--color-accent); font-size: 13px; padding: 4px 0; text-align: left; }

	.player-progress { display: flex; flex-direction: column; gap: 4px; }
	.pp-row { display: flex; align-items: center; gap: 8px; font-size: 13px; }

	.icon { width: 16px; text-align: center; }
	.icon.done { color: var(--color-success); }
	.icon.fetching { color: var(--color-accent); }
	.icon.waiting { color: var(--color-text-muted); }

	.pp-label { min-width: 120px; }
	.pp-range { color: var(--color-success); font-size: 12px; }
	.pp-fetching { color: var(--color-text-muted); font-size: 12px; font-style: italic; }
	.pp-waiting { color: var(--color-text-muted); font-size: 12px; }

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
