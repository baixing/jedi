'use strict'

var Class = require('mmclass').Class

var Cache = Class({
	constructor: function () {
		this._cache = Object.create(null)
		this._stats = Object.create(null)
	},
	has: function (key) {
		if (!(key in this._cache)) return false
		if (!this.checkValidity(key)) {
			this.invalid(key)
			return false
		}
		return true
	},
	get: function (key) {
		if (this.has(key)) {
			this.stats(key).visits++
			return this._cache[key]
		} else return this.refresh(key)
	},
	set: function (key, value) {
		if (key in this._cache && this._cache[key] === value) return
		this._cache[key] = value
		this.stats(key).timestamp = Date.now()
	},
	stats: function (key) {
		if (!(key in this._stats)) {
			this._stats[key] = {timestamp: Date.now(), visits: 0}
		}
		return this._stats[key]
	},
	checkValidity: function (/*key*/) {
		return true
	},
	remove: function (key) {
		delete this._cache[key]
		delete this._stats[key]
	},
	invalid: function (key) {
		this._cache[key] = undefined
		this.stats(key).timestamp = Date.now()
	},
	refresh: function (/*key*/) {
		return undefined
	},
})

var fs = require('fs')

var FileCache = Class.extend(Cache)({
	lastModified: function (file) {
		return fs.statSync(file).mtime.getTime()
	},
	content: function (file) {
		return fs.readFileSync(file).toString()
	},
	checkValidity: function (key) {
		return fs.existsSync(key) &&
			this.lastModified(key) < this.stats(key).timestamp
	},
	refresh: function (key) {
		if (fs.existsSync(key)) {
			var value = this.content(key)
			this.set(key, value)
			return value
		} else {
			this.invalid()
			return undefined
		}
	},
})

exports.Cache = Cache
exports.FileCache = FileCache
