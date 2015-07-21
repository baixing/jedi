/* Jedi public API */

'use strict'

require('source-map-support').install()
require('babel/polyfill')
require('../lib/ometa-js')

var Parser = require('./parser').Parser
var transform = require('./transform')
var transpiler = {
	php5: require('./transpiler.php5').PHP5TranspilerWithDebug,
	php5b: require('./transpiler.php5').Beautify,
	es5: require('./transpiler.es5').ES5Transpiler,
}

var fs = require('fs'), path = require('path')
var http = require('http'), url = require('url')
var crypto = require('crypto')

var Cache = require('./Cache').Cache
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
			var code = transpiler.php5.match(ast, 'document')
			//code = transpiler.php5b.match(code, 'document')
			code = alignEchosAndComments(code)
			console.timeEnd('compile php')
			return code
		case 'es5': case 'ecmascript':
		case 'js': case 'javascript':
			return transpiler.es5.match(ast, 'document')
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
		if (e.position) {
			var filename = e.position[0] === '*' ? source : e.position[0]
			var errorType = e.message === 'Section' ? 'SyntaxError' : e.message
			console.log()
			console.error('Syntax error:', e.position[0] === '*' ? 'I guest it may be ' + filename + ' , but not sure...' : filename)
			console.log()
			var lines = fs.readFileSync(filename).toString().split(/\r?\n/)
			var startLine = Math.max(e.position[1] - 8, 0),
				endLine = Math.min(e.position[1] + 7, lines.length)

			var showLines = lines.slice(startLine, endLine).map(function (line, i) {
				return (startLine + i + 1) + ' | ' + line.replace(/\t/g, '    ')
			})
			var spaces = new Array(e.position[2] + 3 + String(e.position[1]).length).join(' ')
			showLines.splice(e.position[1] - startLine, 0,
				spaces + '^',
				spaces + '|__ Ooops, ' + errorType + ' at line ' + e.position[1] + ', column ' + e.position[2],
				spaces)

			showLines.forEach(function (l) {
				console.log(l)
			})
		} else {
			var info = e.stack || e.message || e
			console.error(String(info))
		}
		fs.writeFileSync(dest, outputCompileingError(e, lang))
	}
}

function outputCompileingError(e, lang) {
	if (lang !== 'php') throw new Error(lang + ' is not supported')
	var info = e.stack || e.message || e
	return String(info)
}

function watch(source, dest, lang, adaptive, debug) {
	//TODO: watch dependencies
	transpile(source, dest, lang, adaptive, debug)
	fs.watch(source, function(/*evt, filename*/) {
		transpile(source, dest, lang, adaptive, debug)
	})
}

function service(options) {
	//var watched = []

	http.createServer(function (req, res) {

		switch (req.method) {
			case 'GET':
				//console.log(req.url)
				var p = url.parse(req.url).path
				//console.log(options.base, p)
				var f = path.join(options.base, p)
				f = f.replace(/^\\\\([A-Z])\|/, '$1:')
				//if (watched.indexOf(path) >= 0)

				fs.exists(f, function(exists){
					if (!exists) {
						send(404, 'file not exist')
					} else {
						fs.stat(f, function(err, stats){
							if (err) throw err // should never happen
							if (stats.isFile()) {
								var t0 = Date.now()
								options.lang.forEach(function(lang){
									transpile(f, f.replace(/\.jedi$/, '.' + lang), lang)
								})
								var t1 = Date.now()
								send(200, 'transpiled in ' + (t1 - t0) + 'ms')
							} else {
								send(404, 'path is not a file')
							}
						})
					}

					function send(status, message){
						res.writeHead(status)
						res.end(message + ': ' + f + '\n')
						if (status >= 400) {
							console.error(message + ': ' + f)
						} else {
							console.info(message + ': ' + f)
						}
					}
				})

				//transpiler.watch(loc.pathname)
				break
			default:
				res.writeHead(405)
				res.end()
		}

	}).listen(options.port)

	process.on('uncaughtException', function(err){
		console.error(new Date().toISOString(), 'uncaught exception:', err)
		console.trace(err)
	})

}

exports.parseFile = parseFile
//exports.transform = transform
//exports.compile = compile
exports.transpile = transpile
exports.watch = watch
exports.service = service
