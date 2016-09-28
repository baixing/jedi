import {dir, diff} from '../src/util/debug'

const heading = (s, level = 2) => {
	const p = '='.repeat(level)
	console.log()
	console.log(p, s, p)
}

function testRule(grm, rule, testsuite, options, matchAll) {
	let total, ok = 0, skip = 0
	try {
		if (Array.isArray(testsuite)) {
			total = testsuite.length
			testsuite.forEach(test => doTest(test, options))
		} else {
			const names = Object.keys(testsuite)
			total = names.length
			names.forEach(function(name){
				doTest(testsuite[name], options)
			})
		}
	} finally {
		let summary = ok + '/' + total + ' tests passed'
		if (skip) summary += ', ' + skip + ' tests skipped'
		console.log(summary)
	}
	function doTest(testcase, {inputFilter} = {}){
		let input, expect, actual
		if (typeof testcase === 'object' && 'input' in testcase) {
			input = testcase.input
			expect = testcase.expect
		} else {
			input = testcase
		}
		if (inputFilter) input = inputFilter(input)
		try {
			actual = matchAll ?
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
			let r
			if (expect.constructor === RegExp) {
				r = expect.test(actual) ? null : 'unmatch'
			} else {
				r = diff(actual, expect)
			}
			if (r) {
				console.error('input:')
				console.log(input)
				console.error('expect:')
				dir(expect)
				console.error('actual:')
				dir(actual)
				console.log('diff:')
				dir(r)
				console.assert(false)
			} else ok++
		} else {
			if (diff(actual, input)) {
				console.log('input:', input)
				console.log('output:')
				dir(actual)
				console.log()
				skip++
			} else ok++
		}
	}
}

export function testOMeta(grm, testsuites, rules, options) {
	rules.forEach(function(rule){
		let tested, suiteName

		suiteName = rule
		if (suiteName in testsuites) {
			heading(suiteName)
			testRule(grm, rule, testsuites[suiteName], options, false)
			tested = true
		}
		suiteName = '[' + rule + ']'
		if (suiteName in testsuites) {
			heading(suiteName)
			testRule(grm, rule, testsuites[suiteName], options, true)
			tested = true
		}

		if (!tested) heading('no testsuite for ' + rule)
	})
	console.log()
}
