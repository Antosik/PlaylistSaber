<script lang="ts">
	let {
		label,
		id,
		min = 0,
		max = 100,
		step = 1,
		value = $bindable(50),
	}: {
		label: string;
		id: string;
		min?: number;
		max?: number;
		step?: number;
		value?: number;
	} = $props();
</script>

<div class="range-field">
	<label for={id} class="range-label">
		{label}
	</label>
	<input {id} type="range" {min} {max} {step} bind:value class="range-input" />
</div>

<style>
	.range-field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.range-label {
		display: block;
		font-size: 12px;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.range-input {
		padding: 0;
		margin: 0;
		width: 100%;
		height: 24px;
		cursor: pointer;
		-webkit-appearance: none;
		appearance: none;
		background: none;
		border: none;
		display: block;
	}

	.range-input::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--color-accent);
		cursor: pointer;
		border: 2px solid var(--color-surface);
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
		transition: all 0.15s ease;
		margin-top: -5.5px;
	}

	.range-input::-webkit-slider-thumb:hover {
		transform: scale(1.1);
		box-shadow: 0 4px 8px rgba(124, 106, 247, 0.3);
	}

	.range-input::-moz-range-thumb {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--color-accent);
		cursor: pointer;
		border: 2px solid var(--color-surface);
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
		transition: all 0.15s ease;
		margin-top: -5.5px;
	}

	.range-input::-moz-range-thumb:hover {
		transform: scale(1.1);
		box-shadow: 0 4px 8px rgba(124, 106, 247, 0.3);
	}

	.range-input::-webkit-slider-runnable-track {
		background:
			linear-gradient(to right, var(--color-accent), var(--color-accent)) no-repeat,
			rgba(255, 255, 255, 0.1);
		background-size: calc(var(--value, 0) * 100%) 100%;
		height: 5px;
		border-radius: 2px;
		border: none;
	}

	.range-input::-moz-range-track {
		background: rgba(255, 255, 255, 0.1);
		height: 5px;
		border-radius: 2px;
		border: none;
	}

	.range-input::-moz-range-progress {
		background: var(--color-accent);
		height: 5px;
		border-radius: 2px;
	}
</style>
