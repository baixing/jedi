import {resolve as resolvePath} from 'url'
export function resolve(name, referrer) {
	return resolvePath(referrer, name)
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
	return [nodeType, position, ...data.data]
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
	return match1 ? record2tuple(match1) : match1
}

export function queryAll(f, order) {
	const matches = []
	this::traverse(node => {
		if (f(node)) matches.push(node)
	}, order)
	return matches
}

export function traverse(f, order = 'pre', traverseAll) {
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

function isNode(nodeTuple) {
	return /^(?:document|element|attribute|text|comment|scriptsource|suppress|inject|binding|instruction|macro|fragment|Section|Offside|MixedWhitespace|Error)$/.test(nodeTuple[0])
}

function skip(nodeTuple) {
	const white = /^\s*(?:\/\/.*)?$/
	if (Array.isArray(nodeTuple)) {
		if (nodeTuple.length === 1 && nodeTuple[0] === 'closeStartTag') return true
		if (nodeTuple.length > 0 && nodeTuple.every(x => typeof x === 'string' && x.length === 1)
			&& white.test(nodeTuple.join(''))) return true
	} else {
		if (typeof nodeTuple === 'string' && white.test(nodeTuple)) return true
		throw new Error(nodeTuple)
	}
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

import {readFileSync} from 'fs'
export function errorInfo(e, source) {

	const info = []

	if (e.position) {

		const [filename, line, col] = e.position
		const errorType = e.message === 'Section' ? 'SyntaxError' : e.message
		info.push([])
		info.push(['Syntax error:',
			filename === '*'
			? `I guest it may be ${source} , but not sure...`
			: filename
		])
		info.push([])

		const lines = readFileSync(filename === '*' ? source : filename).toString().split(/\r?\n/)
		lines[lines.length - 1] += '\u{1F51A}'

		const startLine = Math.max(e.position[1] - 8, 0),
			endLine = Math.min(e.position[1] + 7, lines.length)

		const showLines = lines.slice(startLine, endLine).map(
			(line, i) => (startLine + i + 1) + ' | ' + line.replace(/\t/g, '    '))

		var spaces = ' '.repeat(String(line).length + 2 + col)
		showLines.splice(line - startLine, 0,
			spaces + '^',
			spaces + '|__ Ooops, ' + errorType + ' at line ' + line + ', column ' + col,
			spaces)

		showLines.forEach(l => info.push([l]))

	} else {
		info.push([String(e.stack || e.message || e)])
	}
	return info
}

// export function match(pattern) {
// 	if (typeof pattern === 'function' && pattern.prototype) return this instanceof pattern
// 	if (pattern && typeof pattern.test === 'function') return pattern.test(this)
// 	switch (typeof this) {
// 		case 'undefined':
// 		case 'boolean':
// 		case 'number':
// 		case 'string':
// 		case 'symbol':
// 			return this === pattern
// 		case 'object':
// 			if (this === null) return pattern === null
// 			if (Array.isArray(pattern)) return pattern.every((p, i) => this[i]::match(p))
// 			if (typeof pattern === 'object') return Object.keys(pattern).every(key => this[key]::match(pattern[key]))
// 			return false
// 		default: throw new Error('should not be function')
// 	}
// }
