import {dir, diff} from '../src/util/debug'

const heading = (s, level = 2) => {
	const p = '='.repeat(level)
	console.log()
	console.log(p, s, p)
}

function testRule(grm, rule, testsuite, matchAll) {
	var total, ok = 0, skip = 0
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
		var summary = ok + '/' + total + ' tests passed'
		if (skip) summary += ', ' + skip + ' tests skipped'
		console.log(summary)
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
			var r = diff(actual, expect)
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

export function testOMeta(grm, testsuites, rules) {
	rules.forEach(function(rule){
		var tested, suiteName

		suiteName = rule
		if (suiteName in testsuites) {
			heading(suiteName)
			testRule(grm, rule, testsuites[suiteName], false)
			tested = true
		}
		suiteName = '[' + rule + ']'
		if (suiteName in testsuites) {
			heading(suiteName)
			testRule(grm, rule, testsuites[suiteName], true)
			tested = true
		}

		if (!tested) heading('no testsuite for ' + rule)
	})
	console.log()
}
