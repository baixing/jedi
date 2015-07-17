import {dir} from './util'

import {tuple2record, record2tuple, traverse, resolve, query} from './util2'
function transformImport(document) {
	return document::traverse(node => {
		const {nodeType, position: [path]} = node
		if (nodeType !== 'document') throw new Error()
		node.childNodes = node.childNodes::traverse(node => {
			attachPath(node)
			// resolveImport(node)
		}, undefined, true)
		return false

		function attachPath({position}) {
			position.unshift(path)
		}
		// function resolveImport(node) {
		// 	const {nodeType, nodeName, nodeValue} = node
		// 	if (nodeType === 'instruction' && nodeName === 'import') {
		// 		node.nodeValue = resolve(nodeValue, path)
		// 	}
		// }
	})::traverse(node => {
		const {nodeType, nodeName, nodeValue, childNodes} = node
		if (nodeType === 'instruction' && nodeName === 'import') {
			let tree = loadTree(nodeValue)
			tree = override(tree, childNodes)
			Object.assign(node, tree)
		}
	}, 'post')
}

import {existsSync} from 'fs'
import {parseFile} from '.'
function loadTree(name) {
	let path, frag
	const i = name.lastIndexOf('#')
	if (i >= 0) {
		path = name.slice(0, i)
		frag = name.slice(i + 1)
	} else path = name

	if (existsSync(path + '.jedi')) path += '.jedi'
	let tree = parseFile(path)
	tree = transformImport(tree)
	if (!frag) return tree
	tree = tree::query(({nodeType, nodeName, nodeValue, id}) =>
		nodeType === 'fragment' && nodeName === frag && nodeValue === undefined
		|| nodeType === 'element' && id === frag)
	return tree
}

import transformer from './transformer'
export default function transform(tree, debug = []) {
	if (debug[0]) dir(tree)

	console.time('tr1')
	tree = transformImport(tree)
	console.timeEnd('tr1')
	if (debug[1]) dir(tree)

	console.time('tr2')
	tree = transformer.DocumentStripper.match(tree, 'document')
	//tree = transformer.TemplateMatcher.match(tree, 'document')
	//tree = transformer.ScriptIIFEWrapper.match(tree, 'document')
	console.timeEnd('tr2')
	if (debug[2]) dir(tree)

	console.time('tr3')
	tree = transformer.Sorter.match(tree, 'document')
	console.timeEnd('tr3')
	if (debug[3]) dir(tree)

	return tree
}

function override(template, blocks) {

	blocks = blocks.map(tuple2record)
	let contentFragment

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
			if (frags.replace) {
				node.childNodes.splice(0, Infinity, ...frags.replace.childNodes)
			} else if (frag === 'content') {
				contentFragment = node
			}
			if (frags.befores.length > 0) {
				const i = node.childNodes.findIndex(node => {
					const {nodeType, nodeName, nodeValue} = tuple2record(node)
					return nodeType !== 'fragment' || nodeName !== frag || nodeValue !== 'before'
				})
				node.childNodes.splice(0, i, ...frags.befores.map(record2tuple))
			}
			if (frags.afters.length > 0) {
				let last
				while (true) {
					last = node.childNodes.pop()
					const {nodeType, nodeName, nodeValue} = tuple2record(last)
					if (!(nodeType === 'fragment' && nodeName === frag && nodeValue === 'after')) break
				}
				node.childNodes.push(last, ...frags.afters.map(record2tuple))
			}
			return false
		}

	})
	if (contentFragment) {
		contentFragment.childNodes.splice(0, Infinity, ...blocks.map(record2tuple))
		console.log('replace default content to',
			blocks,
			contentFragment.childNodes)
	}

	return tpl
}


function matchesFragment(fragName) {
	return (result, node) => {
		const {befores, afters, rest} = result
		if (node.nodeType !== 'fragment' || node.nodeName !== fragName) rest.push(node)
		else switch (node.nodeValue) {
			case 'before': befores.push(node); break
			case 'after': afters.push(node); break
			default: result.replace = node //TODO: throw error if multiple replacement
		}
		return result
	}
}
