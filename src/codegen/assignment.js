import {macroName} from '../util/macro'
import {php} from './php'
import wrap from './wrap'

const g = php()

const hasOwn = {}.hasOwnProperty

export function assignments(bindings, scope, body) {
	const result = []
	bindings.forEach(([pattern, expr]) => {
		result.push(...assignment(scope, pattern, expr))
	})
	if (body.length > 0) result.push(g.block(scope, body))
	return result
}

export function assignment(scope, assignmentPattern, expression) {

	const [kind, value] = assignmentPattern
	switch (kind) {
		case 'Symbol':
			return [g.var(value) + ' = ' + expression + ';']
		case 'ListPattern': {
			const names = [], before = [], after = [], sub = []
			let rest = ''
			let x = before

			value.forEach(element => {
				const [kind, value] = element
				if (kind === 'RestPattern') {
					names.push(g.var(value[1]))
					x = after
				} else if (kind === 'Symbol') {
					names.push(g.var(value))
					x.push('null')
				} else {
					const temp = g.var(scope.newTemp())
					names.push(temp)
					x.push('null')
					sub.push(assignment(element, temp))
				}
			})
			return [
				`list(${names.join(', ')}) = ` +
				(x === before
					? `\\Jedi\\listPattern(${expression}, ${g.seq(before)})`
					: `\\Jedi\\listRestPattern(${expression}, ${g.seq(before)}, ${g.seq(after)})`
				) + ';'
			].concat(sub)
		}
		case 'RecordPattern': {
			const names = [], sub = []
			let defaults = []
			const groups = []
			value.forEach(element => {
				const [kind, name, binding] = element
				if (kind === 'RestPattern') {
					names.push(g.var(name[1]))
					groups.push(defaults)
					defaults = []
				} else if (kind === 'MappingPattern') {
					if (typeof name === 'string') {
						const [kind, value] = binding
						if (kind === 'Symbol') {
							names.push(g.var(value))
							defaults.push([g.str(name), 'null'])
						} else {
							const temp = g.var(scope.newTemp())
							names.push(temp)
							defaults.push([g.str(name), 'null'])
							sub.push(assignment(binding, temp))
						}
					} else throw new Error('Not implemented: ' + name)
				} else throw new Error('Unknown kind: ' + kind)
			})
			groups.push(defaults)
			return [
				`list(${names.join(', ')}) = \\Jedi\\recordPattern(${expression}, ${g.seq(groups.map(x => g.assoc(x)))});`
			].concat(sub)
		}
		case 'TuplePattern': return ''
		default:
			throw new Error('Unknown kind: ' + kind)
	}
}


export function translateMultiLoops(bindings, children, body) {
	bindings.reverse().forEach(([iterable, value, key, at]) => {
		const [valueKind, valueName] = value
		let valueVar
		if (valueKind === 'Symbol') {
			valueVar = g.var(valueName)
		} else {
			valueVar = g.var(children.scope.newTemp())
			body.unshift(assignment(value, valueVar))
		}
		body = g.foreach(children.scope, iterable,
			key ? g.var(key[1]) : undefined,
			valueVar,
			at ? g.var(at[1]) : undefined,
			body)
	})
	return body
}


export function echoLines(lines) {
	var n = lines.length
	return lines.map(function(l, i) {
		return (i > 0 ? '     ' : 'echo ') + l + (i < n - 1 ? ',' : ';')
	})
}


export function isNamespace(s) {
	return s.endsWith('*')
}


export function startsWithUpperCase(s) {
	return s >= 'A' && s < '['
}


export function elementOutput(output, [tag, cls, id], bind, scope, body) {
	const startT = output.startTag(tag, cls, id)
	const endT = output.endTag(tag)

	if (bind === undefined) return [startT, g.block(scope, body), endT]

	//dirty implementation for script = data
	if (tag === 'script' && bind) {
		body.splice(1, 0, "echo 'void function(data){';")
		body.push(`echo '}(', json_encode(${bind}, 0x100), ')';`)
		return [startT, body, endT]
	}

	const m = resolveMacro([tag, cls, id], scope)
	if (m) {
		return [
			startT,
			`${m}(${bind});`,
			endT
		]
	} else {
		if (scope.bindings.size > 0) {
			return g.block(scope, [startT, body, endT], bind)
		} else {
			body.push("echo " + output.phpEscapeText(bind) + ';')
			return [startT, body, endT]
		}
	}
}

export function createMacro(name, param, scope, body) {
	body.unshift(assignment(scope, param, '$context'))
	const result = wrap(
		g.var(macroName(name)) + ' = ',
		g.closure(scope, '$context', body),
		';'
	)
	// console.log(result)
	return result
}

export function resolveMacro(element, scope) {
	const name = scope.findMacro(element)
	if (!name) return null
	return g.var(name)
}

export function resolve(name, scope) {
	// console.log('resolve', name, scope)
	const [type, id] = scope.findSymbol(name)
	switch (type) {
		case 'local': return g.var(id)
		case 'global': return '$data->' + id
		case 'use': return id
		default: throw new Error(type)
	}
}
