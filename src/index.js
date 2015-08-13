/* Jedi public API */
import {Parser} from './parser'
import transform from './transform'
import * as codegen from './codegen'

var fs = require('fs'), path = require('path')
var crypto = require('crypto')

var Cache = require('./cache').Cache
//var FileCache = require('./Cache').FileCache

/*
var ParserCache = Class.extend(FileCache)({
	content: function (file) {
		return Parser.match(file, 'load')
	}
})*/

var cache = new Cache()

function parseFile(filename) {
	console.time('digest')
	var shasum = crypto.createHash('sha1')
	shasum.update(fs.readFileSync(filename))
	var d = shasum.digest('base64')
	console.timeEnd('digest')

	var t
	if (cache.has(d)) {
		t = cache.get(d)
		// hack: replace filename in the cache
		//       note it's not thread-safe
		console.log('replace filename', t[1][0], 'to', filename)
		t[1][0] = filename
		return t
	}
	console.time('parse ' + filename)
	t = Parser.match(filename, 'load')
	console.timeEnd('parse ' + filename)
	cache.set(d, t)
	return t
}

function compile(ast, target) {
	switch (target) {
		case 'php5': case 'php':
			console.time('compile php')
			var code = codegen.php5.match(ast, 'document')
			code = alignEchosAndComments(code)
			console.timeEnd('compile php')
			return code
		case 'es5': case 'ecmascript':
		case 'js': case 'javascript':
			return codegen.es5.match(ast, 'document')
		default:
			throw Error('Unknown target language: ' + target)
	}
}

function alignEchosAndComments(code) {
	code = code
		.replace(/^(\s*)echo\s/gm, 'echo$1  ')
		.replace(/((?:^|\n)echo\s+'<.*?)';\necho\s+'>'/g, "$1>'")

	code = code
		.replace(/\n *(\/\/ \d+, \d+ @ .*)(\n.*)/g, function (m, $1, $2) {
			var fill = new Array(Math.max(81 - $2.length, 0)).join(' ')
			return $2 + fill + $1
		})

	return code
}

var errorInfo = require('./util2').errorInfo

function transpile(source, dest, lang, adaptive, debug) {
	try {
		var configFile = path.dirname(source) + path.sep + 'jedi.json', config = {}
		if (fs.existsSync(configFile)) {
			try {
				config = JSON.parse(fs.readFileSync(configFile))
			} catch(e) {
				console.error('Bad JSON format: ' + configFile)
			}
		}

		var tree = transform(parseFile(source), debug)
		if (adaptive || config.adaptive) {
			tree[4].unshift(['comment', [0, 0], ['html']])
			fs.writeFileSync(dest, compile(tree, lang))

			tree[4][0] = ['comment', [0, 0], ['xhtml mp 1.0']]
			var wapDest = dest.replace(/(?=\.[^.]+$)/, '.wap')
			fs.writeFileSync(wapDest, compile(tree, lang))
		} else {
			fs.writeFileSync(dest, compile(tree, lang))
		}
	} catch (e) {
		errorInfo(e, source).forEach(function (args) {
			console.error.apply(console, args)
		})
		fs.writeFileSync(dest, outputCompilingError(e, source, lang))
	}
}

function outputCompilingError(e, source, lang) {
	if (lang !== 'php') throw new Error(lang + ' is not supported')
	return '<pre>'
		+ errorInfo(e, source).map(function (args) {
			return args.join(' ').replace(/&/g, '&amp;').replace(/</g, '&lt;')
		}).join('\n')
		+ '\n</pre>'
	return String(info)
}

function watch(source, dest, lang, adaptive, debug) {
	//TODO: watch dependencies
	transpile(source, dest, lang, adaptive, debug)
	fs.watch(source, function(/*evt, filename*/) {
		transpile(source, dest, lang, adaptive, debug)
	})
}

exports.parseFile = parseFile
//exports.transform = transform
//exports.compile = compile
exports.transpile = transpile
exports.watch = watch
