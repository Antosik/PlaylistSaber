// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module 'svelte/elements' {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars -- mirrors Svelte's HTMLAttributes generic
	interface HTMLAttributes<T extends EventTarget> {
		qa?: string;
	}
}

export {};
