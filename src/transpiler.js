'use strict'

var ometajs = require('./ometajs')
var fs = require('fs')
var util = require('./util')

var jedi = require('./jedi')
var php = require('./transpiler.php5')

var LineSep = /\r\n|\n\r?|\r|\u2028|\u2029/

function transpile(source, target) {
	//var lines = source.split(LineSep)
	var tree = jedi.Parser.match(source, 'source')
	tree = jedi.Optimizer.match(tree, 'source')
	util.dir(tree)

	return php.PHP5Transpiler.match(tree, 'php')
}

function jedi2php(path) {
	var source = fs.readFileSync(path).toString()
	var code = transpile(source, 'php')
	//console.log(code)
	return code
}
function watch(path) {
	console.log(path)
	fs.watch(path, function(evt, filename) {
		var phpTarget = path.replace(/\.jedi$/, '.php')
		//console.log(filename, phpTarget)
		try {
			fs.writeFileSync(phpTarget, jedi2php(path))
		} catch(e) {
			fs.writeFileSync(phpTarget, e.stack || e.message || e)
		}
	})
}

exports.transpile = transpile
exports.jedi2php = jedi2php
exports.watch = watch