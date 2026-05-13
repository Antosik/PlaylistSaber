<script lang="ts">
	import { resolve } from '$app/paths';
	import { navigating, page } from '$app/state';

	import '../app.css';

	let { children } = $props();

	const navLinks: ReadonlyArray<{
		href: '/' | '/friends' | '/ranges' | '/artist';
		label: string;
	}> = [
		{ href: '/', label: 'PP Improve' },
		{ href: '/friends', label: 'With Friends' },
		{ href: '/ranges', label: 'Ranges' },
		{ href: '/artist', label: 'Artist/Album' },
	];
</script>

<header>
	<div class="content-wrap inner">
		<div class="header-start">
			<a class="logo" href={resolve('/')}>PlaylistSaber</a>
			<nav>
				{#each navLinks as link (link.href)}
					<a href={resolve(link.href)} class:active={page.url.pathname === link.href}>
						{link.label}
					</a>
				{/each}
			</nav>
		</div>
		{#if navigating.type != null}
			<div class="nav-busy" role="status" aria-live="polite">
				<span class="sr-only">Loading</span>
				<span class="spinner" aria-hidden="true"></span>
			</div>
		{/if}
	</div>
</header>

<main aria-busy={navigating.type != null}>
	<div class="content-wrap">
		{@render children()}
	</div>
</main>

<style>
	header {
		background: var(--color-surface);
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-md);
		min-height: 52px;
	}

	.header-start {
		display: flex;
		align-items: center;
		gap: var(--spacing-lg);
		min-width: 0;
		flex: 1;
	}

	.logo {
		color: var(--color-accent);
		font-weight: 600;
		font-size: 15px;
		white-space: nowrap;
		flex-shrink: 0;
	}

	nav {
		display: flex;
		gap: 4px;
		overflow-x: auto;
		scrollbar-width: none;
	}

	nav a {
		padding: 6px 12px;
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		font-size: 13px;
		white-space: nowrap;
		transition: color 0.15s;
	}

	nav a:hover {
		color: var(--color-text);
	}

	nav a.active {
		color: var(--color-text);
		background: var(--color-accent-dim);
		border-bottom: 2px solid var(--color-accent);
	}

	.nav-busy {
		position: relative;
		flex-shrink: 0;
		display: flex;
		align-items: center;
	}

	.spinner {
		width: 18px;
		height: 18px;
		border: 2px solid var(--color-surface-2);
		border-top-color: var(--color-accent);
		border-radius: 50%;
		animation: nav-spin 0.65s linear infinite;
	}

	@keyframes nav-spin {
		to {
			transform: rotate(360deg);
		}
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}

	main {
		padding: var(--spacing-lg) 0 48px;
	}
</style>
