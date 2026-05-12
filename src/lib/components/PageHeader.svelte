<script lang="ts">
	let { title, subtitle }: { title: string; subtitle: string } = $props();
</script>

<h1>{title}</h1>
<p class="subtitle">{subtitle}</p>

<style>
	h1 { font-size: 24px; font-weight: 700; margin-bottom: 6px; }
	.subtitle { color: var(--color-text-muted); font-size: 13px; margin-bottom: var(--spacing-lg); }
</style>
