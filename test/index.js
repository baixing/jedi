'use strict'

require('js-yaml')
require('coffee-script')
require('../lib/ometa-js')

var testOMeta = require('./test').testOMeta

var offside = require('../src/offside')
var offsideTests = require('./offside')
//util.dir(offsideTests.OffsideRule)
testOMeta(offside.OffsideRule, offsideTests.OffsideRule, [
	'skip', 'tab',
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

var jedi = require('../src/jedi')
var jediTests = require('./jedi')
testOMeta(jedi.Parser, jediTests.Parser, [
	'source'
	//'text',
	//'blocks',
	//element,
])

