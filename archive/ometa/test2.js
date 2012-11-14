

//console.log(Object.keys(ometa.globals))
//require('./jedi2')

//ometa.translateCode('')

var fs = require('fs')

var code = fs.readFileSync('./jedi2.ometajs', 'utf-8')

var code = require('./api.js').translateCode(code)

var util = require('./util')

function test(ometa, input, rule, args) {
	console.log(
		util.inspect(util.flattenStrings(ometa.matchAll(input, rule, args)), false, 10, true)
	)
}

function toUTF16(codePoint) {
	if (codePoint < 0x10000) return String.fromCharCode(codePoint)
	codePoint -= 0x10000
	var lead = (codePoint >> 10) + 0xd800
	var trail = (codePoint & 0x3ff) + 0xdc00
	return String.fromCharCode(lead, trail)
}

eval(code)
