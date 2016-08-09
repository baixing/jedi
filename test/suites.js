import {safeLoad} from 'js-yaml'
import {readFileSync} from 'fs'
import {join} from 'path'
const yaml = filename =>
	safeLoad(readFileSync(
		join(__dirname, filename + '.yaml')
	).toString())

import {testOMeta} from './test'


console.log('Testing offside rule...')
import {OffsideRule} from '../src/parse/offside'
testOMeta(OffsideRule, yaml('./offside').OffsideRule, [
	'skip',
	'tab',
	'block',
	'source',
])

console.log('Testing expression parser...')
import {Expression} from '../src/parse/expression'
testOMeta(Expression, yaml('./expression').Expression, [
	'symbol',
	'path',
	'literal',
	'quasiLiteral',
	'listLiteral',
	'tupleLiteral',
	'primary',
	'bindingPattern',
	'expression',
])

console.log('Testing jedi parser...')
import 'coffee-script/register'
import {Parser} from '../src/parse/parser'
import jediParserTests from './jedi'

testOMeta(Parser, jediParserTests.Parser, [
	'source',
	'text',
	'blocks',
	'element',
])


// transform tests


console.log('Testing php5 codegen...')
import {PHP5Transpiler} from '../src/codegen/transpiler.php5'
import transpilerPhpTests from './codegen-php5'
testOMeta(PHP5Transpiler, transpilerPhpTests.PHP5Transpiler, [
	'block',
	'document',
])
