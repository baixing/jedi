## Jedi ##

Jedi is a new template language (maybe do more such as url routing in the future)
inspired by [Jade](https://github.com/visionmedia/jade) / [Coffeekup](https://github.com/mauricemach/coffeekup) and many others. It's still in beta phase but we already
use it in production (http://m.baixing.com/) for several years.

[![NPM version](https://badge.fury.io/js/jedi.png)](http://badge.fury.io/js/jedi)
[![Dep status](https://david-dm.org/baixing/jedi.png)](https://david-dm.org/baixing/jedi)

### Install ###

```npm install jedi -g```

### Usage ###

```jedi example.jedi php```

```jedi -w example.jedi php```

### Template Syntax ###

See [examples](https://github.com/baixing/jedi/tree/master/examples)

### Known major bugs and limitations for 1.0 milestone

1. subtemplate fragments (which combine the power of Jade's mixin and block feature) is not fully implemented

1. only very basic support of import instruction

1. string concat and some other expression operators are not implemented


### Build system

* Gulp plugin: https://github.com/HerringtonDarkholme/gulp-jedi

### IDE/editor support ###

#### WebStorm/PHPStorm ####

NOTE: Only support simple keywords highlighting

Copy [jedi.xml](./editors/PHPStorm/jedi.xml) to 
```~/Library/Preferences/WebIde70/filetypes``` for MacOS
or ```%USERPROFILE%\.WebIde70\config\filetypes``` for Windows, restart WebStorm/PHPStorm

#### Others ####

Planned:

1. Code Browser, jEdit
2. NetBeans
3. CodeMirror, ACE

### Copyright & License ###

   Copyright 2012, 2013 HE Shi-Jun
   Copyright 2014 baixing.com

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at
   [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
