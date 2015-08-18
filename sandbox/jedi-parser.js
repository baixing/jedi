import Debug from 'debug'
const debug = Debug('jedi-parser')

import {inspect} from 'util'

import ometa from '../lib/ometa-js'

import {Parser as TabishParser, TextCursor} from 'tabish'
import {Parser as JediParser} from './parser'
//const JediParser = require('./parser').Parser

export let jediParser = new TabishParser()


function omMatch(omClass, omRule, textCursor) {
	const input = ometa.makeListOMInputStream(textCursor.data, textCursor.offset)
	try {
		const result = omClass._genericMatch(input, omRule)
		textCursor.offset = input.memo[omRule].nextInput.idx
		return result
	} catch (e) {
		if (e !== ometa.fail) console.error(e)
	}
}

jediParser.define({
	suppress: {
		flag: '--'
	},
	inject: {
		flag: '-',
		recursive: true,
	},
	instruction: {
		flag: ':',
		recursive: true,
	},
	comment: {
		flag: '!'
	},
	text: {
		flag: ['"', "'", '\u2018', '\u201c']
	},
	binding: {
		flag: '=',
		recursive: true,
	},
	element: {
		recursive: true,
		compact: ['comment', 'text'],
		parseType(textCursor) {
			return omMatch(JediParser, 'elementPattern', textCursor)
			// const m = textCursor.match(/^[a-z0-9]([a-z0-9_-]|\\.)*/i)
			// if (m) return {tagName: m[0]}
			// else return undefined
		},
		parseValue(textCursor) {
			//this._startNode
		}
	},
	attribute: {
		flag: '@',
		parseType(textCursor) {
			// const m = textCursor.match(/^[a-z0-9]([a-z0-9_-]|\\.)*/i)
			// if (m) return {tagName: m[0]}
			// else return undefined
		}
	},
	macro: {
		flag: '::',
		recursive: true,
		parse(textCursor) {
			return omMatch(JediParser, 'macroPattern', textCursor)
		}
	},
	fragment: {
		flag: '#',
		recursive: true,
	},
})
