'use strict'
module: {fs} at: "npm:fs"
module: {jedi} at: "my:jedi"

exports: var __express = function(path, options, callback) {
	fs.readFile(path, 'utf-8', function(err, data) {
		if (err) callback(err)
		else {
			try {
				var runtime = jedi.JSRuntime()
				var source = data
				var jsSrc = jedi.compileToJS(source)
				var template = runtime.eval(jsSrc)
				var result = ''
				template.echo = function(s){
					result += s
				}
				template(options.model)
				callback(null, result)
			} catch(e) {
				e.message += jsSrc.replace(/&/g, '&amp;').replace(/</g, '&lt;')
				callback(e, jsSrc)
			}
		}
	})
}