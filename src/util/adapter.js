import {skip, hasChildNodes} from './node'

export const tuple2record = (t) => {
	if (skip(t)) return {nodeType: 'skip', data: t}
	const [nodeType, pos, ...data] = t
	const position = [...pos] // copy to avoid being cached
	if (nodeType === 'element') {
		const [[tagName, classList, id], binding, childNodes] = data
		return ({nodeType, position, nodeName: tagName, tagName, classList, id, binding, childNodes})
	}
	if (hasChildNodes(nodeType)) {
		const [nodeName, nodeValue, childNodes] = data
		return {nodeType, position, nodeName, nodeValue, childNodes}
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
