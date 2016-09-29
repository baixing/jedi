export function macroName([tagName, classList, id = '']) {
	const name = '_macro'
		+ '_' + tagName
		+ '_' + classList.join('_')
		+ '_' + id
	return name.replace(/[^a-z0-9_\x7f-\xff]/gi, '_')
}
