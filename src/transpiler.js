'use strict'

var ometajs = require('../lib/ometa-js')
var fs = require('fs')
var util = require('./util')

var jedi = require('./jedi')
var php = require('./transpiler.php5')

var LineSep = /\r\n|\n\r?|\r|\u2028|\u2029/

function transpile(source, target) {
}

function jedi2php(path) {
	//var source = fs.readFileSync(path).toString()
	var tree = jedi.Parser.match(path, 'load')
	util.dir(tree)
	tree = jedi.InstructionsProcessor.match(tree, 'document')
	util.dir(tree)
	tree = jedi.Sorter.match(tree, 'document')
	tree = jedi.TemplateMatcher.match(tree, 'document')
	//util.dir(tree)

	var code = php.PHP5Transpiler.match(tree, 'document')
	return code
}

function compile(source, target) {
	try {
		fs.writeFileSync(target, jedi2php(source))
	} catch(e) {
		console.error(e)
		fs.writeFileSync(target, e.stack || e.message || e)
	}
}

function watch(source, target) {
	compile(source, target)
	fs.watch(source, function(evt, filename) {
		compile(source, target)
	})
}

exports.transpile = transpile
exports.jedi2php = jedi2php

exports.compile = compile
exports.watch = watch