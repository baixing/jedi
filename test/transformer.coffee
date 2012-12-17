"use strict"

exports.InstructionsProcessor =

	document:
	
		'element bug 001':
			input: ['document', ['./test/test', 1, 1], '', undefined, 
				[[ 'element', [ 1, 1 ], [ 'meta', '', undefined ], undefined,
					[[ 'attribute', [ 1, 16 ], 'charset', '=', [ 'String', 'utf-8' ] ] ] ] ] ]
			
			expect: ['document', ['./test/test', 1, 1], '', undefined, 
				[[ 'element', [ 1, 1 ], [ 'meta', '', undefined ], undefined,
					[[ 'attribute', [ 1, 16 ], 'charset', '=', [ 'String', 'utf-8' ] ] ] ] ] ]

		'extend':
		
			input: ['document', ['./test/test', 1, 1], '', undefined,
				[['instruction',[1,1],'import','templateTestCase',[]]]]
				
			expect: ['document', ['./test/test', 1, 1], '', undefined,
				[['fragment', [1, 1], 'headBlock', undefined,
					[['text', [Number, Number], undefined, ['Big sheep testcase']]]]]
			]
		
		'extend whth brfore hook':
			
			input: ['document', ['./test/test', 1, 1], '', undefined,
				[[
					'instruction',
					[1,1],
					'import',
					'templateTestCase',
					[[
						'fragment',
						[ 2, 3 ],
						'headBlock',
						'before',
						[[
							'element',
							[ 3, 9 ],
							[ 'style', '', undefined ],
							undefined,
							[[ 
								'attribute',
								[ 3, 10 ],
								'src',
								'=',
								[ 'String', 'test.css' ]
							 ]]
						 ]]
					]]
				]]			
			]
			
			expect: [ 'document', [ './test/test', 1, 1 ], '', undefined,
				[[
					[ 'fragment', [ 2, 3 ], 'headBlock', 'before',
						[[ 'element', [ 3, 9 ], [ 'style', '', undefined ], undefined,
							[[ 'attribute', [ 3, 10 ], 'src', '=', [ 'String', 'test.css' ]]] 
						]]
					],
					[ 'fragment', [ 1, 1 ], 'headBlock', undefined,
						[[ 'text', [ 2, 5 ], undefined, [ 'Big sheep testcase' ]]]
					]
				]]
			]

		'extend whth replace hook':
			
			input: ['document', ['./test/test', 1, 1], '', undefined,
				[[
					'instruction',
					[1,1],
					'import',
					'templateTestCase',
					[[
						'fragment',
						[ 2, 3 ],
						'headBlock',
						undefined,
						[[
							'element',
							[ 3, 9 ],
							[ 'style', '', undefined ],
							undefined,
							[[ 
								'attribute',
								[ 3, 10 ],
								'src',
								'=',
								[ 'String', 'test.css' ]
							 ]]
						 ]]
					]]
				]]			
			]
			
			expect: [ 'document', [ './test/test', 1, 1 ], '', undefined,
				[[
					[ 'fragment', [ 2, 3 ], 'headBlock', undefined,
						[[ 'element', [ 3, 9 ], [ 'style', '', undefined ], undefined,
							[[ 'attribute', [ 3, 10 ], 'src', '=', [ 'String', 'test.css' ]]] 
						]]
					],
				]]
			]
			
		'extend whth after hook':
			
			input: ['document', ['./test/test', 1, 1], '', undefined,
				[[
					'instruction',
					[1,1],
					'import',
					'templateTestCase',
					[[
						'fragment',
						[ 2, 3 ],
						'headBlock',
						'after',
						[[
							'element',
							[ 3, 9 ],
							[ 'style', '', undefined ],
							undefined,
							[[ 
								'attribute',
								[ 3, 10 ],
								'src',
								'=',
								[ 'String', 'test.css' ]
							 ]]
						 ]]
					]]
				]]			
			]
			
			expect: [ 'document', [ './test/test', 1, 1 ], '', undefined,
				[[
					[ 'fragment', [ 1, 1 ], 'headBlock', undefined,
						[[ 'text', [ 2, 5 ], undefined, [ 'Big sheep testcase' ]]]
					]
					[ 'fragment', [ 2, 3 ], 'headBlock', 'after',
						[[ 'element', [ 3, 9 ], [ 'style', '', undefined ], undefined,
							[[ 'attribute', [ 3, 10 ], 'src', '=', [ 'String', 'test.css' ]]] 
						]]
					],
				]]
			]
			
		'extend whth mutiple hook':
			
			input: ['document', ['./test/test', 1, 1], '', undefined,
				[[
					'instruction',
					[1,1],
					'import',
					'templateTestCase',
					[
						[
							'fragment',
							[ 2, 3 ],
							'headBlock',
							'after',
							[[
								'element',
								[ 3, 9 ],
								[ 'style', '', undefined ],
								undefined,
								[[ 
									'attribute',
									[ 3, 10 ],
									'src',
									'=',
									[ 'String', 'test.css' ]
								 ]]
							 ]]
						]
						[
							'fragment',
							[ 2, 3 ],
							'headBlock',
							undefined,
							[[
								'element',
								[ 3, 9 ],
								[ 'style', '', undefined ],
								undefined,
								[[ 
									'attribute',
									[ 3, 10 ],
									'src',
									'=',
									[ 'String', 'test.css' ]
								 ]]
							 ]]
						]
						[
							'fragment',
							[ 2, 3 ],
							'headBlock',
							'before',
							[[
								'element',
								[ 3, 9 ],
								[ 'style', '', undefined ],
								undefined,
								[[ 
									'attribute',
									[ 3, 10 ],
									'src',
									'=',
									[ 'String', 'test.css' ]
								 ]]
							 ]]
						]
					]
				]]
			]
			
			expect: [ 'document', [ './test/test', 1, 1 ], '', undefined,
				[[
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
				]]
			]

exports.Sorter =

	document:
	
		'element bug 001':
			input: ['document', ['./test/test', 1, 1], '', undefined, 
				[[ 'element', [ 1, 1 ], [ 'meta', '', undefined ], undefined,
					[[ 'attribute', [ 1, 16 ], 'charset', '=', [ 'String', 'utf-8' ] ] ] ] ] ]
			
			expect: ['document', ['./test/test', 1, 1], '', undefined, 
				[[ 'element', [ 1, 1 ], [ 'meta', '', undefined ], undefined,
					[[ 'attribute', [ 1, 16 ], 'charset', '=', [ 'String', 'utf-8' ] ]
						['closeStartTag'] ] ] ] ]
	