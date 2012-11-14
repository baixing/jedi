'use strict'
var util = require('util')

module.exports = util = Object.create(util)

util.isChar = function isChar(c) {
	return typeof c === 'string' && c.length === 1
}
util.isCharArray = function(a) {
	return util.isArray(a) && a.every(util.isChar)
}
util.string = function (a) {
	if (util.isCharArray(a)) return a.join('')
	if (typeof a === 'string') return a
	throw a
}

util.flattenString = function flatten(a) {
	if (!util.isArray(a)) return a
	if (a.every(util.isChar)) return a.join('')
	else return a.map(flatten)
}
util.flattenArray = function flatten(a) {
	if (!util.isArray(a)) return a
	return [].concat.apply([], a.map(flatten))
}
util.flattenLines = function flattenLines(lines, indent) {
	if (indent === undefined) indent = ''
	return lines.reduce(function(xs, x) {
		if (util.isArray(x)) xs.push.apply(xs, flattenLines(x, indent + ' '))
		else xs.push(indent + x)
		return xs
	}, [])
}

util.indent = function indent(s) {
	return typeof s === 'string' ? '  ' + s : s
}
util.dir = function dir(obj) {
	//console.log(util.inspect(obj, false, 16, true))
	console.log(util.inspect(util.flattenString(obj), false, 32, true))
}

util.toUTF16 = function toUTF16(codePoint) {
	if (codePoint < 0x10000) return String.fromCharCode(codePoint)
	codePoint -= 0x10000
	var lead = (codePoint >> 10) + 0xd800
	var trail = (codePoint & 0x3ff) + 0xdc00
	return String.fromCharCode(lead, trail)
}
