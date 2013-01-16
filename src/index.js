/* Jedi public API */

'use strict'

require('../lib/ometa-js')

var Parser = require('./parser').Parser
var transformer = require('./transformer')
var transpiler = {
	php5: require('./transpiler.php5').PHP5Transpiler,
	es5: require('./transpiler.es5').ES5Transpiler
}

var fs = require('fs'), path = require('path')
var http = require('http'), url = require('url')

var util = require('./util')

var Class = require('mmclass').Class
var FileCache = require('./Cache').FileCache

var ParserCache = Class.extend(FileCache)({
	content: function (file) {
		return Parser.match(file, 'load')
	}
})

var cache = new ParserCache()

function parseFile(filename) {
	return cache.get(path.resolve(filename))
}

function transform(tree, debug) {
	if (debug === undefined) debug = []
	var tree1 = tree
	if (debug[0]) util.dir(tree1)
	var tree2 = transformer.InstructionsProcessor.match(tree1, 'document')
	if (debug[1]) util.dir(tree2)
	var tree3 = transformer.TemplateMatcher.match(tree2, 'document')
	if (debug[2]) util.dir(tree3)
	var tree4 = transformer.Sorter.match(tree3, 'document')
	if (debug[3]) util.dir(tree4)
	return tree4
}

function compile(ast, target) {
	switch (target) {
		case 'php5': case 'php':
			return transpiler.php5.match(ast, 'document')
		case 'es5': case 'ecmascript':
		case 'js': case 'javascript':
			return transpiler.es5.match(ast, 'document')
		default:
			throw Error('Unknown target language: ' + target)
	}
}

function transpile(source, dest, lang, debug) {
	try {
		var tree = transform(parseFile(source), debug)
		fs.writeFileSync(dest, compile(tree, lang))
	} catch(e) {
		var info = e.stack || e.message || e
		console.error('Error: ', String(info))
		fs.writeFileSync(dest, info)
	}
}

function watch(source, dest, lang, debug) {
	//TODO: watch dependencies
	transpile(source, dest, lang, debug)
	fs.watch(source, function(evt, filename) {
		transpile(source, dest, lang, debug)
	})
}

function service(options) {
	//var watched = []

	http.createServer(function (req, res) {
		switch (req.method) {
			case 'GET':
				var f = path.join(options.base, url.parse(req.url).path)
				//if (watched.indexOf(path) >= 0)

				fs.exists(f, function(exists){
					if (!exists) {
						res.writeHead(404)
						res.end('file not exist\n')
					} else {
						var t0 = Date.now()
						options.lang.forEach(function(lang){
							transpile(f, f.replace(/\.jedi$/, '.' + lang), lang)
						})
						var t1 = Date.now()
						res.writeHead(200)
						res.end('transpiled in ' + (t1 - t0) + 'ms\n')
					}
				})

				//transpiler.watch(loc.pathname)
				break
			default:
				res.writeHead(405)
				res.end()
		}
	}).listen(options.port)

}

exports.parseFile = parseFile
//exports.transform = transform
//exports.compile = compile
exports.transpile = transpile
exports.watch = watch
exports.service = service