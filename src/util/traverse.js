import {tuple2record, record2tuple} from './adapter'
import {skip, isNode} from './node'

export default function traverse(f, order = 'pre', traverseAll) {
	if (skip(this)) {
		if (!traverseAll) return this
		const node = tuple2record(this)
		f(node)
		return record2tuple(node)
	}
	if (isNode(this)) {
		const node = tuple2record(this)
		if (order === 'post') traverseChildNodes(node)
		const recursive = f(node)
		if (recursive || recursive === undefined && order === 'pre') traverseChildNodes(node)
		return record2tuple(node)
	}

	if (Array.isArray(this)) {
		return this.map(child => child::traverse(f, order, traverseAll))
	}

	throw new Error(this)

	function traverseChildNodes(node) {
		if (Array.isArray(node.childNodes)) {
			node.childNodes = node.childNodes.map(child => child::traverse(f, order, traverseAll))
		}
		if (traverseAll) {
			if (Array.isArray(node.binding) && isNode(node.binding)) {
				node.binding = node.binding::traverse(f, order, traverseAll)
			}
			// if (Array.isArray(node.data) && Array.isArray(node.data[node.data.length - 1])) {
			// 	node.data[node.data.length - 1] = node.data[node.data.length - 1].map(child => child::traverse(f, order, traverseAll))
			// }
		}
	}
}
