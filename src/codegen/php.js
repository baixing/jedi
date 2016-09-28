import wrap from './wrap'
import {string} from '../util/ometa-string'

let ver = '5.6'

export function getVersion() {
	return ver
}

export function setVersion(version) {
	const m = /^(5)\.?([3456])(\..*)?$/.exec(version)
	if (m) {
		ver = m[1] + '.' + m[2]
		return true
	} else {
		return false
	}
}

export function php(version = ver) {
	switch (version) {
		case '5.6': return php56
		case '5.5': return php55
		case '5.4': return php54
		case '5.3': return php53
		default: throw new Error('Invalid version: ' + version)
	}
}

export const php53 = {
	str(s) {
		return "'" + string(s).replace(/'/g, "\\'") + "'"
	},
	array(s) {
		return `array(${s})`
	},
	pair([key, value]) {
		return `${key} => ${value}`
	},
	seq(values) {
		return this.array(values.join(', '))
	},
	assoc(entries) {
		return this.array(entries.map(this.pair).join(', '))
	},
	var(s) {
		return '$' + this.varName(s)
	},
	tempVar(scope) {
		if (!scope._) scope._ = 1
		else ++scope._
		return '$_' + scope._
	},
	varName(s) {
		return /^[a-z_\x7f-\xff][a-z0-9_\x7f-\xff]*$/i
			.test(s) ? s : '{' + this.str(s) + '}'
	},
	closure(scope, param, body) {
		const useVars = this.useVars(scope)
		return [
			`function (${param})${useVars} {`,
			body,
			'}',
		]
	},
	foreach(scope, iterable, key, value, at, body) {
		if (!at) {
			if (!key) {
				return wrap(
					`\\Jedi\\foreachValue(${iterable}, `,
					this.closure(scope, value, body),
					');')
			} else {
				return wrap(
					`\\Jedi\\foreachKeyValue(${iterable}, `,
					this.closure(scope, `${key}, ${value}`, body),
					');')
			}
		} else {
			if (!key) {
				return wrap(
					`\\Jedi\\foreachValueAt(${iterable}, `,
					this.closure(scope, `${value}, ${at}`, body),
					`);`)
			} else {
				return wrap(
					`\\Jedi\\foreachKeyValueAt(${iterable}, `,
					this.closure(scope, `${key}, ${value}, ${at}`, body),
					`);`)
			}
		}
	},
	callClosure(closure, args) {
		return wrap('call_user_func(', closure, ')')
	},
	block(scope, body, context = null) {
		if (context) {
			return wrap(
				'call_user_func(',
				this.closure(scope, '$context', body),
				`, ${context});`)
		} else if (scope.bindings.size > 0 || scope.macros && scope.macros.length > 0) {
			return wrap(
				'call_user_func(',
				this.closure(scope, '', body),
				');')
		} else {
			return body
		}
	},
	useVars(scope) {
		const vars = Array.from(scope.freeVars).map(name => this.var(name))
			.concat(Array.from(scope.freeMacros).map(name => '&' + this.var(name)))
		return vars.length > 0 ? ` use (${vars.join(', ')})` : ''
	},
	runtime() {
		return read('runtime.php5')
	},
}

export const php54 = {
	...php53,
	array(s) {
		return `[${s}]`
	},
}

export const php55 = php54

export const php56 = php55


import {readFileSync} from 'fs'
import {join} from 'path'

function read(f) {
	return readFileSync(join(__dirname, f), 'utf8')
}
