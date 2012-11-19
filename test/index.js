'use strict'

require('js-yaml')
require('../lib/ometa-js')

var util = require('../src/util')
var offside = require('../src/offside')
var expression = require('../src/expression')
var jedi = require('../src/jedi')

function diff(a, b) {
	if (a === b) return
	if (Array.isArray(a)) {
		if (a.length !== b.length) return [a, b, 'length']
		for (var i = 0; i < a.length; i++) {
			var r = diff(a[i], b[i])
			if (r) return r
		}
		return
	}
	return [a, b]
}

function heading(s, level) {
	var p = new Array((level || 2) + 1).join('=')
	console.log()
	console.log(p, s, p)
}

function testRule(grm, rule, testsuite, matchAll) {
	var ok = 0
	try {
		testsuite.forEach(function(testcase){
			var input, expect
			if (typeof testcase === 'object' && 'input' in testcase) {
				input = testcase.input
				expect = testcase.expect
			} else {
				input = testcase
			}
			try {
				var actual = matchAll ?
					grm.matchAll(input, rule) :
					grm.match(input, rule)
			} catch(e) {
				console.error(
					matchAll ? 'matchAll' : 'match',
					'failed:',
					rule)
				console.log(input)
				throw e
			}
			if (expect) {
				var r = diff(actual, expect)
				if (r) {
					console.error('input:')
					console.log(input)
					console.error('expect:')
					util.dir(expect)
					console.error('actual:')
					util.dir(actual)
					console.log('diff:')
					util.dir(r)
					console.assert(false)
				} else ok++
			} else {
				if (diff(actual, input)) {
					console.log('input:', input)
					util.dir(actual)
					console.log()
				} else ok++
			}
		})
	} finally {
		console.log(ok + '/' + testsuite.length + ' tests passed.')
	}
}

function testOMeta(grm, testsuites, rules) {
	rules.forEach(function(rule){
		var tested
		var suiteName = rule
		if (suiteName in testsuites) {
			heading(suiteName)
			testRule(grm, rule, testsuites[suiteName], false)
			tested = true
		}
		var suiteName = '[' + rule + ']'
		if (suiteName in testsuites) {
			heading(suiteName)
			testRule(grm, rule, testsuites[suiteName], true)
			tested = true
		}
		if (!tested) heading('no testsuite for ' + rule)
	})
	console.log()
}

var offsideTests = require('./offside')
//util.dir(offsideTests.OffsideRule)
testOMeta(offside.OffsideRule, offsideTests.OffsideRule, [
	'skip', 'tab',
	//'block',
	'source',
])

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

var jediTests = require('./jedi')
testOMeta(jedi.Parser, jediTests.Text, [
	'source'
	//'text',
	//'blocks',
	//element,
])

