export function macroName([tagName, classList, id = '']) {
	return '_macro'
		+ '_' + tagName
		+ '_' + classList.join('_')
		+ '_' + id
}
