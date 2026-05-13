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
} satisfies KnipConfig;
