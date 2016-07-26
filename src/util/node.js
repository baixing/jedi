export const isNode = nodeTuple =>
	nodeTuple.length > 0
	&& /^(?:document|element|attribute|text|comment|scriptsource|suppress|inject|binding|instruction|macro|fragment|Section|Offside|MixedWhitespace|Error)$/.test(nodeTuple[0])

export const skip = nodeTuple => {
	const white = /^\s*(?:\/\/.*)?$/
	if (Array.isArray(nodeTuple)) {
		if (nodeTuple.length === 1 && nodeTuple[0] === 'closeStartTag') return true
		if (nodeTuple.length > 0
			&& nodeTuple.every(x => typeof x === 'string' && x.length === 1)
			&& white.test(nodeTuple.join(''))) return true
	} else {
		if (typeof nodeTuple === 'string' && white.test(nodeTuple)) return true
		throw new Error(nodeTuple)
	}
}

export function hasChildNodes(nodeType) {
	switch (nodeType) {
		case 'document':
		case 'fragment':
		case 'element':
		case 'binding':
		case 'instruction':
		case 'inject':
		case 'macro':
			return true
		default:
			return false
	}
}

export function isErrorNode(nodeType) {
	switch (nodeType) {
		case 'MixedWhitespace':
		case 'Offside':
		case 'Section':
		case 'Error':
			return true
		default:
			return false
	}
}
