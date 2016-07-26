import {createServer as httpServer} from 'http'
import {parse as parseURL} from 'url'
import {join as joinPath} from 'path'
import {stat} from 'fs'
import {transpile} from './index'

export default function service({base, lang, port}) {
	//var watched = []

	httpServer((req, res) => {

		if (req.method === 'GET') {
			let f = joinPath(base, parseURL(req.url).pathname)
			f = f.replace(/^\\\\([A-Z])\|/, '$1:')
			//if (watched.indexOf(path) >= 0)
			const send = (status, message) => {
				const s = message + ': ' + f + '\n'
				res.writeHead(status)
				res.end(s)
				if (status >= 400) console.error(s)
				else console.info(s)
			}

			stat(f, (err, stats) => {
				if (err) return send(404, err)
				if (!stats.isFile()) return send(404, 'path is not a file')

				const t0 = Date.now()
				try {
					lang.forEach(lang => transpile(f, f.replace(/\.jedi$/, '.' + lang), lang))
				} catch (e) {
					return send(403, 'jedi probably cannot access directory')
				}
				const t1 = Date.now()
				send(200, 'transpiled in ' + (t1 - t0) + 'ms')
			})

			//transpiler.watch(loc.pathname)
		} else {
			res.writeHead(405)
			res.end()
		}

	}).listen(port)

	process.on('uncaughtException', err => {
		console.error(new Date().toISOString(), 'uncaught exception:', err)
		console.trace(err)
	})

}
