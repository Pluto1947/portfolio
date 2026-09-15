import { visit } from 'unist-util-visit';

// remark plugin: turn [[slug]] or [[slug|label]] in markdown into internal links.
// `resolve` is a { slug: "/domain/slug" } map built at config time from the
// content folder structure. An unknown slug renders as a visible unresolved link.
const RE = /\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g;

export function remarkWikiLinks(options = {}) {
  const resolve = options.resolve ?? {};
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index == null || !node.value.includes('[[')) return;
      const value = node.value;
      const out = [];
      let last = 0;
      let m;
      RE.lastIndex = 0;
      while ((m = RE.exec(value))) {
        if (m.index > last) out.push({ type: 'text', value: value.slice(last, m.index) });
        const slug = m[1].trim();
        const label = (m[2] || m[1]).trim();
        const url = resolve[slug];
        out.push({
          type: 'link',
          url: url ?? '#',
          data: {
            hProperties: url
              ? { className: ['wl'], 'data-wikilink': slug }
              : { className: ['wl', 'wl-missing'], 'data-wikilink': slug, title: `Unresolved link: ${slug}` },
          },
          children: [{ type: 'text', value: label }],
        });
        last = m.index + m[0].length;
      }
      if (!out.length) return;
      if (last < value.length) out.push({ type: 'text', value: value.slice(last) });
      parent.children.splice(index, 1, ...out);
      return index + out.length;
    });
  };
}
