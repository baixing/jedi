import {isErrorNode}	from '../util/node'
import traverse	from '../util/traverse'

export default function reportError(tree) {
	return tree::traverse(node => {
		checkError(node)
	})
}

function checkError({nodeType, position, data}) {
	if (isErrorNode(nodeType)) {
		const err = new Error(nodeType)
		err.position	= position
		err.data	= data
		throw err
	}
}
