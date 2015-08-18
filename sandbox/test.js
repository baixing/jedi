import {jediParser} from './jedi-parser'
import {jadeParser} from './jade-parser'

import {createReadStream} from 'fs'
import {join} from 'path'

function parseFile(filename, type) {
	if (type === undefined) {
		if (filename.slice(-5) === '.jade') type = 'jade'
		if (filename.slice(-5) === '.jedi') type = 'jedi'
	}
	let parser
	switch (type) {
		case 'jade': parser = jadeParser; break
		case 'jedi': parser = jediParser; break
		default: throw new Error('unknown type: ' + type)
	}
	var s = createReadStream(filename, {encoding: 'utf8'})

	s.once('data', () => console.time('parse'))
	s.on('end', () => console.timeEnd('parse'))

	s.on('data', source => parser.data(source))
	s.on('end', () => parser.end())
}

parseFile(__dirname + '/../examples/external.jedi')
//parseFile(__dirname + '/../../haojing/htdocs/view/wap/viewad_gongzuo.mobile.jedi')
