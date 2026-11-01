import { visit } from 'unist-util-visit';

// rehype plugin: turn a rendered write-up into a Logseq-style collapsible outline.
//  1. each `## heading` and the content under it becomes a foldable level-1 node.
//  2. any list item that contains a nested list becomes a foldable node too.
//  3. folds that contain an evidence figure start open.
// Leaf list items stay as <li>. The arrow, bullet and halo are drawn in CSS.

const bullet = () => ({ type: 'element', tagName: 'span', properties: { className: ['obul'] }, children: [] });

function makeSummary(children) {
  // Label is wrapped in one span so inline links/code inside a heading stay
  // inline, instead of each becoming a separate flex item of the summary.
  return {
    type: 'element',
    tagName: 'summary',
    properties: { className: ['osum'] },
    children: [
      bullet(),
      { type: 'element', tagName: 'span', properties: { className: ['olabel'] }, children },
    ],
  };
}

function isBlank(node) {
  return node.type === 'text' && !node.value.trim();
}

export function rehypeOutliner() {
  return (tree) => {
    // 1. group top-level h2 sections into <details class="onode l1">
    const grouped = [];
    let current = null;
    for (const node of tree.children) {
      if (node.type === 'element' && node.tagName === 'h2') {
        current = {
          type: 'element',
          tagName: 'details',
          properties: { className: ['onode', 'l1'] },
          children: [
            makeSummary(node.children),
            { type: 'element', tagName: 'div', properties: { className: ['obody'] }, children: [] },
          ],
        };
        grouped.push(current);
      } else if (current && !isBlank(node)) {
        current.children[1].children.push(node);
      } else if (!current && !isBlank(node)) {
        grouped.push(node);
      }
    }
    tree.children = grouped;

    // 2. fold any <li> that holds a nested list
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'li') return;
      const listIdx = node.children.findIndex(
        (c) => c.type === 'element' && (c.tagName === 'ul' || c.tagName === 'ol'),
      );
      if (listIdx === -1) return;
      const lead = node.children.slice(0, listIdx).filter((c) => !isBlank(c));
      const nested = node.children.slice(listIdx);
      node.properties = { ...(node.properties || {}), className: ['onode-li'] };
      node.children = [
        {
          type: 'element',
          tagName: 'details',
          properties: { className: ['onode'] },
          children: [
            makeSummary(lead),
            { type: 'element', tagName: 'div', properties: { className: ['obody'] }, children: nested },
          ],
        },
      ];
    });

    // 3. open any section that holds an evidence figure (recording or screenshot),
    //    including the parent folds around it, so evidence is visible on arrival
    const hasEvidence = (node) => {
      let found = false;
      visit(node, 'element', (n) => {
        const cls = n.properties?.className;
        if (n.tagName === 'figure' && (Array.isArray(cls) ? cls : [cls]).includes('evidence')) found = true;
      });
      return found;
    };
    visit(tree, 'element', (node) => {
      if (node.tagName === 'details' && hasEvidence(node)) node.properties = { ...(node.properties || {}), open: true };
    });
  };
}
