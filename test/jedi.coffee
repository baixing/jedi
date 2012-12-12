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
		'doctype':
			input: '!html5'
			expect: [
				[
					'comment',
					[1,1],
					['html5']
				]
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
		'binding of a tuple':
			input: "= ('hax', 18)"
			expect: [
				['binding', [ 1, 1 ], null,
					['Tuple', [['String', 'hax'], ['Number', 18]]],
					[]
				]
			]
			
		'binding of a named tuple':
		
			input: "= (name:'hax', age:18)"
			
			expect: [
				[
					'binding', 
					[ 1, 1 ], 
					null,
					[
						'Tuple', 
						[
							[
								'Mapping',
								['Symbol', 'name'],
								['String', 'hax']
							],
							[
								'Mapping',
								['Symbol', 'age'],
								['Number', 18]
							]
						]
					],
					[]
				]
			]
		'binding of a named tuple':
			input: "= (name:'hax', age:18)"

		'single quot text':
			input: """
				'Hello world!
			"""
			expect: [
				['text', [1, 1], undefined, ['Hello world!']]
			]
			
		'single quot text no escape/interpolation':
		
			input: '''
				'Hello {user}!\\n
			'''
			
			expect: [
				['text', [1, 1], undefined, ['Hello {user}!\\n']]
			]
			
		'single quot multiple lines text ':
		
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

		'if':
			input: '''
				:if x > y
					"{x} > {y}
			'''
			expect: [
				['instruction', [1, 1], 'if',
					['BinaryOp', '>', ['Symbol', 'x'], ['Symbol', 'y']]
					[
						['text', [2, 2], undefined, [
							[['Symbol', 'x'], ['String', ' > ', ' > '], ['Symbol', 'y']]
						]]
					]
				]
			]

		'iterate values':
			input: '''
				:for v in x
					"{v}
			'''
			expect: [
				['instruction', [1, 1], 'for',
					[['Symbol', 'v'], ['Symbol', 'x']]
					[['text', [2, 2], undefined, [
						[['Symbol', 'v']]
					]]]
				]
			]

		'iterate key, value pairs':
			input: '''
				:for (key, value) in x
					"{key} = {value}"
			'''
			expect: [
				[
					'instruction',
					[1,1],
					'for',
					[
						[
							'TuplePattern',
							[
								['Symbol', 'key'],
								['Symbol', 'value']
							]
						],
						['Symbol', 'x']
					],
					[
						[
							'text', 
							[2, 2], 
							undefined,
							[
								[
									['Symbol', 'key'],
									['String', ' = ', ' = '],
									['Symbol', 'value'],
									['String', '"', '"']
								]
							]
						]
					]
				]
			]

		'multiple for':
			input: '''
				:for x in list1, y in list2
					"{x}, {y}
			'''

		'let binding':
			input: '''
				:let x = 1, y = 2
					"{x}, {y}
			'''
		'let binding with pattern match':
			input: '''
				:let (x, y) = (1, 2)
					"{x}, {y}
			'''
		'let binding with named pattern match':
			input: '''
				:let (name:haxName, age) = (name:"hax", age:18)
					"{haxName}, {age}
			'''

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
		'nested elements with binding':
			input: '''
				div.test1 > div.test2 = x
			'''
			expect: [
				['element', [1, 1], ['div', ['test1'], undefined], undefined, [
					['element', [1, 23], ['div', ['test2'], undefined], ['Symbol', 'x'], []]
				]]
			]
			# should be [1, 13]

		'element with attributes in one line':
			input: "input @required @type='email'"
			expect: [
				['element', [1, 1], ['input', [], undefined], undefined, [
					['attribute', [1, 19], 'required', undefined]
					['attribute', [1, 19], 'type', '=', ['String', 'email']]
				]]
			]
			# should be [1, 7] and [1, 17]

		'nested elements with attribute':
			input: "li > a @href=url"
			expect: [
				['element', [1, 1], ['li', [], undefined], undefined, [
					['element', [1, 9], ['a', [], undefined], undefined, [
						['attribute', [1, 13], 'href', '=', ['Symbol', 'url']]
					]]
				]]
			]
			# should be [1, 6], [1, 8]

