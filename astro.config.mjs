// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	site: 'https://tech0ver.github.io',
	base: '/sysdis',
	integrations: [
		starlight({
			title: 'System Design',
			favicon: '/favicon.png',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/tech0ver/sysdis' }],
			sidebar: ['foo-bar'],
		}),
	],
});
