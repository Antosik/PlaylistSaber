<script lang="ts">
	let {
		label = '',
		inputId,
		value = $bindable(''),
		error = '',
		variant = 'comfortable',
		dataTestId = '',
		ariaLabel = '',
		onClearError,
	}: {
		label?: string;
		inputId?: string;
		value?: string;
		error?: string;
		variant?: 'comfortable' | 'compact';
		dataTestId?: string;
		ariaLabel?: string;
		onClearError?: () => void;
	} = $props();
</script>

<div class="profile-url-field" class:compact={variant === 'compact'}>
	{#if label}
		<label class="field-label" for={inputId}>{label}</label>
	{/if}
	<div class="input-wrap" class:has-error={!!error}>
		<input
			id={label ? inputId : undefined}
			data-testid={dataTestId || undefined}
			type="text"
			placeholder="76561198… or paste your profile URL"
			autocomplete="off"
			class="profile-input"
			bind:value
			oninput={() => onClearError?.()}
			aria-label={!label ? ariaLabel || 'Profile URL or player ID' : undefined}
			aria-invalid={error ? true : undefined}
		/>
		{#if error}
			<span class="field-error">{error}</span>
		{/if}
	</div>
</div>

<style>
	.profile-url-field {
		width: 100%;
	}

	.field-label {
		display: block;
		font-size: 12px;
		color: var(--color-text-muted);
		margin-bottom: 6px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.input-wrap {
		position: relative;
		width: 100%;
	}

	.profile-input {
		width: 100%;
		outline: none;
		color: var(--color-text);
	}

	.profile-url-field:not(.compact) .profile-input {
		padding: 10px 14px;
		border-radius: var(--radius-md);
		border: 1.5px solid rgba(255, 255, 255, 0.1);
		background: var(--color-surface);
		font-size: 14px;
	}

	.profile-url-field:not(.compact) .profile-input:focus {
		border-color: var(--color-accent);
	}

	.profile-url-field:not(.compact) .profile-input::placeholder {
		color: var(--color-text-muted);
	}

	.profile-url-field.compact .profile-input {
		padding: 8px 10px;
		border-radius: var(--radius-sm);
		border: 1.5px solid rgba(255, 255, 255, 0.08);
		background: var(--color-surface-2);
		font-size: 13px;
	}

	.profile-url-field.compact .profile-input:focus {
		border-color: var(--color-accent);
	}

	.profile-url-field.compact .profile-input::placeholder {
		color: var(--color-text-muted);
	}

	.input-wrap.has-error .profile-input {
		border-color: var(--color-error, #e55);
	}

	.field-error {
		display: block;
		margin-top: 4px;
		font-size: 12px;
		color: var(--color-error, #e55);
	}

	.profile-url-field.compact .field-error {
		margin-top: 2px;
		font-size: 11px;
	}
</style>
