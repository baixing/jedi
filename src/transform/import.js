import Debug from 'debug'
const debug = Debug('transform')
import {inspect} from 'util'

import traverse from '../util/traverse'
export default function doImport(document) {
	return document::traverse(node => {
		const {nodeType, position: [path]} = node
		if (nodeType !== 'document') throw new Error()
		node.childNodes = node.childNodes::traverse(({nodeType, position}) => {
			if (nodeType !== 'skip' && position.length === 2) position.unshift(path)
		}, undefined, true)
		return false
	})::traverse(node => {
		const {nodeType, position: [path], nodeName, nodeValue, childNodes} = node
		if (nodeType === 'instruction' && nodeName === 'import') {
			let tree = loadTree(resolve(nodeValue, path))
			tree = override(tree, childNodes)
			Object.assign(node, tree)
		}
	}, 'post')
}

import {resolve as resolvePath} from 'url'
const resolve = (name, referrer) => resolvePath(referrer, name)


import {existsSync} from 'fs'
import {parseFile} from '../parse'
import {query} from '../util/query'

const loadTree = name => {
	let path, frag
	const i = name.lastIndexOf('#')
	if (i >= 0) {
		path = name.slice(0, i)
		frag = name.slice(i + 1)
	} else path = name

	if (existsSync(path + '.jedi')) path += '.jedi'
	let tree = parseFile(path)
	tree = doImport(tree)
	if (!frag) {
		tree[0] = 'fragment'
		tree[2] = name + '#'
		return tree
	}
	tree = tree::query(({nodeType, nodeName, nodeValue, id}) =>
		nodeType === 'fragment' && nodeName === frag && nodeValue === undefined
		|| nodeType === 'element' && id === frag)
	if (!tree) throw new Error('Failed to load ' + name)
	tree[2] = name
	return tree
}

import {tuple2record, record2tuple} from '../util/adapter'
function override(template, blocks) {

	blocks = blocks.map(tuple2record)

	const tpl = tuple2record(template)
	tpl.childNodes::traverse(node => {
		let frag
		if (node.nodeType === 'fragment' && node.nodeValue === undefined) {
			frag = node.nodeName
		} else if (node.nodeType === 'element' && node.id) {
			frag = node.id
		} else if (node.nodeType === 'macro') {
			return false
		}
		if (frag) {
			let frags = {replace: undefined, befores: [], afters: [], rest: []}
			frags = blocks.reduce(matchesFragment(frag), frags)
			blocks = frags.rest
			//TODO: adopted nodes should not be traversed
			if (frags.replace) {
				node.childNodes.splice(0, Infinity, ...frags.replace.childNodes)
			}
			if (frags.befores.length > 0) {
				const i = node.childNodes.findIndex(child => {
					const {nodeType, nodeName, nodeValue} = tuple2record(child)
					return nodeType !== 'fragment' || nodeName !== frag || nodeValue !== 'before'
				})
				node.childNodes.splice(0, i, ...frags.befores.map(record2tuple))
			}
			if (frags.afters.length > 0) {
				while (node.childNodes.length > 0) {
					const last = node.childNodes[node.childNodes.length - 1]
					const {nodeType, nodeName, nodeValue} = tuple2record(last)
					if (!(nodeType === 'fragment' && nodeName === frag && nodeValue === 'after')) break
					else node.childNodes.pop()
				}
				node.childNodes.push(...frags.afters.map(record2tuple))
			}
		}
	})
	tpl.childNodes::traverse(node => {
		if (node.nodeType === 'fragment' && node.nodeValue === undefined && node.nodeName === 'content') {
			node.childNodes.splice(0, Infinity, ...blocks.map(record2tuple))
			debug('replace default content to', inspect(blocks, {depth: null}))
		}
		return false
	})

	return tpl
}

const matchesFragment = fragName => (result, node) => {
	const {befores, afters, rest} = result
	if (node.nodeType !== 'fragment' || node.nodeName !== fragName) rest.push(node)
	else {
		switch (node.nodeValue) {
			case 'before': befores.push(node); break
			case 'after': afters.push(node); break
			default: result.replace = node //TODO: throw error if multiple replacement
		}
	}
	return result
}
