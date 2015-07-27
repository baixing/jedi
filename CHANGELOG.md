1.0.0-rc2 / 2015-07-27
========================

Features:
  * Record (object hash)

Bug Fixes:
  * fix specificity
  * fix sort for all type  
  * convert name of imported fragment which make cache work
  * empty array is not skip node

Refactor
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
