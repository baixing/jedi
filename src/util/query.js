import {record2tuple} from './adapter'
import traverse from './traverse'

export function query(f) {
	let match1
	this::traverse(node => {
		if (match1) return false
		if (f(node)) {
			match1 = node
			return false
		}
	})
	return match1 ? record2tuple(match1) : match1
}

export function queryAll(f) {
	const matches = []
	this::traverse(node => {
		if (f(node)) matches.push(node)
	})
	return matches
}
