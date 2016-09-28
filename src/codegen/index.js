import memoize from '../util/memoize'
import {PHP5TranspilerWithDebug} from './transpiler.php5'
import {setVersion, php} from './php'

const match = PHP5TranspilerWithDebug.match::memoize(JSON.stringify)

export function compile(ast, target) {
	target = target.toLowerCase()
	if (target.startsWith('php')) {
		const version = target.slice(3).trim()
		setVersion(version)
		console.time('compile php')
		const code = PHP5TranspilerWithDebug::match(ast, 'document')
		const alignedCode = alignEchosAndComments(code)
		const runtimeCode = php().runtime() + '\nnamespace {\n' + alignedCode + '\n}\n'
		console.timeEnd('compile php')
		return runtimeCode
	} else {
		throw new Error('Unsupported target language: ' + target)
	}
}

function alignEchosAndComments(code) {
	return code
		.replace(/^(\s*)echo\s/gm, 'echo$1  ')
		.replace(/((?:^|\n)echo\s+'<.*?)';\necho\s+'>'/g, "$1>'")
		.replace(/\n *(\/\/ \d+, \d+ @ .*)(\n.*)/g, (m, $1, $2) => {
			const fill = ' '.repeat(Math.max(80 - $2.length, 0))
			return $2 + fill + $1
		})
}
