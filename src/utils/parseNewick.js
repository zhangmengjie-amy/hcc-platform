/**
 * Author: 张梦洁
 * UI: 张梦洁
 * Created Time: 2025/04/10
 * Last Modified: 2026/03/03
 */

export default function parseNewick(newick) {
  const tokens = newick.split(/\s*(;|\(|\)|,|:)\s*/);
  const ancestors = [];
  const tree = {};
  let current = tree;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    switch (t) {
    case "(":
      const child = {};
      current.branchset = current.branchset || [];
      current.branchset.push(child);
      ancestors.push(current);
      current = child;
      break;
    case ",":
      const sibling = {};
      ancestors[ancestors.length - 1].branchset.push(sibling);
      current = sibling;
      break;
    case ")":
      current = ancestors.pop();
      break;
    case ":":
      const len = parseFloat(tokens[++i]);
      current.length = isNaN(len) ? 0 : len;
      break;
    case ";":
      break;
    default:
      if (t && t !== ";") current.name = t;
    }
  }
  return tree;
}