import traverse from '../util/traverse'

export default function escapeScript(tree) {
	return tree::traverse(node => {
		if (node.nodeType === 'element' && node.tagName.toLowerCase() === 'script') {
			node.childNodes = node.childNodes::traverse(child => {
				if (child.nodeType === 'comment') child.nodeType = 'scriptsource'
				return false
			})
			return false
		}
	})
}
