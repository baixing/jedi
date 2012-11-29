"use strict"

exports.Parser =
	source:
		'comment single line':
			input: '! comment line'
			expect: [
				['comment', [1, 1], ['comment line']]
			]
		'comment multiple lines':
			input: '''
				!	comment line 1
					comment line 2
			'''
			expect: [
				['comment', [1, 1], ['comment line 1', 'comment line 2']]
			]

		'suppress single line':
			input: '-- suppress line'
			expect: [
				['suppress', [1, 1], ['suppress line']]
			]
		'suppress multiple lines':
			input: '''
				--	suppress line 1
					suppress line 2
			'''
			expect: [
				['suppress', [1, 1], ['suppress line 1', 'suppress line 2']]
			]

		'inject line':
			input: '- inject line'
			expect: [
				['inject', [1, 1], 'inject line', null, []]
			]
		'inject line with block':
			input: '''
				- inject line
					! line 1
					! line 2
			'''
			expect: [
				['inject', [1, 1], 'inject line', null, [
					['comment', [2, 2], ['line 1']]
					['comment', [3, 2], ['line 2']]
				]]
			]

		'binding of a simple symbol':
			input: '= x'
			expect: [
				['binding', [1, 1], null, ['Symbol', 'x'], []]
			]
		'binding of a list':
			input: '= [1, 2, 3]'
			expect: [
				['binding', [1, 1], null,
					['List', [['Number', 1], ['Number', 2], ['Number', 3]]],
					[]
				]
			]

		'single quot text':
			input: """
				'Hello world!
			"""
			expect: [
				['text', [1, 1], undefined, ['Hello world!']]
			]
		'single quot text no escape/interpolation':
			input: """
				'Hello {user}!\\n
			"""
			expect: [
				['text', [1, 1], undefined, ['Hello {user}!\\n']]
			]
		'single quot multiple lines text ':
			input: """
				'	Hello world!
					foo bar baz
					rawr rawr
					super cool
			"""
			expect: [
				['text', [1, 1], undefined, ['Hello world!', 'foo bar baz', 'rawr rawr', 'super cool']]
			]
		'single quot text with single quot':
			input: """
				'	I'm ok!
			"""
			expect: [
				['text', [1, 1], undefined, ["I'm ok!"]]
			]

		'double quot text':
			input: '''
				"Hello world!
			'''
			expect: [
				['text', [1, 1], undefined, [
					[['String', 'Hello world!', 'Hello world!']]
				]]
			]
		'double quot text escape/interpolation':
			input: '''
				"Hello {user}!\\n
			'''
			expect: [
				['text', [1, 1], undefined, [
					[
						['String', 'Hello ', 'Hello ']
						['Symbol', 'user'],
						['String', '!\n', '!\\n']
					]
				]]
			]
		'double quot multiple lines text with tag':
			input: '''
				r"	Hello world!
					foo bar baz
					rawr rawr
					super cool
			'''
			expect: [
				['text', [1, 1], ['Symbol', 'r'],
					[
						[['String', 'Hello world!', 'Hello world!']]
						[['String', 'foo bar baz', 'foo bar baz']]
						[['String', 'rawr rawr', 'rawr rawr']]
						[['String', 'super cool', 'super cool']]
					]
				]
			]

		'element':
			input: '''
				div.test1
			'''
			expect: [
				['element', [1, 1], ['div', ['test1'], undefined], undefined, []]
			]
		'element with binding':
			input: '''
				div.test1 = x
			'''
			expect: [
				['element', [1, 1], ['div', ['test1'], undefined], ['Symbol', 'x'], []]
			]
		'nested element with binding':
			input: '''
				div.test1 > div.test2 = x
			'''
			expect: [
				['element', [1, 1], ['div', ['test1'], undefined], undefined, [
					['element', [1, 23], ['div', ['test2'], undefined], ['Symbol', 'x'], []]
				]]
			]
			###
			should be [1, 13]
			###

		'element with attributes in one line':
			input: "input @required @type='email'"
			expect: [
				['element', [1, 1], ['input', [], undefined], undefined, [

				]]
			]
