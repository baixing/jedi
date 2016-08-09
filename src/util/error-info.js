import {readFileSync} from 'fs'

export default (e, source) => {
	const info = []

	if (e.position) {

		const [filename, line, col] = e.position
		const errorType = e.message === 'Section' ? 'SyntaxError' : e.message
		info.push([])
		info.push(['Syntax error:',
			filename === '*'
			? `I guest it may be ${source} , but not sure...`
			: filename,
		])
		info.push([])

		const lines = readFileSync(filename === '*' ? source : filename, 'utf-8').split(/\r?\n/)
		lines[lines.length - 1] += '\u{1F51A}'

		const startLine = Math.max(e.position[1] - 8, 0),
			endLine = Math.min(e.position[1] + 7, lines.length)

		const showLines = lines.slice(startLine, endLine).map(
			(line, i) => (startLine + i + 1) + ' | ' + line.replace(/\t/g, '    '))

		const spaces = ' '.repeat(String(line).length + 2 + col)
		showLines.splice(line - startLine, 0,
			spaces + '^',
			spaces + '|__ Ooops, ' + errorType + (e.data ? ' ' + JSON.stringify(e.data) : '') + ' at line ' + line + ', column ' + col,
			spaces)

		showLines.forEach(l => info.push([l]))

	} else {
		info.push([String(e.stack || e.message || e)])
	}

	return info
}
