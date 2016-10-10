## Jedi ##

Jedi is a new template language (maybe do more such as url routing in the future)
inspired by
[Jade](https://github.com/visionmedia/jade) /
[Coffeekup](https://github.com/mauricemach/coffeekup)
and many others. It's still in beta phase but we already use it in
production (http://m.baixing.com/) for several years.

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Downloads][downloads-image]][npm-url]
[![Dependencies status][deps-image]][deps-url]


### Install ###

```npm install jedi -g```

### Usage ###

Compile to php:
```sh
jedi example.jedi php
```

Compile and run:
```sh
jediphp example
```

Watch changes and auto compiling:
```sh
jedi -w example.jedi php
```

### Template Syntax ###

See [examples](https://github.com/baixing/jedi/tree/master/examples)

### Build system

* Gulp plugin: https://github.com/HerringtonDarkholme/gulp-jedi

### IDE/editor support ###

#### WebStorm/PHPStorm ####

NOTE: Only support simple keywords highlighting

Copy [jedi.xml](./editors/PHPStorm/jedi.xml) to
```~/Library/Preferences/WebIde70/filetypes``` for MacOS
or ```%USERPROFILE%\.WebIde70\config\filetypes``` for Windows, restart WebStorm/PHPStorm

There is also a variant edition [cssmagic/jedi.xml](https://github.com/cssmagic/jedi.xml)
which adjust some details and add [CMUI](https://github.com/CMUI/CMUI) keywords.

#### Sublime/TextMate ####

See https://github.com/CyanSalt/Sublime-Jedi

#### Vim ####

See https://github.com/HerringtonDarkholme/jedi-syntax


### Copyright & License ###

   Copyright 2012, 2013 HE Shi-Jun

   Copyright 2014, 2015, 2016 baixing.com

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at
   [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.


[npm-image]: https://img.shields.io/npm/v/jedi.svg
[npm-url]: https://npmjs.org/package/jedi
[travis-image]: https://img.shields.io/travis/baixing/jedi.svg
[travis-url]: https://travis-ci.org/baixing/jedi
[downloads-image]: http://img.shields.io/npm/dm/jedi.svg
[deps-image]: https://david-dm.org/baixing/jedi.svg
[deps-url]: https://david-dm.org/baixing/jedi
