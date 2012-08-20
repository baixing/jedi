void function(exports){

	'use strict'
	//'import ResourceLoader'
	'import Tabish'
	'export jedi'
	
	
	function isEmpty(s) {
		return /^\s*$/.test(s)
	}
	
	//var syntax = Tabish.DSL(resource('jedi.tabish'))
	function InstructionBuilder(block) {
		var result
		if (Object.keys(Syntax).some(function(name){
			var r = Syntax[name]
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
				lines.push(bodyLines.next())
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
	
	var Syntax = {
		FilterBlock: {
			header: /^:([a-z]+)(.*)/i,
			parse: function (header, bodyLines) {
				var self = {
					name: 'Filter',
					filterName: header[1],
					expression: header[2],
				}
				self.children = Blocks(bodyLines, self)
				return self
			}
		},
		Tag: {
			header: /^([a-z0-9_-]+)((?:\.[a-z0-9_-]+)*)(?:#([a-z0-9_-]+))?(.*)/i,
			parse: function(header, bodyLines) {
				if (header[4]) throw 'Unimplemented'
				var self = {
					tagName: header[1],
					attributes: {
						'class': header[2].slice(1).split('.'),
						id: header[3]
					}
				}
				self.children = Blocks(bodyLines, self)
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
		if (template.echo != null)\n\
			$builder.echo = template.echo\n\
		;(\n' + 
			source + '\
		)($model)\n\
		return $builder.contents\n\
	}\n'
			//console.log(source)
			console.log(names, body)
			try {
				var f = Function.apply(null, names.concat(body))
				var template = f.apply(null, values)
				console.log(template)
				return template
			} catch(e) {
				console.error(e)
			}
		},
		imports: function(context) {
			Object.augment(this.context, context)
		}
	})
	
	var MarkupBuilder = {
		contents: '',
		echo: function (s) {
			this.contents += s
		},
		Comment: function(node) {
			this.echo('<!--' + node.value + '-->')
		},
		Tag: function(node, contentBuilder, context) {
			//console.log('tag', node)
			this.startTag(node.tagName, node.attributes)
			contentBuilder()
			this.endTag(node.tagName)
		},
		startTag: function (tagName, attributes) {
			this.echo('<' + tagName + this.attrs(attributes) + '>')
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
		Attribute: function() {
		},
		Text: function(node, context) {
			this.echo(evalStringSource(node.value, context))
		},
		Filter: function(node, contentBuilder) {
			return Filters[node.filterName](node.expression, contentBuilder)
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
	
	function toES5(instructions, indents) {
		if (indents == null) indents = '\t'
		var result = ''
		for (var i = 0; i < instructions.length; i++) {
			var x = instructions[i]
			var attrNames = Object.keys(x).filter(function(name){
				return name != 'children' && name != 'name' && name != 'bindings'
			})
			result += indents + '$builder.' + x.name + '(' + JSON.stringify(x, attrNames) + 
				(x.children != null ?
				', function(){\n' + toES5(x.children, indents + '\t') + indents + '}':'') + ')\n'
		}
		return result
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
	
	exports.jedi = {
		JSRuntime: JSRuntime,
		compileToJS: function(source) {
			var result = Tabish.parse(source, InstructionBuilder, {maxErrors: 0})
			return toES5(result, '\t')
		}
	}

}(this)