export const isChar = c => typeof c === 'string' && c.length === 1

export const isCharArray = a => Array.isArray(a) && a.every(isChar)

export const string = a => {
	if (typeof a === 'string') return a
	if (isCharArray(a)) return a.join('')
	throw Error(a + ' is not a string')
}

export const codepoint = a => String.fromCodePoint(parseInt(string(a), 16))

export const flattenArray = a => [].concat(...a)

export const flattenString = a => {
	if (!Array.isArray(a)) return a
	if (a.every(isChar)) return a.join('')
	return a.map(flattenString)
}

export const flattenLines = (lines, indent = '') => {
	return lines.reduce((xs, x) => {
		if (Array.isArray(x)) xs.push(...flattenLines(x, indent + ' '))
		else xs.push(indent + x)
		return xs
	}, [])
}

export const indent = s => typeof s === 'string' ? '  ' + s : s
