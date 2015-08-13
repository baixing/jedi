var http = require('http'), url = require('url')
import {transpile} from '.'

export function service(options) {
	//var watched = []

	http.createServer(function (req, res) {

		switch (req.method) {
			case 'GET':
				//console.log(req.url)
				var p = url.parse(req.url).path
				//console.log(options.base, p)
				var f = path.join(options.base, p)
				f = f.replace(/^\\\\([A-Z])\|/, '$1:')
				//if (watched.indexOf(path) >= 0)

				fs.exists(f, function(exists){
					if (!exists) {
						send(404, 'file not exist')
					} else {
						fs.stat(f, function(err, stats){
							if (err) throw err // should never happen
							if (stats.isFile()) {
								var t0 = Date.now()
								options.lang.forEach(function(lang){
									transpile(f, f.replace(/\.jedi$/, '.' + lang), lang)
								})
								var t1 = Date.now()
								send(200, 'transpiled in ' + (t1 - t0) + 'ms')
							} else {
								send(404, 'path is not a file')
							}
						})
					}

					function send(status, message){
						res.writeHead(status)
						res.end(message + ': ' + f + '\n')
						if (status >= 400) {
							console.error(message + ': ' + f)
							console.error()
						} else {
							console.info(message + ': ' + f)
							console.info()
						}
					}
				})

				//transpiler.watch(loc.pathname)
				break
			default:
				res.writeHead(405)
				res.end()
		}

	}).listen(options.port)

	process.on('uncaughtException', function(err){
		console.error(new Date().toISOString(), 'uncaught exception:', err)
		console.trace(err)
	})

}
