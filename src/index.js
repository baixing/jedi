/* Jedi public API */
import {parseFile} from './parse'
import transform from './transform'
import {compile} from './codegen'
import errorInfo from './util/error-info'
import * as fs from 'fs'

export function transpile(source, dest, lang, {adaptive, debug, writeErrorToFile = true} = {}) {
	const outputs = []
	try {
		const config = loadConfig(source)
		const tree = transform(parseFile(source), debug)
		if (!lang) return
		if (lang === 'json') {
			fs.writeFileSync(dest, JSON.stringify(tree, null, 2))
			return
		}
		if (adaptive || config.adaptive) {
			tree[4].unshift(['comment', [source, 0, 1], ['html']])
			outputs.push({file: dest, content: compile(tree, lang)})
			tree[4][0][2] = ['xhtml mp 1.0']
			const wapDest = dest.replace(/(?=\.[^.]+$)/, '.wap')
			outputs.push({file: wapDest, content: compile(tree, lang)})
		} else {
			outputs.push({file: dest, content: compile(tree, lang)})
		}
	} catch (e) {
		errorInfo(e, source).forEach(args => console.error(...args))
		if (writeErrorToFile) outputs.push({file: dest, content: outputCompilingError(e, source, lang)})
		else throw e
	}
	for (const {file, content} of outputs) fs.writeFileSync(file, content)
}


import * as path from 'path'
import {safeLoad} from 'js-yaml'

const loadConfig = source => {
	const configPath = path.dirname(source) + path.sep + 'jedi'
	let configFile = configPath + '.json'
	if (fs.existsSync(configFile)) {
		try {
			return JSON.parse(fs.readFileSync(configFile).toString())
		} catch(e) {
			console.error('Bad JSON format: ' + configFile)
			console.error(e)
		}
	}
	configFile = configPath + '.yaml'
	if (fs.existsSync(configFile)) {
		try {
			return safeLoad(fs.readFileSync(configFile).toString())
		} catch(e) {
			console.error('Bad YAML format: ' + configFile)
			console.error(e)
		}
	}
	return {}
}


const outputCompilingError = (e, source, lang) => {
	if (lang !== 'php') throw new Error(lang + ' is not supported')
	return '<pre>'
		+ errorInfo(e, source).map(function (args) {
			return args.join(' ').replace(/&/g, '&amp;').replace(/</g, '&lt;')
		}).join('\n')
		+ '\n</pre>'
}


export const watch = (source, ...args) => {
	//TODO: watch dependencies
	transpile(source, ...args)
	fs.watch(source, (/*evt, filename*/) => {
		transpile(source, ...args)
	})
}
