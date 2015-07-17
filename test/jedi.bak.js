'use strict'

exports.Text = {
	source:
		/*require('fs').readFileSync(require.resolve('./jedi.txt')).
			toString().split(/(?:^|\r?\n)\r?\n?={4}.*\r?\n?(?:\r?\n|$)/),*/
		[
		],
	block: [
		[],
		[''],

		['!5'],
		['!doctype 5'],

		['-- suppress'],
		['-- suppress', '', '// ignore'],
		['--', '', '\tcomment line 1', '\tcomment line 2'],

		['- inject'],
		['- inject', '', '\tinject line 1', '\t inject line 2'],

		['= x'],
		['= (x, y, z)'],
		//['= x use (a1, a2)'],
		['= x'],
		['= x', '\tp = (a > b) > (c > (d > e)) > f', '\tp = a'],

		[':if x > y', '\t"{x} > {y}'],

		['\'Hello!\''],
		['"Hello!"'],
		['"I\'m ok"', '// ok'],
		['\'Hello world!'],
		['\'Hello {user}!'],
		[
			'\'Hello world!',
			'	foo bar baz',
			'	rawr rawr',
			'	super cool',
		],
		['"Hello world!'],
		['"Hello {user}!'],
		['‘欢迎{user}!'],
		['“欢迎{user}!'],

		[
			'\'Hello world!',
			'r"Hello world!',
			'	Hello world!',
			'\t// test',
		],
		[
			'r"Hello world!',
			'	foo bar baz',
			'	rawr rawr',
			'	super cool',
		],

		['div.test1'],
		['div.test1 = x'],

		['@required'],
		['@name = "user"'],
		['@class += ["ca", "cb"]'],
		['@class += a + ', '\t b + c'],

		['#here'],
		['#here = a', '\tp'],
	],
	templateString: [
	],
	templateStrings: [
		[[
			'',
			'a: {a}',
			'{a} > {b} -> {a > b}',
			'{(a > b)}',
			'{a > b > c}',
			'{(a > b) > c}',
			'{a > (b > c)}',
		]],
	],
	text: [
		['"Hello!"', [], null],
		['"Hello {user}!', [], null],
		['"Hello {user}!', [
			'',
			'a: {a}',
			'{a} > {b} -> {a > b}',
			'{(a > b)}',
			'{a > b > c}',
			'{(a > b) > c}',
			'{a > (b > c)}',
		], null],
	],
	/*],
	[
		'\' Hello!', ['How are you?', 'Fine, thank you!']
	]],

	[
		'"Hello {user}!"', []
	]],
	[
		'"Hello {user}!', []
	]],
	[
		'"Hello \\{user}!"', []
	]],
	[
		'"Hello {user}!', ['How are you, {user}?', 'Fine, thank you!']
	]],

var elementTests = [
	['tagName', 'div'],
	['tagName', 'DIV'],
	['tagName', 'html:div'],
	['tagName', 'test-tag'],
	['classList', '.current.note'],
	['id', '#test'],

	['doctype', ['!5', []]],
	['element', ['div', []]],
	['element', ['div.test1.test2#div1', []]],
	['elementBlock', [['Block', 'ul = list', [
		'li = a',
		'\t"a',
		'li',
		'\t"b',
		'li',
		'\t"c',
	]]]],
]

var jediTests = [

	['document', [
		['Ignore'],
		['Ignore', 'test'],
		['Block', '-- Notes:', []]
	]],
	['document', [
		['Block', '!5', []],
		['Block', '-- Notes:', []]
	]],
	['document', [
		['Ignore', 'test'],
		['Block', '!5', []],
		['Block', 'html#page', [
			['Ignore'],
			['Block', 'head', []],
			['Block', 'body', []],
		]]
	]],

]

	*/
}
