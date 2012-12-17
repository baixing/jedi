'use strict'

exports.testOMeta = testOMeta

var util = require('../src/util')

function heading(s, level) {
	var p = new Array((level || 2) + 1).join('=')
	console.log()
	console.log(p, s, p)
}

function testRule(grm, rule, testsuite, matchAll) {
	var total, ok = 0
	try {
		if (Array.isArray(testsuite)) {
			total = testsuite.length
			testsuite.forEach(doTest)
		} else {
			var names = Object.keys(testsuite)
			total = names.length
			names.forEach(function(name){
				doTest(testsuite[name])
			})
		}
	} finally {
		console.log(ok + '/' + total + ' tests passed.')
	}
	function doTest(testcase){
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
			var r = util.diff(actual, expect)
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
			if (util.diff(actual, input)) {
				console.log('input:', input)
				util.dir(actual)
				console.log()
			} else ok++
		}
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
