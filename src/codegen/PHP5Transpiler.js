import {dir} from '../util/debug'
import {OutputHTML, OutputXML, OutputXHTML} from './output'
import {flattenArray} from '../util/ometa-string'


export function PHP5Transpiler_init() {
	this._stack = [['page']]

	this.findSymbol = function (symbol) {
		for (var i = 0; i < this._stack.length; i++) {
			var symbolList = this._stack[i]
			var s = symbolList.find(matchSymbol)
			if (s) return {
				name: '$' + s,
				level: i
			}
		}
		function matchSymbol(s) {
			return s === symbol
				|| s.slice(symbol.length + 2) === symbol + '__' && s.slice(-2) === '__'
		}
	}

	this.createBindings = function (bindings) {
		const currentBindings = this._stack[0]
		const newBindings = {}
		for (const binding of bindings) {
			const s = this.findSymbol(binding)
			if (s) {

			} else {
				newBindings[binding] = binding
			}
		}
		return newBindings
	}
	this.enterBlock = function(bindings) {
		this._stack.unshift(bindings)
	}
	this.exitBlock = function() {
		var needImport = this._stack[0].needImport || []
		this._stack.shift()
		return needImport
	}
	this.resolve = function(symbol) {
		var s = this.findSymbol(symbol)
		var ans, importSymbol, level
		if (s) {
			ans = s.name
			level = s.level
			importSymbol = symbol
		} else {
			ans = '$data->' + symbol
			importSymbol = 'data'
			level = this._stack.length
		}
		for (var i = 0; i < level; i++) {
			if (this._stack[i].needImport === undefined) this._stack[i].needImport = [importSymbol]
			else this._stack[i].needImport.push(importSymbol)
		}
		return ans
	}
	this.saveExternalSymbol = function (symbol) {
		if (this._stack[0].externals === undefined) this._stack[0].externals = [symbol]
		else this._stack[0].externals.push(symbol)
	}
	this.externalSymbol = function(symbol) {
		for (var i = 0; i < this._stack.length; i++) {
			var e = this._stack[i].externals || []
			if (e.indexOf(symbol) >= 0) return symbol
		}
		throw fail
	}

	this.saveMacro = function(elementPattern, parameter, body, free) {
		if (this._stack[0].macros === undefined) this._stack[0].macros = []
		this._stack[0].macros.push([elementPattern, parameter, body, free])
	}
	this.elementOutput = function (tag, cls, id, bind, children, body, startT, endT, param) {
		if (bind === undefined) return [startT, body, endT]
		//dir(children)
		//dirty implementation for script = data
		if (tag === 'script' && bind) {
			body.splice(1, 0, "echo 'void function(data){';")
			body.push("echo '}(', json_encode($context, 0x100), ')';")
			return closure(bind, [startT, body, endT], param)
		}
		var overrided = children.some(function(node){
			//console.log(node)
			return ['element', 'text', 'comment', 'instruction'].indexOf(node[0]) >= 0
		})
		if (overrided) return closure(bind, [startT, body, endT], param)
		else {
			var m = this.findMacro(tag, cls, id, bind)
			if (m) {
				return closure(bind, [startT, m[2], endT], m[3]) // || ['//call macro']
			} else {
				return closure(bind, [startT, "echo '>', " + this.output.phpEscapeText('$context') + ';', endT], param)
			}
		}
	}
	this.findMacro = function (tag, cls, id, param) {
		//console.log('findMacro', tag, cls, id)
		//dir(this._stack)
		var mostSpecific, specificity
		for (var n = 0; n < this._stack.length; n++) {
			if (this._stack[n].macros)
				for (var i = 0; i < this._stack[n].macros.length; i++) {
					var m = this._stack[n].macros[i]
					var elemPattern = m[0]
					if (elemPattern[0] === tag &&
						elemPattern[1].every(function(c){ return cls.indexOf(c) >= 0 })
					) {
						var s = (elemPattern[1].length * 256) - n
						if (!mostSpecific || s >= specificity) {
							mostSpecific = m
							specificity = s
						}
					}
				}
		}
		//console.log('findMacro result:', mostSpecific)
		return mostSpecific
	}
	this.savePosition = function (filename, line, column) {
		this._currentPosition = [filename, line, column]
	}

	this.output = new OutputHTML()

	this.setOutputMethod = function (method) {
		console.log(method)
		switch (method) {
			case 'html':
				this.output = new OutputHTML()
				break
			case 'xhtml':
				this.output = new OutputXHTML()
				break
			case 'xml':
				this.output = new OutputXML()
				break
			default:
				throw Error('Unknown output method: ' + method)
		}
	}

	this.attachDebugInfo = function (x, pos) {
		return x
	}

}

function deleteRedundantEcho(lines) {
	for (var i = 1; i < lines.length; i++) {
		if (lines[i].match(/^\s*echo/) && (lines[i - 1].match(/^\s*echo/) || lines[i - 1].match(/^\s*,/))) {
			lines[i - 1] = lines[i - 1].substring(0, lines[i - 1].length - 1)
			lines[i] = lines[i].replace('echo', ',')
		}
	}
	var ans = ''
	for (var i = 0; i < lines.length; i++) {
		ans += lines[i] + '\n'
	}
	return ans
}

function echoLines(lines) {
	var n = lines.length
	return lines.map(function(l, i) {
		return (i > 0 ? '     ' : 'echo ') + l + (i < n ? ',' : ';')
	})
}

function translateMultiLoops(binds, b) {
	if (binds.length > 0) {
		var bind = binds.shift();
		return ["foreach (" + bind[1] + " as " + bind[0][1] + ") {", translateMultiLoops(binds,b), "}"]
	}
	return b;
}

function simpleString(s) {
	return string(s).replace(/'/g, "\\'")
}

function unique(param) {
	var result = [];
	for (var i=0; i < param.length; i++) {
		if (result.indexOf(param[i]) == -1) result.push(param[i])
	}
	return result
}

function phpVariable(param) {
	return '$' + param
}

function getImportString(param) {
	var result = unique(param)
	result = result.map(phpVariable)
	return param.length > 0 ? ' use (' + result.join(',') + ')' : ''
}

function closure(context, body, param) {
	return [
		'call_user_func(function ($context)' + getImportString(param) + ' {',
		body,
		'}, ' + context + ');'
	]
}

export function collectSymbols(binds) {
	return flattenArray(binds.map(function(b){
		return b[0][0]
	}))
}

export function assignment(binds, body, param) {
	var key = '', value = ''
	for (var i = 0; i < binds.length; i++) {
		key += binds[i][0][1]
		value += binds[i][1]
		if (i < binds.length - 1) {
			key += ','
			value += ','
		}
	}
	return [
		'call_user_func(function(' + key + ')' + getImportString(param) + ' {',
		body,
		'}, ' + value + ');'
	]
}

export function phpAssignment(bindings) {
	return bindings.map(function (binding) {
		return binding[0][1] + ' = ' + binding[1] + ';'
	}).join(' ')
}
