1.0.0-rc7 / 2016-10-10
========================

Bug Fixes:
  * 0.10 compatibility

Refactor:
  * remove for-of for 0.10 (which do not have native Symbol) compatibility

Architecture:
  * add 0.10/0.12 env in CI

1.0.0-rc6 / 2016-09-29
========================

Features:
  * complete macro syntax: `::macro of param`
  * flatten let instruction
  * support destructuring
  * support spread/rest
  * resolve bindings per file
  * revise for syntax: `for key, value at index in ...`
  * allow output AST as JSON
  * support diff php version target (5.3 ~ 5.6)

Bug Fixes:
  * "\(experssion)" swift-like interpolation syntax
  * fix literal attribute output (escape `'`)
  * do not allow name starts/ends with '-'

Refactor:
  * rewrite scope and bindings
  * rewrite macro
  * [codegen] rewrite runtime/php
  * [transform] traverse enter/leave
  * [parser] simplify tupleLiteral/tuplePattern
  * [parser] simplify comma separated construct

Tests:
  * add tests for issues
  * apply transform for codegen tests
  * update testcases


1.0.0-rc5 / 2016-08-05
========================

Features:
  * `for (key, value, index?, count?) in ...`
  * `use` directive
  * report duplicated error for `external`/`use` directive
  * `X.new()` for `new X()`
  * report error in transform phase
  * extra information when report error
  * `/--version` for jedi-transpiler-service
  * allow access record using `[]` operator
  * warn missing use/external (assume function calls or titlecase classes)
  * experimental swift-like interpolation syntax

Bug Fixes:
  * respond 403 forbidden if no permission for writing
  * fix #63
  * rethrow error for exit code
  * ensure valid PHP name
  * fix #72

Architecture:
  * travis CI
  * change to babel es2015 preset
  * factor out error emit with recent position info in codegen
  * update deps
  * output test case name

Documents:
  * update badges
  * comment #65


1.0.0-rc4 / 2016-05-27
========================

Features:
  * `jediphp` command
  * do not output pseudo class

Bug Fixes:
  * add postinstall script to ensure ometa files are compiled
  * fix cache problem
  * fix #47
  * fix literal grammar, allow symbol start with reserved words
  * fix license field in the package.json as SPDX
  * make ×/÷ operators work
  * fix #50

Documents:
  * link to sublime syntax support
  * add more examples


1.0.0-rc3 / 2015-08-27
========================

Architecture:
  * migrate to ES6+
  * add php runtime
  * remove all old transformer
  * add offsetLn/Col, make positions more accurate
  * add source-map-support
  * use new cache mechanism, codegen also use cache now

Features:
  * implement literal attributes
  * make end instructions works
  * output external symbols in comments

Bug Fixes:
  * fix imported fragment order
  * nest fragments need to be traversed
  * keep order of external instructions

Refactor:
  * rewrite lots of code/tests to ES6+
  * reorg src structure to parse/transform/codegen
  * clean directories/files
  * instead of .npmignore, use package.json/files field for npm publish
  * update eslint config and fix problems

Documents:
  * reorg/rewrite many examples
  * add license fields of package.json


1.0.0-rc2 / 2015-07-27
========================

Features:
  * Record (object hash)

Bug Fixes:
  * fix specificity
  * fix sort for all type  
  * convert name of imported fragment which make cache work
  * empty array is not skip node

Refactor:
  * rewrite sort transformer

Tests:
  * remove legacy tests for transformers


1.0.0-rc1 / 2015-07-21
========================

Features:
  * support output error info to php
  * report filename/line/col of the compiling error
  * support default slot
  * support import fragment
  * allow quantifiers (`*`, `?`) before element
  * add d instruction
  * add some compact syntax
  * support pseudoclass
  * reformat the generated php, align echos,
    merge close tags to previous echo, append source location

Bug Fixes:
  * fix subtemplate (import instruction), allow multiple import
  * fix column for attributes and fragment binding

Refactor:
  * rewrite transform phase
  * rewrite core transformers
  * rewrite Cache
  * remove legacy php5b
  * separate DocumentStripper transformer
  * switch to ES2016, use gulp and babel
  * add eslint and fix code

Documents:
  * add changelog
  * add old changelog
  * improve README
  * update docs for future development
