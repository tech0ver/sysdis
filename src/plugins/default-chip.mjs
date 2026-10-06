// Sätteri hast plugin: turns a paragraph that starts with "**Default: …**" into a
// recommendation line. The "Default:" prefix becomes a small chip, the rest stays bold.
//
//   **Default: reuse connections.** Keep …
//   → <p class="default-line"><span class="default-chip">Default</span> <strong>Reuse connections.</strong> Keep …</p>

const PREFIX = /^Default:\s*/;

export function defaultChipPlugin() {
	return {
		name: 'sysdis-default-chip',
		element: {
			filter: ['p'],
			visit(node, ctx) {
				const first = node.children?.[0];
				if (first?.type !== 'element' || first.tagName !== 'strong') return;
				const text = first.children?.[0];
				if (text?.type !== 'text' || !PREFIX.test(text.value)) return;

				const rest = text.value.replace(PREFIX, '');
				ctx.replaceNode(text, { type: 'text', value: rest.charAt(0).toUpperCase() + rest.slice(1) });
				ctx.prependChild(node, [
					{ type: 'raw', value: '<span class="default-chip">Default</span>' },
					{ type: 'text', value: ' ' },
				]);
				ctx.setProperty(node, 'className', ['default-line']);
			},
		},
	};
}
