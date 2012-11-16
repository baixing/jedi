'use strict'

var vm = require('vm'), fs = require('fs'), path = require('path')

var filename = require.resolve('../lib/ometa-js/all')
var mtime = Math.max(fs.statSync(filename).mtime, fs.statSync(__filename).mtime)

var context = vm.createContext()
var code = fs.readFileSync(filename).toString()
vm.runInContext(code, context, filename)

module.exports = context

require.extensions['.ometajs'] = function(module, filename) {
	var code, temp = filename.slice(0, -2) + '.js'
	if (fs.existsSync(temp) && fs.statSync(temp).mtime.getTime() + 1000 >= Math.max(fs.statSync(filename).mtime, mtime)) {
		code = fs.readFileSync(temp).toString()
	} else {
		console.log('recompile', filename)
		code = fs.readFileSync(filename).toString()
		code = context.translateCode(code)
		code = wrapModule(temp, code)
		fs.writeFileSync(temp, code)
	}
	//console.log(code)
	module._compile(code, filename)
}

function wrapModule(filename, code) {
	var dpProcs = [
		{
			re: /^module\s+(.*?)\s+at\s+(.*)/,
			tr: function(m) {
				return 'var ' + m[1] + ' = ' + 'require(' + m[2] + ')'
			}
		},
		{
			re: /^import\s+(.*?)\s+from\s+(.*)/,
			tr: function(m) {
				return 'void function(m){' +
					'Object.defineProperties(imports, {' +
						m[1].replace(/([^,]+)/g, '$1:{get:function(){return m.$1}}') +
					'})' +
				'}(require(' + m[2] + '))'
			}
		},
		{
			re: /^export\s+(.*)/,
			tr: function(m) {
				return 'Object.defineProperties(exports, {' +
					m[1].replace(/([^,]+)/g, '$1:{get:function(){return $1}}') +
				'})'
			}
		}
	]
	//TODO: refactor this file to ometajs lib
	var ometajsPath = './' + path.relative(filename + '/..', __filename)
	var targetCode = [
		'var ometajs = require(' + JSON.stringify(ometajsPath) + ')',
		'var OMeta = ometajs.OMeta',
		'var fail = ometajs.fail',
		'var objectThatDelegatesTo = ometajs.objectThatDelegatesTo',
		'var imports = Object.create(null)',
		'with (imports) {',
			'void function(){',
				'"use strict"',
	]
	//assert(code[0] === '{')
	var re = /^"(.*?)";/, offset = 1, m
	while (m = re.exec(code.slice(offset))) {
		var s = m[1].replace(/\\'/g, "'")
		for (var i = 0; i < dpProcs.length; i++) {
			var dpm = dpProcs[i].re.exec(s)
			if (dpm) {
				targetCode.push(dpProcs[i].tr(dpm))
				break
			}
		}
		offset += m[0].length
	}
	targetCode.push(
				code,
			'}()',
		'}'
	)
	return targetCode.join('\n')
}
