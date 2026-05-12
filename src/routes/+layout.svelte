<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';

	let { children } = $props();

	const navLinks = [
		{ href: '/', label: 'PP Improve' },
		{ href: '/friends', label: 'With Friends' },
		{ href: '/ranges', label: 'Ranges' },
		{ href: '/artist', label: 'Artist/Album' },
	];
</script>

<header>
	<div class="content-wrap inner">
		<a class="logo" href="/">PlaylistSaber</a>
		<nav>
			{#each navLinks as link}
				<a
					href={link.href}
					class:active={$page.url.pathname === link.href}
				>{link.label}</a>
			{/each}
		</nav>
	</div>
</header>

<main>
	<div class="content-wrap">
		{@render children()}
	</div>
</main>

<style>
	header {
		background: var(--color-surface);
		border-bottom: 1px solid rgba(255,255,255,0.06);
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.inner {
		display: flex;
		align-items: center;
		gap: var(--spacing-lg);
		height: 52px;
	}

	.logo {
		color: var(--color-accent);
		font-weight: 600;
		font-size: 15px;
		white-space: nowrap;
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

	nav a:hover { color: var(--color-text); }

	nav a.active {
		color: var(--color-text);
		background: var(--color-accent-dim);
		border-bottom: 2px solid var(--color-accent);
	}

	main {
		padding: var(--spacing-lg) 0 48px;
	}
</style>
