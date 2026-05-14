<script lang="ts">
	let {
		value = $bindable(),
		options = [
			{ value: 'default', label: 'Default (discovery order)' },
			{ value: 'name', label: 'Song name' },
			{ value: 'stars', label: 'Difficulty (highest first)' },
			{ value: 'pp', label: 'PP gain (highest first)' },
		],
	}: {
		value: string;
		options?: Array<{ value: string; label: string }>;
	} = $props();
</script>

<div class="sort-control">
	<label for="sort-select">Sort by:</label>
	<select id="sort-select" bind:value>
		{#each options as option (option.value)}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
</div>

<style>
	.sort-control {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
	}

	label {
		color: var(--color-text-muted);
	}

	select {
		padding: 6px 8px;
		border-radius: var(--radius-sm);
		border: 1.5px solid rgba(255, 255, 255, 0.1);
		background: var(--color-surface);
		color: var(--color-text);
		font-size: 13px;
		outline: none;
	}

	select:focus {
		border-color: var(--color-accent);
	}
</style>
