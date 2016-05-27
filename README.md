## Jedi ##

Jedi is a new template language (maybe do more such as url routing in the future)
inspired by
[Jade](https://github.com/visionmedia/jade) /
[Coffeekup](https://github.com/mauricemach/coffeekup)
and many others. It's still in beta phase but we already use it in
production (http://m.baixing.com/) for several years.

[![NPM version](https://badge.fury.io/js/jedi.png)](http://badge.fury.io/js/jedi)
[![Dep status](https://david-dm.org/baixing/jedi.png)](https://david-dm.org/baixing/jedi)

### Install ###

```npm install jedi -g```

### Usage ###

Compile to php:
```jedi example.jedi php```

Watch changes and auto compiling:
```jedi -w example.jedi php```

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


### Known major bugs and limitations for 1.0 milestone

0. subtemplate fragments (which combine the power of Jade's mixin and block feature) is not fully implemented

0. importing with parameters is not implemented

0. destructuring is not implemented

0. quantifiers is not fully implemented


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
