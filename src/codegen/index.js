import memoize from '../util/memoize'
import {PHP5TranspilerWithDebug} from './transpiler.php5'
const match = PHP5TranspilerWithDebug.match::memoize()

export const compile = (ast, target) => {
	switch (target) {
		case 'php5': case 'php':
			console.time('compile php')
			let code = PHP5TranspilerWithDebug::match(ast, 'document')
			code = alignEchosAndComments(code)
			console.timeEnd('compile php')
			return code
		case 'es5': case 'ecmascript':
		case 'js': case 'javascript':
		default:
			throw Error('Unknown target language: ' + target)
	}
}

const alignEchosAndComments = code => {
	code = code
		.replace(/^(\s*)echo\s/gm, 'echo$1  ')
		.replace(/((?:^|\n)echo\s+'<.*?)';\necho\s+'>'/g, "$1>'")
	code = code
		.replace(/\n *(\/\/ \d+, \d+ @ .*)(\n.*)/g, (m, $1, $2) => {
			const fill = ' '.repeat(Math.max(80 - $2.length, 0))
			return $2 + fill + $1
		})
	return code
}
