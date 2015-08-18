import {Parser} from 'tabish'

export let jadeParser = new Parser()

jadeParser.define({
	unbufferedCode: { flag: '-', recursive: true },
	bufferedCode: { flag: '=' },
	unsafeCode: { flag: '!=' },
	plainText: { flag: '<' },
	pipedText: { flag: '|' },
	comment: { flag: '//' },
	filter: { flag: ':' },
	element: { compact: [] },
	if: { keyword: 'if', recursive: true },
	else: { keyword: 'else', recursive: true },
	unless: { keyword: 'unless', recursive: true },
	case: { keyword: 'case', recursive: true, },
	when: { keyword: 'when', recursive: true, compact: true },
	default: { keyword: 'default', recursive: true },
	each: { keyword: ['each', 'for'], recursive: true },
	while: { keyword: 'while', recursive: true },
	include: { keyword: 'include' },
	extends: { keyword: 'extends' },
	block: { keyword: 'block', recursive: true },
	append: { keyword: 'append', recursive: true },
	prepend: { keyword: 'prepend', recursive: true },
	mixin: { keyword: 'mixin', recursive: true },
	useMixin: { flag: '+', recursive: true },
	doctype: { keyword: 'doctype' },
})
