// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { satteri } from '@astrojs/markdown-satteri';
import { glossary } from './src/data/glossary.mjs';
import { glossaryPlugin } from './src/plugins/glossary.mjs';

const base = '/sysdis';

export default defineConfig({
	site: 'https://tech0ver.github.io',
	base,
	markdown: {
		processor: satteri({ hastPlugins: [glossaryPlugin({ entries: glossary, base })] }),
	},
	integrations: [
		starlight({
			title: 'System Design',
			favicon: '/favicon.png',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/tech0ver/sysdis' }],
			routeMiddleware: './src/routeData.ts',
			customCss: ['./src/styles/theme.css', './src/styles/glossary.css'],
			components: {
				ThemeSelect: './src/components/ThemeToggle.astro',
			},
			sidebar: [
				{
					label: 'Fundamentals',
					items: ['fundamentals/networking'],
				},
				'glossary',
			],
		}),
	],
});
