'use strict'

var ometajs = require('../lib/ometa-js')
var fs = require('fs')
var util = require('./util')

var parser = require('./jedi')
var transformer = require('./transformer')
var transpiler = require('./transpiler.php5')

var LineSep = /\r\n|\n\r?|\r|\u2028|\u2029/

function transpile(source, target) {
}

function jedi2php(path) {
	//var source = fs.readFileSync(path).toString()
	var tree = parser.Parser.match(path, 'load')
	console.log('ast:')
	util.dir(tree)
	tree = transformer.InstructionsProcessor.match(tree, 'document')
	console.log('transformed:')
	util.dir(tree)
	tree = transformer.TemplateMatcher.match(tree, 'document')
	console.log('transformed:')
	util.dir(tree)
	tree = transformer.Sorter.match(tree, 'document')
	util.dir(tree)

	var code = transpiler.PHP5Transpiler.match(tree, 'document')
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

exports.transpile = transpile
exports.jedi2php = jedi2php

exports.compile = compile
exports.watch = watch