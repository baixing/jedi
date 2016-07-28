1.0.0-rc5 / 2016-07-28
========================

Features:
  * `for (key, value, index?, count?) in ...`
  * `use` directive
  * report duplicated error for `external`/`use` directive
  * `X.new()` for `new X()`
  * report error in transform phase
  * extra information when report error
  * `/--version` for jedi-transpiler-service

Bug Fixes:
  * respond 403 forbidden if no permission for writing
  * fix #63
  * rethrow error for exit code

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
