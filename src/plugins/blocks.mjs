// Sätteri mdast plugin: article blocks written as container directives.
//
//   :::do            → "What to do": the recommended action
//   :::tradeoff      → "Trade-off": what you win and what you pay
//   :::interview     → "In the interview": what to say
//   :::avoid         → "Avoid": a common mistake
//
// Each becomes <div class="block block-<name>">; the label comes from CSS (src/styles/article.css).

const BLOCKS = new Set(['do', 'tradeoff', 'interview', 'avoid']);

export function blocksPlugin() {
	return {
		name: 'sysdis-blocks',
		containerDirective(node, ctx) {
			if (!BLOCKS.has(node.name)) return;
			ctx.setProperty(node, 'data', {
				hName: 'div',
				hProperties: { className: ['block', `block-${node.name}`] },
			});
		},
	};
}
