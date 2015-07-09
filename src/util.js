'use strict'

var util = require('util')
var ometa = require('../lib/ometa-js')

//module from http://www.w3.org/TR/html5/entities.json
var entities = require('./entities')

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
	throw Error(a + ' is not a string')
}
util.concat = function() {
	return [].concat.apply([], arguments)
}

util.flattenString = function flatten(a) {
	if (!util.isArray(a)) return a
	if (a.every(util.isChar)) return a.join('')
	else return a.map(flatten)
}
util.flattenArray = function flatten(a, rec) {
	if (!util.isArray(a)) throw Error(a + ' is not an array')
	return [].concat.apply([], rec ? a.map(flatten) : a)
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
	console.log(util.inspect(obj, false, 32, true))
	//console.log(util.inspect(util.flattenString(obj), false, 32, true))
}

util.toUTF16 = function toUTF16(codePoint) {
	if (codePoint < 0x10000) return String.fromCharCode(codePoint)
	codePoint -= 0x10000
	var lead = (codePoint >> 10) + 0xd800
	var trail = (codePoint & 0x3ff) + 0xdc00
	return String.fromCharCode(lead, trail)
}

util.diff = function diff(a, b) {
	if (a === b) return
	if (typeof b === 'function') return a instanceof b
	if (Array.isArray(a)) {
		if (a.length !== b.length) return [a, b, 'length', a.length, b.length]
		for (var i = 0; i < a.length; i++) {
			var r = diff(a[i], b[i])
			if (r) return r
		}
		return
	}
	return [a, b]
}

util.namedCharRef = function (entity) {
	if (entity in entities) return entities[entity].characters
	else throw ometa.fail
}
