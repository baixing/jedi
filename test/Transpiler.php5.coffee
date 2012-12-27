"use strict"

exports.PHP5Transpiler =

	block:

		'external':
			input: [[
				'instruction',
				[ 1, 1 ],
				'external',
				[[ 'Symbol', 'graph' ], [ 'Symbol', 'Category' ], [ 'Symbol', 'Seo' ], [ 'Symbol', 'array_slice' ]],
				[]
			]]


		'comment single line':
			input: [
				['comment', [1, 1], ['comment line']]
			]

			expect: [['echo \'<!-- comment line -->\';']]

		'comment multiple lines':
			input: [
				['comment', [1, 1], ['comment line 1', 'comment line 2']]
			]

			expect: [[
				'echo \'<!--\', "\\n";',
				'echo \'comment line 1\', "\\n";',
				'echo \'comment line 2\', "\\n";',
				'echo \'-->\';'
			]]

		'doctype':
			input: [[
				'comment',
				[1,1],
				['html5']
			]]

			expect: [['echo \'<!-- html5 -->\';']]

		'suppress single line':
			input: [
				['suppress', [1, 1], ['suppress line']]
			]

			expect: [['// suppress line']]

		'suppress multiple lines':
			input: [
				['suppress', [1, 1], ['suppress line 1', 'suppress line 2']]
			]

			expect: [[
				'// suppress line 1',
				'// suppress line 2',
			]]

		'inject line':
			input: [
				['inject', [1, 1], 'inject line', null, []]
			]

			expect: [[
				'inject line;'
			]]

		'inject line with block':
			input: [
				['inject', [1, 1], 'inject line', null, [
					['comment', [2, 2], ['line 1']]
					['comment', [3, 2], ['line 2']]
				]]
			]

			expect: [[
				'inject line',
				'{',
				[
					['echo \'<!-- line 1 -->\';'],
					['echo \'<!-- line 2 -->\';'],
				],
				'}'
			]]

		'binding of a simple symbol':
			input: [[
				'binding', [1, 1], null, ['Symbol', 'x'], []
			]]

			expect: [['echo htmlspecialchars($data->x);']]

		'binding of a simple symbol with block':
			input: [[
				'binding', [1, 1], null, ['Symbol', 'x'], [
					['text', [1, 1], undefined, [
						[
							['String', 'Hello ', 'Hello ']
							['Symbol', 'user'],
							['String', '!\n', '!\\n']
						]
					]]
				]
			]]

			expect: 	[[ 'call_user_func(function ($context) use ($data) {',
				[ [ 'echo htmlspecialchars(\'Hello \'), htmlspecialchars($data->user), htmlspecialchars(\'!\n\');' ] ],
			'}, $data->x);' ] ],

		'binding of a list':
			input: [
				['binding', [1, 1], null,
					['List', [['Number', 1], ['Number', 2], ['Number', 3]]],
					[]
				]
			]

		'binding of a tuple':
			input: [
				['binding', [ 1, 1 ], null,
					['Tuple', [['String', 'hax'], ['Number', 18]]],
					[]
				]
			]

		'binding of a named tuple':
			input: [
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

		'single quot text':
			input: [
				['text', [1, 1], undefined, ['Hello world!']]
			]

			expect: [['echo \'Hello world!\', "\\n";']]

		'single quot text no escape/interpolation':
			input: [
				['text', [1, 1], undefined, ['Hello {user}!\\n']]
			]

			expect: [['echo \'Hello {user}!\\n\', "\\n";']]

		'single quot multiple lines text ':
			input: [
				['text', [1, 1], undefined, ['Hello world!', 'foo bar baz', 'rawr rawr', 'super cool']]
			]

			expect:[[
				'echo \'Hello world!\', "\\n";'
				'echo \'foo bar baz\', "\\n";'
				'echo \'rawr rawr\', "\\n";'
				'echo \'super cool\', "\\n";'
			]]

		'single quot text with single quot':
			input: [
				['text', [1, 1], undefined, ["I'm ok!"]]
			]

			expect: [['echo \'I\\\'m ok!\', "\\n";']]

		'double quot text':
			input: [
				['text', [1, 1], undefined, [
					[['String', 'Hello world!', 'Hello world!']]
				]]
			]

			expect: [['echo htmlspecialchars(\'Hello world!\');']]

		'double quot text escape/interpolation':
			input: [
				['text', [1, 1], undefined, [
					[
						['String', 'Hello ', 'Hello ']
						['Symbol', 'user'],
						['String', '!\n', '!\\n']
					]
				]]
			]

			expect: [['echo htmlspecialchars(\'Hello \'), htmlspecialchars($data->user), htmlspecialchars(\'!\n\');']]

		'double quot multiple lines text with tag':
			input: [
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
			input: [
				['instruction', [1, 1], 'if',
					['BinaryOp', '>', ['Symbol', 'x'], ['Symbol', 'y']]
					[
						['text', [2, 2], undefined, [
							[['Symbol', 'x'], ['String', ' > ', ' > '], ['Symbol', 'y']]
						]]
					]
				]
			]

			expect: [[
				'if (($data->x > $data->y)) {',
				[[
					'echo htmlspecialchars($data->x), htmlspecialchars(\' > \'), htmlspecialchars($data->y);'
				]],
				'}'
			]]

		'iterate values':
			input: [
				['instruction', [1, 1], 'for',
					[[['Symbol', 'v'], ['Symbol', 'x']]]
					[['text', [2, 2], undefined, [
						[['Symbol', 'v']]
					]]]
				]
			]

			expect: [[
				'foreach ($data->x as $v) {',
				[[
					'echo htmlspecialchars($v);'
				]],
				'}'
			]]

		'iterate key, value pairs':
			input: [[
				'instruction',
				[1,1],
				'for',
				[[
					[
						'TuplePattern',
						[
							['Symbol', 'key'],
							['Symbol', 'value']
						]
					],
					['Symbol', 'x']
				]],
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
			]]

			expect: [[
				'foreach ($data->x as $key => $value) {',
				[[
					'echo htmlspecialchars($key), htmlspecialchars(\' = \'), htmlspecialchars($value), htmlspecialchars(\'"\');'
				]],
				'}'
			]]

		'multiple for':
			input: [[ 'instruction',
				[ 1, 1 ],
				'for',
				[ 
					[ [ 'Symbol', 'x' ], [ 'Symbol', 'list1' ] ],
					[ [ 'Symbol', 'y' ], [ 'Symbol', 'list2' ] ]
				],
				[[
					'text',
					[ 2, 5 ],
					undefined,
					[ [ [ 'Symbol', 'x' ], [ 'String', ', ', ', ' ], [ 'Symbol', 'y' ] ] ] 
				]]
			]]
			
			expect: [[
				'foreach ($data->list1 as $x) {',
				[
					'foreach ($data->list2 as $y) {',
					[[ 'echo htmlspecialchars($x), htmlspecialchars(\', \'), htmlspecialchars($y);' ]],
					'}'
				],
				'}' 
			]]
			            
		'multiple for with key value':
			input: [[ 'instruction',
				[ 1, 1 ],
				'for',
				[
					[[ 'Symbol', 'x' ], [ 'Symbol', 'list1' ]],
					[[ 'Symbol', 'y' ], [ 'Symbol', 'list2' ]],
					[[ 'TuplePattern', [[ 'Symbol', 'key' ], [ 'Symbol', 'value' ]]], [ 'Symbol', 'x' ]]
				],
				[[
					'text',
					[ 2, 5 ],
					undefined,
					[[
						[ 'Symbol', 'x' ],
						[ 'String', ', ', ', ' ],
						[ 'Symbol', 'y' ],
						[ 'String', 'asjdfhakjsdhfsla', 'asjdfhakjsdhfsla' ],
						[ 'Symbol', 'key' ],
						[ 'Symbol', 'value' ]
					]]
				]]
			]]
			
			expect: [[ 'foreach ($data->list1 as $x) {',
				[ 'foreach ($data->list2 as $y) {',
					[ 'foreach ($data->x as $key => $value) {',
						[[ 'echo htmlspecialchars($x), htmlspecialchars(\', \'), htmlspecialchars($y), htmlspecialchars(\'asjdfhakjsdhfsla\'), htmlspecialchars($key), htmlspecialchars($value);' ]],
					'}'],
				'}'],
			'}' ]]
			
		'let simple binding':
			input: [[ 'instruction',
				[ 1, 1 ],
				'let',
				[[[ 'Symbol', 'x' ], [ 'Number', 10 ]]],
				[[
					'text',
					[ 2, 5 ],
					undefined,
					[[[ 'String', '12345', '12345' ],[ 'Symbol', 'x' ]]]
				]]
			]]
			
			expect: [[
				'call_user_func(function($x) {',
				[[ 'echo htmlspecialchars(\'12345\'), htmlspecialchars($x);' ]],
				'}, 10);'
			]]

		'let binding':
			input: [[
				'instruction',
				[ 1, 1 ],
				'let',
				[
					[[ 'Symbol', 'x' ], [ 'Number', 1 ]],
					[[ 'Symbol', 'y' ], [ 'Number', 2 ]]
				],
				[[
					'text',
					[ 2, 5 ],
					undefined,
					[[
						[ 'Symbol', 'x' ],
						[ 'String', ', ', ', ' ],
						[ 'Symbol', 'y' ]
					]]
				]]
			]]
			
			expect: [[
				'call_user_func(function($x,$y) {',
				[[ 'echo htmlspecialchars($x), htmlspecialchars(\', \'), htmlspecialchars($y);' ]],
				'}, 1,2);'
			]]
            
		'let binding with pattern match':
			input: [[
				'instruction',
				[ 1, 1 ],
				'let',
				[[
					[
						'TuplePattern',
						[[ 'Symbol', 'x' ], [ 'Symbol', 'y' ], [ 'Symbol', 'z' ]]
					],
					[
						'Tuple',
						[[ 'Number', 1 ], [ 'Number', 2 ], [ 'Number', 3 ]]
					]
				]],
				[[
					'text',
					[ 2, 5 ],
					undefined,
					[[[ 'Symbol', 'x' ], [ 'String', ', ', ', ' ], [ 'Symbol', 'y' ]]]
				]]
			]]
	
		'element':
			input: [
				['element', [1, 1], ['div', ['test1'], undefined], undefined, []]
			]

			expect: [[
				'echo \'<div class="test1"\';',
				'',
				'echo \'</div>\';'
			]]

		'element with binding':
			input: [
				['element', [1, 1], ['div', ['test1'], undefined], ['Symbol', 'x'], []]
			]

		'nested elements with binding and extr block':
			input: [
				['element', [1, 1], ['div', ['test1'], undefined], undefined, [
					['element', [1, 23], ['div', ['test2'], undefined], ['Symbol', 'x'], [
						['text', [1, 1], undefined, [
							[
								['String', 'Hello ', 'Hello ']
								['Symbol', 'user'],
								['String', '!\n', '!\\n']
							]
						]]

					]]
				]]
			]

			expect: [[ 'echo \'<div class="test1"\';',
				[[ 'call_user_func(function ($context) use ($data) {',
					[ 'echo \'<div class="test2"\';',
						[ [ 'echo htmlspecialchars(\'Hello \'), htmlspecialchars($data->user), htmlspecialchars(\'!\n\');' ] ],
					'echo \'</div>\';' ],
				'}, $data->x);' ] ],
				'echo \'</div>\';'
			]]

		'nested elements with binding':
			input: [
				['element', [1, 1], ['div', ['test1'], undefined], undefined, [
					['element', [1, 23], ['div', ['test2'], undefined], ['Symbol', 'x'], []]
				]]
			]

			expect: [[ 'echo \'<div class="test1"\';',
				[[ 'call_user_func(function ($context) {',
					[ 'echo \'<div class="test2"\';',
					'echo \'>\', htmlspecialchars($context);',
					'echo \'</div>\';' ],
				'}, $data->x);' ] ],
				'echo \'</div>\';'
			]]

		'element bug 001':
			input: [[ 'element', [ 1, 1 ], [ 'meta', '', undefined ], undefined,
					[[ 'attribute', [ 1, 16 ], 'charset', '=', [ 'String', 'utf-8' ] ]
						['closeStartTag'] ] ] ]

			expect: [
				[ 'echo \'<meta\';',
					[[ 'echo \' charset="utf-8"\';' ], 'echo \'>\';' ],
			    	[]]
			]

		'element double quot':
			input: [
				[ 'element', [ 1, 1 ], [ 'meta', '', undefined ], undefined,
					[[ 'attribute', [ 1, 16 ], 'charset', '=',
						[ 'Quasi', undefined, [ [ 'String', 'utf-8', 'utf-8' ] ] ] ]
					]
				]
			]

			expect: [
				[ 'echo \'<meta\';',
					[[ 'echo \' charset="\';', 'echo htmlspecialchars(\'utf-8\');', 'echo \'"\';' ] ],
				[]]
			]

		'element double quot with x':
			input: [ [ 'element', [ 1, 1 ], [ 'meta', '', undefined ], undefined,
					[ [ 'attribute', [ 1, 16 ], 'charset', '=',
						[ 'Quasi', undefined, [ [ 'String', 'utf-8', 'utf-8' ], [ 'Symbol', 'x' ] ] ]
					] ]
				]]

			expect: [
				[ 'echo \'<meta\';',
					[[ 'echo \' charset="\';', 'echo htmlspecialchars(\'utf-8\'), htmlspecialchars($data->x);', 'echo \'"\';' ] ],
				[]]
			]

	document:

		'extend':
			input: ['document', ['./test/test', 1, 1], '', undefined,
				[['text', [1, 1], undefined, ['Big sheep testcase']]]
			]

			expect: '<?php\necho \'<!doctype html>\', "\\n";\n echo \'Big sheep testcase\', "\\n";\n?>'

		'extend with before hook':
			input: [ 'document', [ './test/test', 1, 1 ], '', undefined,
				[
					[ 'fragment', [ 2, 3 ], 'headBlock', 'before',
						[[ 'element', [ 3, 9 ], [ 'style', '', undefined ], undefined,
							[[ 'attribute', [ 3, 10 ], 'src', '=', [ 'String', 'test.css' ]]]
						]]
					],
					[ 'fragment', [ 1, 1 ], 'headBlock', undefined,
						[[ 'text', [ 2, 5 ], undefined, [ 'Big sheep testcase' ]]]
					]
				]
			]

			expect: '<?php\necho \'<!doctype html>\', "\\n";\n //  #headBlock\n   echo \'<style\';\n     echo \' src="test.css"\';\n   echo \'</style>\';\n //  #headBlock\n   echo \'Big sheep testcase\', "\\n";\n?>'

		'extend with mutiple hooks':
			input: [ 'document', [ './test/test', 1, 1 ], '', undefined,
				[
					[ 'fragment', [ 2, 3 ], 'headBlock', 'before',
						[[ 'element', [ 3, 9 ], [ 'style', '', undefined ], undefined,
							[[ 'attribute', [ 3, 10 ], 'src', '=', [ 'String', 'test.css' ]]]
						]]
					],
					[ 'fragment', [ 2, 3 ], 'headBlock', undefined,
						[[ 'element', [ 3, 9 ], [ 'style', '', undefined ], undefined,
							[[ 'attribute', [ 3, 10 ], 'src', '=', [ 'String', 'test.css' ]]]
						]]
					],
					[ 'fragment', [ 2, 3 ], 'headBlock', 'after',
						[[ 'element', [ 3, 9 ], [ 'style', '', undefined ], undefined,
							[[ 'attribute', [ 3, 10 ], 'src', '=', [ 'String', 'test.css' ]]]
						]]
					],
				]
			]
			expect: '<?php\necho \'<!doctype html>\', "\\n";\n //  #headBlock\n   echo \'<style\';\n     echo \' src="test.css"\';\n   echo \'</style>\';\n //  #headBlock\n   echo \'<style\';\n     echo \' src="test.css"\';\n   echo \'</style>\';\n //  #headBlock\n   echo \'<style\';\n     echo \' src="test.css"\';\n   echo \'</style>\';\n?>'
