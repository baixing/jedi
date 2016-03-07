import {skip, hasChildNodes} from './node'

export const tuple2record = (t) => {
	if (skip(t)) return {nodeType: 'skip', data: t}
	const [nodeType, position, ...data] = t
	const pos = [...position] // copy to avoid being cached
	if (nodeType === 'element') {
		const [[tagName, classList, id], binding, childNodes] = data
		return ({nodeType, pos, nodeName: tagName, tagName, classList, id, binding, childNodes})
	}
	if (hasChildNodes(nodeType)) {
		const [nodeName, nodeValue, childNodes] = data
		return {nodeType, pos, nodeName, nodeValue, childNodes}
	}
	return {nodeType, pos, data}
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
