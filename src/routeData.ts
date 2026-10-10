// Starlight route middleware.
// The Glossary page renders its terms from data, so Starlight finds no headings for
// "On this page". Build that list from the glossary instead: one link per term.
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { glossary } from './data/glossary.mjs';

export const onRequest = defineRouteMiddleware((context) => {
	const route = context.locals.starlightRoute;
	if (route.id !== 'glossary') return;

	const terms = [...glossary]
		.sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }))
		.map((entry) => ({ depth: 2, slug: entry.id, text: entry.term, children: [] }));

	route.toc = {
		minHeadingLevel: 2,
		maxHeadingLevel: 2,
		items: [{ depth: 2, slug: '_top', text: 'Overview', children: [] }, ...terms],
	};
});
