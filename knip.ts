import type { KnipConfig } from 'knip';

export default {
	ignoreExportsUsedInFile: {
		interface: true,
		type: true,
	},
	entry: [
		'vite.config.{js,mjs,ts,cjs,mts,cts}',
		'scripts/**/*.ts',
		'src/routes/**/+{page,server,page.server,error,layout,layout.server}{,@*}.{js,ts,svelte}',
	],
	project: ['**/*.{js,ts,svelte}'],
	tags: ['-lintignore'],
	ignore: [
		'src/lib/components/ErrorBanner.svelte',
		'src/lib/components/LoadingCard.svelte',
		'src/lib/components/ProgressBar.svelte',
		'src/lib/index.ts',
	],
} satisfies KnipConfig;
