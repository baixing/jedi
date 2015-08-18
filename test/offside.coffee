"use strict"

exports.OffsideRule =

	skip:
		empty:
			''
		whitespaces:
			'\t \t'
		ignore:
			'# test'
		ignore_with_whitespaces:
			'    # test'

	'[shift]':
		tab:
			'\t'
		spaces:
			'    '
		spaces_and_tab:
			'  \t'

	block: [
		['head line'],
		['head line', '\tbody line 1', '\tbody line 2'],
		['\thead line', '\t\tbody line 1', '\t\tbody line 2'],
		['\t    head line', '    \t\tbody line 1', ' \t    \tbody line 2'],

		[],
		[
			'\thead line',
			'\t\tbody line 1',
			'',
			'\t\tbody line 2'
		],
		[
			'# head',
			'\thead line',
			'',
			'# body',
			'\t\tbody line'
		],
		[
			'', '', '# test',
			'\thead',
			'',
			'\t\tbody line 1',
			'# test',
			'\t\tbody line 2'
		],

		['    \t mixed whitespace'],

		[
			'# test',
			'\thead1',
			'\t\t\tbody line',
			'\t\t\tbody line',
			'\t\toffside line',
			'\t\t',
			'\thead2',
			'offside line',
			'\tline',
			'\tline',
		],
	]
	source:
		require('fs').readFileSync(require.resolve('./offside.txt')).
			toString().split(/(?:^|\r?\n)\r?\n?={4}.*\r?\n?(?:\r?\n|$)/)
