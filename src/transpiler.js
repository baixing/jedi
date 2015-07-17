'use strict'

/*
var fs = require('fs'), path = require('path')
var http = require('http'), url = require('url')

var ometajs = require('../lib/ometa-js')
var util = require('./util')

var parser = require('./parser')
var transformer = require('./transformer')
var transpiler = require('./transpiler.php5')

var LineSep = /\r\n|\n\r?|\r|\u2028|\u2029/

function transpile(source, target) {
}

function jedi2php(path) {
	//var source = fs.readFileSync(path).toString()
	var tree1 = parser.Parser.match(path, 'load')
	var tree2 = transformer.InstructionsProcessor.match(tree1, 'document')
	var tree3 = transformer.TemplateMatcher.match(tree2, 'document')
	var tree4 = transformer.Sorter.match(tree3, 'document')
	//util.dir(util.diff(tree1, tree3))
	//util.dir(tree4)

	var originalCode = transpiler.PHP5Transpiler.match(tree4, 'document')
	var code = transpiler.Beautify.match(originalCode, 'document')
	return code
}

function compile(source, target) {
	try {
		fs.writeFileSync(target, jedi2php(source))
	} catch(e) {
		var info = e.stack || e.message || e
		console.error(info)
		fs.writeFileSync(target, info)
	}
}

function watch(source, target) {
	compile(source, target)
	fs.watch(source, function(evt, filename) {
		compile(source, target)
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
						compile(f, f.replace(/(.jedi)$/, '.php'))
						res.writeHead(200)
						res.end('compiled ok\n')
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

exports.transpile = transpile
exports.jedi2php = jedi2php

exports.compile = compile
exports.watch = watch
exports.service = service
*/
