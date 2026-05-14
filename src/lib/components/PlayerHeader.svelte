<script lang="ts">
	import { resolve } from '$app/paths';

	import type { SkillRange } from '$lib/types';

	interface PlayerInfo {
		id: string;
		name: string;
		avatar?: string;
		skillRange?: SkillRange;
	}

	let {
		players,
		platform,
	}: {
		players: PlayerInfo[];
		platform: string;
	} = $props();

	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((part) => part[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
</script>

<div class="header">
	<div class="info-bar">
		<span class="platform">{platform}</span>
		{#if players.some((p) => p.skillRange)}
			{@const ranges = players.filter((p) => p.skillRange).map((p) => p.skillRange!)}
			{@const minStars = Math.min(...ranges.map((r) => r.min))}
			{@const maxStars = Math.max(...ranges.map((r) => r.max))}
			<span class="range">★{minStars.toFixed(1)}–{maxStars.toFixed(1)}</span>
		{/if}
	</div>
	<div class="players-grid">
		{#each players as player (player.id)}
			<a href={resolve(`/u/${player.id}`)} class="player-card">
				<div class="avatar">
					{#if player.avatar}
						<img src={player.avatar} alt={player.name} />
					{:else}
						<div class="initials">{getInitials(player.name)}</div>
					{/if}
				</div>
				<div class="player-info">
					<span class="name">{player.name}</span>
					{#if player.skillRange}
						<span class="range-badge">
							★{player.skillRange.min.toFixed(1)}–{player.skillRange.max.toFixed(1)}
						</span>
					{/if}
				</div>
			</a>
		{/each}
	</div>
</div>

<style>
	.header {
		margin-bottom: var(--spacing-md);
	}

	.info-bar {
		display: flex;
		gap: 12px;
		align-items: center;
		margin-bottom: 12px;
		font-size: 13px;
	}

	.platform {
		color: var(--color-text-muted);
	}

	.range {
		color: var(--color-text);
		font-weight: 500;
	}

	.players-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
	}

	.player-card {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 12px;
		background: var(--color-surface);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: inherit;
		transition: background 0.2s;
	}

	.player-card:hover {
		background: var(--color-surface-2);
		text-decoration: underline;
	}

	.avatar {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: var(--color-surface-2);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		overflow: hidden;
	}

	.avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.initials {
		font-size: 12px;
		font-weight: 600;
		color: var(--color-accent);
	}

	.player-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.name {
		font-size: 13px;
		font-weight: 500;
	}

	.range-badge {
		font-size: 11px;
		color: var(--color-text-muted);
	}
</style>
