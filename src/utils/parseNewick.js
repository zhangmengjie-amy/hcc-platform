export default function parseNewick(newick) {
    const tokens = newick.split(/\s*(;|\(|\)|,|:)\s*/)
    const ancestors = []
    let tree = {}
    let current = tree

    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i]
        switch (t) {
            case '(':
                const child = {}
                current.branchset = current.branchset || []
                current.branchset.push(child)
                ancestors.push(current)
                current = child
                break
            case ',':
                const sibling = {}
                ancestors[ancestors.length - 1].branchset.push(sibling)
                current = sibling
                break
            case ')':
                current = ancestors.pop()
                break
            case ':':
                const len = parseFloat(tokens[++i])
                current.length = isNaN(len) ? 0 : len
                break
            case ';':
                break
            default:
                if (t && t !== ';') current.name = t
        }
    }
    return tree
}