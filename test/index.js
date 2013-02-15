'use strict'

require('js-yaml')
require('coffee-script')
require('../lib/ometa-js')

var testOMeta = require('./test').testOMeta

var offside = require('../src/offside')
var offsideTests = require('./offside')
//util.dir(offsideTests.OffsideRule)
testOMeta(offside.OffsideRule, offsideTests.OffsideRule, [
	'skip',
	'tab',
	//'block',
	'source',
])

var expression = require('../src/expression')
var exprTests = require('./expression')
testOMeta(expression.Expression, exprTests.Expression, [
	'symbol',
	//'path',
	'literal',
	//'quasiLiteral',
	//'listLiteral',
	//'tupleLiteral',
	//'primary',
	'expression',
])

var parser = require('../src/parser')
var parserTests = require('./jedi')
testOMeta(parser.Parser, parserTests.Parser, [
	'source'
	//'text',
	//'blocks',
	//element,
])

var transformer = require('../src/transformer')
var transformerTests = require('./transformer')
testOMeta(transformer.InstructionsProcessor, transformerTests.InstructionsProcessor, [
	'document',
])

testOMeta(transformer.Sorter, transformerTests.Sorter, [
	'document',
])


var transpilerPhp = require('../src/transpiler.php5')
var transpilerPhpTests = require('./transpiler.php5')
testOMeta(transpilerPhp.PHP5Transpiler, transpilerPhpTests.PHP5Transpiler, [
	'block',
	'document'
])
