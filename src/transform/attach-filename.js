import traverse from '../util/traverse'

export default function attachFilename(tree) {
	return tree::traverse(node => {
		const {nodeType, position: [path]} = node
		if (nodeType !== 'document') throw new Error()
		node.childNodes = node.childNodes::traverse(({nodeType, position}) => {
			if (nodeType !== 'skip' && position.length === 2) position.unshift(path)
		}, undefined, true)
		return false
	})
}
