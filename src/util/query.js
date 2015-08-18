import traverse from './traverse'

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
