import {resolve as resolvePath} from 'url'
import {existsSync} from 'fs'
export function resolve(name, referrer) {
	const path = resolvePath(referrer, name)
	if (!existsSync(path + '.jedi')) return path + '.jedi'
	return path
}

export const tuple2record = (t) => {
	if (skip(t)) return {nodeType: 'skip', data: t}
	const [nodeType, position, ...data] = t
	if (nodeType === 'element') {
		const [[tagName, classList, id], binding, childNodes] = data
		return ({nodeType, position, nodeName: tagName, tagName, classList, id, binding, childNodes})
	}
	if (hasChildNodes(nodeType)) {
		const [nodeName, nodeValue, childNodes] = data
		return ({nodeType, position, nodeName, nodeValue, childNodes})
	}
	return {nodeType, position, data}
}

export const record2tuple = ({nodeType, position, ...data}) => {
	if (nodeType === 'skip') return data.data
	if (nodeType === 'element') {
		const {tagName, classList, id, binding, childNodes} = data
		return [nodeType, position, [tagName, classList, id], binding, childNodes]
	}
	if (hasChildNodes(nodeType)) {
		const {nodeName, nodeValue, childNodes} = data
		return [nodeType, position, nodeName, nodeValue, childNodes]
	}
	return ([nodeType, position, ...data.data])
}

export function match(pattern) {
	if (typeof pattern === 'function' && pattern.prototype) return this instanceof pattern
	if (pattern && typeof pattern.test === 'function') return pattern.test(this)
	switch (typeof this) {
		case 'undefined':
		case 'boolean':
		case 'number':
		case 'string':
		case 'symbol':
			return this === pattern
		case 'object':
			if (this === null) return pattern === null
			if (Array.isArray(pattern)) return pattern.every((p, i) => this[i]::match(p))
			if (typeof pattern === 'object') return Object.keys(pattern).every(key => this[key]::match(pattern[key]))
			return false
		default: throw new Error('should not be function')
	}
}

export function query(f, order) {
	let match1
	this::traverse(node => {
		if (match1) return false
		if (f(node)) {
			match1 = node
			return false
		}
	}, order)
	return record2tuple(match1)
}

export function queryAll(f, order) {
	const matches = []
	this::traverse(node => {
		if (f(node)) matches.push(node)
	}, order)
	return matches
}

export function traverse(f, order = 'pre', traverseAll) {
	if (skip(this)) return this

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

function isNode(nodeTuple) {
	return /^(?:document|element|attribute|text|comment|scriptsource|suppress|inject|binding|instruction|macro|fragment|Section|Offside|MixedWhitespace|Error)$/.test(nodeTuple[0])
}

function skip(nodeTuple) {
	const white = /^\s*$/
	if (typeof nodeTuple === 'string') return white.test(nodeTuple)
	if (typeof nodeTuple === 'undefined') return true
	//if (!Array.isArray(nodeTuple)) throw new Error(nodeTuple)
	return white.test(nodeTuple[0]) || nodeTuple[0] === 'closeStartTag'
}

function hasChildNodes(nodeType) {
	switch (nodeType) {
		case 'document':
		case 'fragment':
		case 'element':
		case 'binding':
		case 'instruction':
		case 'macro':
			return true
		default:
			return false
	}
}
