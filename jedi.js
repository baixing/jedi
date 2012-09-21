'use strict'
//'import ResourceLoader'
imports: {StopIteration} from: 'lib/Tabish/iterator.js'
imports: {Tabish} from: 'lib/Tabish/tabish.js'
imports: {Class} from: 'lib/Tabish/type.js'


var Grammar = {
	Struct: {
		header: /^:(.*)/i,
		parse: function (header, bodyLines) {
			var self = {
				struct: header[1],
			}
			self.children = Blocks(bodyLines, self)
			return self
		}
	},
	Bind: {
		header: /^=(.*)/,
		parse: function (header, bodyLines) {
			var self = {
				name: 'Tag',
				tagName: null,
				model: header[1],
			}
			self.children = Blocks(bodyLines, self)
			return self
		}
	},
	Tag: {
		header: /^([a-z0-9_-]+)((?:\.[a-z0-9_-]+)*)(?:#([a-z0-9_-]+))?(.*)/i,
		parse: function(header, bodyLines) {
			var self = {
				tagName: header[1],
				attributes: {
					'class': header[2].slice(1).split('.'),
					id: header[3]
				}
			}
			var m = /\s+=(.*)/.exec(header[4])
			if (m != null) self.model = m[1]
			if (self.tagName === 'style' || self.tagName === 'script')
				self.children = [{name:'Text', value:Text(bodyLines)}]
			else self.children = Blocks(bodyLines, self)
			return self
		}
	},
	Attribute: {
		header: /@([a-z0-9_-]+)\s?(.?=)?\s?(.*)/,
		parse: function(header, bodyLines) {
			return {
				attributeName: header[1],
				operation: header[2],
				value: isEmpty(header[3]) ?
					Text(bodyLines) :
					header[3] + Null(bodyLines, 'Attribute')
			}
		}
	},
	TextBlock: {
		header: /^'\t(.*)/,
		parse: function (header, bodyLines) {
			return {
				name: 'Text',
				value: header[1] + '\n' + Text(bodyLines)
			}
		}
	},
	TextLine: {
		header: /^'(.*)/,
		parse: function(header, bodyLines) {
			var s = header[1]
			if (s.slice(-1) === "'") s = s.slice(0, -1)
			return {
				name: 'Text',
				value: s + Null(bodyLines, 'TextLine')
			}
		}
	},
	Comment: {
		header: /^--(.*)/,
		parse: function (m, bodyLines) {
			return {
				value: m[1] + '\n' + Text(bodyLines)
			}
		}
	}
}


function toES5(instructions, indents) {
	if (indents == null) indents = '\t'
	var result = ''
	var startTagClosed = false
	for (var i = 0; i < instructions.length; i++) {
		var x = instructions[i]
		var content = x.children != null ?
			toES5(x.children, indents + '\t') : ''

		if (x.struct != null) {
			var ifElse = /^\s*if\s+(.+)/.exec(x.struct)
			if (ifElse != null) {
				result += content &&
					indents + 'if (' + compileES5Expression(ifElse[1]) + ') {\n' +
					content +
					indents + '}\n'
			}
			var forIn = /^\s*for\s+(.+)in\s+(.+)/.exec(x.struct)
			if (forIn != null) {
				result += content &&
					indents + ';(' + compileES5Expression(forIn[2]) + ').forEach(function(' + forIn[1] + '){\n' +
					content +
					indents + '})\n'
			}
			var lets = /^\s*let\s+(.+)/.exec(x.struct)
			var bindings = ''
			if (lets != null) {
				result += content &&
					indents + 'void function(){ var ' + compileES5Expression(lets[1]) + '\n' +
					content +
					indents + '}()\n'
			}
		} else {
			var closeStartTag = ''
			if (!startTagClosed && x.name !== 'Attribute' && x.name !== 'Struct') {
				closeStartTag = '$builder.closeStartTag($element);'
				startTagClosed = true
			}
			var attrNames = Object.keys(x).filter(function(name){
				return name != 'children' && name != 'name' && name != 'model'
			})
			if (x.name === 'Text') {
				content = indents + '\t$builder.echo(' + compileES5StringTemplate(x.value) + ')\n'
			} else if (x.name === 'Attribute') {
				var exp = x.value ? compileES5Expression(x.value) : '""'
				var op
				switch (x.operation) {
					case '=': case '':
						op = '=' + exp
						break
					case '+=':
						op = '.add(' + exp + ')'
						break
					case '-=':
						op = '.remove(' + exp + ')'
						break
					case '+-=':
						op = '.toggle(' + exp + ')'
						break
					default:
						throw 'Unknown attribute operation: ' + x.operation
				}
				content = indents + '\t$element["' + x.attributeName + '"]' + op + '\n'
			}
			result += indents + closeStartTag + '$builder.' + x.name + '(' + JSON.stringify(x, attrNames) + ', $element' +
				(content &&
				', function(' + (x.model ? '$model' : '') + '){' + (x.tagName ? 'var $element = ' + JSON.stringify(x.attributes) : '') + '\n' +
				content +
				indents + '}') + ')\n'
		}
	}
	if (!startTagClosed) {
		result += indents + '$builder.closeStartTag($element)\n'
	}

	return result
}

function toPHP(instructions, indents) {
	if (indents == null) indents = '\t'
	var result = ''
	var startTagClosed = false
	for (var i = 0; i < instructions.length; i++) {
		var x = instructions[i]
		var content = x.children != null ?
			toES5(x.children, indents + '\t') : ''

		if (x.struct != null) {
			var ifElse = /^\s*if\s+(.+)/.exec(x.struct)
			if (ifElse != null) {
				result += content &&
					indents + 'if (' + ifElse[1] + ') {\n' +
					content +
					indents + '}\n'
			}
			var forIn = /^\s*for\s+(.+)in\s+(.+)/.exec(x.struct)
			if (forIn != null) {
				result += content &&
					indents + ';foreach (' + forIn[2] + ' as ' + forIn[1] + ') {\n' +
					content +
					indents + '}\n'
			}
			var lets = /^\s*let\s+(.+)/.exec(x.struct)
			var bindings = ''
			if (lets != null) {
				bindings = 'var ' + lets[1]
				result += content &&
					indents + 'call_user_func(function(){ ' + lets[2] + ';\n' +
					content +
					indents + '});\n'
			}
		} else {
			var closeStartTag = ''
			if (!startTagClosed && x.name !== 'Attribute' && x.name !== 'Struct') {
				closeStartTag = '$builder->closeStartTag($element);'
				startTagClosed = true
			}
			var attrNames = Object.keys(x).filter(function(name){
				return name != 'children' && name != 'name' && name != 'model'
			})
			result += indents + closeStartTag + '$builder->' + x.name + '(' + JSON.stringify(x, attrNames) + ', $element' +
				(content &&
				', function(' + (x.model ? '$model' : '') + '){' + (x.tagName ? '$element = ' + JSON.stringify(x.attributes) : '') + ';\n' +
				content +
				indents + '}') + ');\n'
		}
	}
	if (!startTagClosed) {
		result += indents + '$builder.closeStartTag($element)\n'
	}

	return result
}

function isEmpty(s) {
	return /^\s*$/.test(s)
}

//var syntax = Tabish.DSL(resource('jedi.tabish'))
function InstructionBuilder(block) {
	var result
	if (Object.keys(Grammar).some(function(name){
		var r = Grammar[name]
		var m = r.header.exec(block.headerLine.content)
		if (m == null) return false
		//console.log(name, block.headerLine.content, m)
		result = r.parse(m, block.bodyLines)
		if (result.name == null) result.name = name
		return true
	})) {
		//console.log(result)
		return result
	} else throw 'Unknown structure:' + block.headerLine.content
}

function Text(bodyLines) {
	var lines = []
	try {
		while (true) {
			lines.push(bodyLines.next().content)
		}
	} catch(e) {
		console.assert(e === StopIteration, e)
	}
	return lines.join('\n')
}

function Null(bodyLines, name) {
	try {
		while (true) {
			if (!isEmpty(bodyLines.next().content))
				throw name + ' should not have child!'
		}
	} catch(e) {
		if (e !== StopIteration) throw e
		return ''
	}
}

function Blocks(bodyLines, parent) {
	return Tabish.parse(bodyLines,
		InstructionBuilder, {parent: parent})
}

exports: JSRuntime
function JSRuntime() {
	var r = JSRuntime.create({
		context: Object.create(null)
	})
	r.imports({
		$builder: MarkupBuilder
	})
	return r
}

Class(JSRuntime).Public({
	eval: function(source) {
		var ctx = this.context
		var names = Object.keys(ctx)
		var values = names.map(function(name){ return ctx[name] })
		var body = '\
"use strict"\n\
return function template($model) {\n\
	var $element = null\n\
	if (template.echo != null)\n\
		$builder.echo = template.echo\n\
	{\n' +
		source + '\
	}\n\
	return $builder.content\n\
}\n'
		//console.log(source)
		console.log(names, body)
		//try {
			var f = Function.apply(null, names.concat(body))
			var template = f.apply(null, values)
			//console.log(template)
			return template
		//} catch(e) {
		//	console.error(e.message, e)
		//}
	},
	imports: function(context) {
		Object.augment(this.context, context)
	}
})

var MarkupBuilder = {
	content: '',
	tags: [],
	echo: function (s) {
		this.content += s
	},
	Comment: function(node) {
		this.echo('<!--' + node.value + '-->')
	},
	Tag: function(node, attrs, contentBuilder, context) {
		//console.log('tag', node)
		this.openStartTag(node.tagName)
		if (contentBuilder) contentBuilder()
		this.endTag(node.tagName)
	},
	openStartTag: function (tagName) {
		this.tags.push(tagName)
	},
	closeStartTag: function (attributes) {
		var tagName = this.tags.pop()
		if (tagName) this.echo('<' + tagName + this.attrs(attributes) + '>')
	},
	endTag: function (tagName) {
		this.echo('</' + tagName + '>')
	},
	attrs: function (attrs) {
		return Object.keys(attrs).map(function(name){
			if (attrs[name])
				return ' ' + name + '="' + attrs[name] + '"'
			else return ''
		}).join('')
	},
	Attribute: function(node, _, contentBuilder) {
		contentBuilder()
		return
		var n = node.attributeName
		var v = node.value
		switch (node.operation) {
			case '=': case '':
				attrs[n] = v
				break
			case '+=':
				var i = attrs[n].indexOf(v)
				if (i === -1) attrs[n].push(v)
				break
			case '-=':
				var i = attrs[n].indexOf(v)
				if (i >= 0) attrs[n].splice(i, 1)
				break
			case '+-=':
				var i = attrs[n].indexOf(v)
				if (i >= 0) attrs[n].splice(i, 1)
				else attrs[n].push(v)
				break
			default:
				throw 'Unknown attribute operation: ' + node.operation
		}
	},
	Text: function(node, _, contentBuilder) {
		contentBuilder()
	},
	Struct: function(node, contentBuilder) {
		throw 'uncompiled structure'
		//return Filters[node.filterName](node.expression, contentBuilder)
	},
	Bind: function(node, contentBuilder) {
		throw 'uncompiled structure'
	}
}

function htmlBuilder(block) {
	var result
	if (Object.keys(JediProcessors).some(function(name){
		var p = JediProcessors[name]
		var m = p.header.exec(block.headerLine.content)
		if (m == null) return false
		console.log(name, block.headerLine.content, m)
		result = p.processor(m, block.bodyLines)
		result.nodeName = name
		return true
	})) return result
	else throw 'Unknown structure:' + block.headerLine.content
}

function BlockProcessor(header, bodyLines) {
	if (header[4]) throw 'Unimplemented'
	return {
		tagName: header[1],
		className: header[2].replace(/./g, ' '),
		id: header[3],
		children: Tabish.parse(bodyLines, htmlBuilder)
	}
}

function DataProcessor(name) {
	return function (header, bodyLines) {
		var lines = []
		try {
			while (true) {
				lines.push(bodyLines.next())
			}
		} catch(e) {
			console.assert(e === StopIteration, e)
		}
		return {
			nodeName: name,
			value: header[1] + '\n' + lines.join('\n')
		}
	}
}
function NullProcessor(name, processor) {
	return function(header, bodyLines) {
		try {
			while (true) {
				if (!/^\s*$/.test(bodyLines.next().content))
					throw name + ' should not have child!'
			}
		} catch(e) {
			if (e !== StopIteration) throw e
		}
		var result = processor(header)
		result.nodeName = name
		return result
	}
}

var JediProcessors = {
	'Comment': {
		header: /^--(.*)/,
		processor: DataProcessor,
		render: function(block) {
			return '<!--' + block.value + '-' + '->'
		}
	},
	'TagBlock': {
		header: /^([a-z0-9_-]+)((?:\.[a-z0-9_-])*)(?:#([a-z0-9_-]*))?(.*)/i,
		processor: BlockProcessor,
		render: function(block, context) {
			var s = ''
			s += '<' + block.tagName + '>'
			//if (block.id)
			if (block.children) {
				for (var i = 0; i < block.children.length; i++) {
					s += render(block.children[i], context)
				}
			}
			s += '</' + block.tagName + '>'
			return s
		}
	},
	'Attribute': {
		header: /@([a-z0-9_-]+)\s?(.?=)?\s?(.*)/,
		processor: NullProcessor('Attribute', function(header){
			return {
				nodeName: 'Attribute',
				attr: header[1],
				op: header[2],
				value: header[3]
			}
		}),
		render: function(block, context) {
			return block.attr + '=' + '"' + evalExp(block.value, context) + '"'
		}
	},
	'TextBlock': {
		header: /^'\t(.*)/,
		processor: DataProcessor('TextBlock'),
		render: function(block, context) {
			return evalStringSource(block.value, context)
		}
	},
	'TextLine': {
		header: /^'(.*)/,
		processor: NullProcessor('TextLine', function(header) {
			var s = header[1]
			if (s.slice(-1) === "'") s = s.slice(0, -1)
			return {
				value: s
			}
		}),
		render: function(block, context) {
			return evalStringSource(block.value, context)
		}
	},
	'FilterBlock': {
		header: /^:([a-z]+)(.*)/i,
		processor: FilterProcessor,
		render: function(block, parentContext) {
			return Filters[block.filterName](block.expression, function(context){
				context = Object.create(parentContext)
				var s = ''
				if (block.children) {
					for (var i = 0; i < block.children.length; i++) {
						s += render(block.children[i], context) + '\n'
					}
				}
				return s
			})
		}
	}
}

function FilterProcessor(header, bodyLines) {
	return {
		filterName: header[1],
		expression: header[2],
		children: Tabish.parse(bodyLines, htmlBuilder)
	}
}

var Filters = {
	'if': function (exp, body) {
		if (evalExp(exp)) return body()
		else return ''
	},
	'else': function (exp, body) {
	},
	'for': function (exp, body) {
		var a = /(.+?)\sin\s(.+)/.exec(exp)
		var name = a[1]
		var collection = evalExp(a[2])
		var s = ''
		for (var i = 0; i < collection.length; i++) {
			var context = {}
			context[name] = collection[i]
			s += body(context)
		}
		return s
	}
}
function renderAll(result, context) {
	ctx = Object.create(null)
	Object.keys(context).forEach(function(key){
		ctx[key] = context[key]
	})
	for (var i = 0; i < result.length; i++) {
		render(result[i], ctx)
	}
}

function render(jedi, context) {
	return JediProcessors[jedi.nodeName].render(jedi, context)
}

function dump(result, level) {
	if (level == null) level = 0
	for (var i = 0; i < result.length; i++) {
		var block = result[i]
		if (block instanceof Error)
			console.log(block.toString())
		else
			console.log(block.value == null ?
				'_' :
				new Array(level + 1).join('  ') + block.value.content)
		if (block.children)
			dump(block.children, level + 1)
	}
}

function evalExp(x, context) {
	try {
		return context != null ?
			new Function('context', 'with (context) { return (' + x + ') }')(context) :
			new Function('return (' + x + ')')()
	} catch(e) {
		console.log('eval error: ', x)
	}
}
function evalStringSource(s, context) {
	return s.replace(/{(.+?)}/g, function(_, exp){
		return evalExp(exp)
	})
}

function compileES5StringTemplate(s) {
	var a = s.split(/{(.+?)}/)
	var result = []
	for (var i = 0; i < a.length; i++) {
		result.push(
			i % 2 === 0 ?
				'"' + a[i].replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"':
				'(' + compileES5Expression(a[i]) + ')'
		)
	}
	return result.join(' + ')
}

function compileES5Expression(s) {
	return s.replace(/\*\./g, '$model.')
}


exports: compileToJS
function compileToJS(source) {
	var result = Tabish.parse(source, InstructionBuilder, {maxErrors: 0})
	return toES5(result, '\t')
}
