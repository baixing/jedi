import {tuple2record, record2tuple} from './adapter'
import {skip, isNode} from './node'

export default function traverse(visitor, traverseAll = false) {
	if (typeof visitor === 'function') visitor = {enter: visitor}

	if (skip(this)) {
		if (!traverseAll) return this
		const node = tuple2record(this)
		if (visitor.enter) visitor.enter(node)
		if (visitor.leave) visitor.leave(node)
		return record2tuple(node)
	}
	if (isNode(this)) {
		const node = tuple2record(this)
		const recursive = do {
			if (visitor.enter) visitor.enter(node)
		}
		if (recursive || recursive === undefined) traverseChildNodes(node)
		if (visitor.leave) visitor.leave(node)
		return record2tuple(node)
	}

	if (Array.isArray(this)) {
		return this.map(child => child::traverse(visitor, traverseAll))
	}

	throw new Error(this)

	function traverseChildNodes(node) {
		if (Array.isArray(node.childNodes)) {
			const scope = node.childNodes.scope
			node.childNodes = node.childNodes.map(child => child::traverse(visitor, traverseAll))
			node.childNodes.scope = scope
		}
		if (traverseAll) {
			if (Array.isArray(node.binding) && isNode(node.binding)) {
				node.binding = node.binding::traverse(visitor, traverseAll)
			}
		}
	}
}
