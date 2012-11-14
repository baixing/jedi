## Jedi ##

Jedi is a new template language (maybe do more such as url routing in the future)
inspired by Jade / Coffeekup and many others. It's still in alpha phase and very
unstable.

Jedi 0.9.5 is available now.

### Install ###

```npm install jedi -g```

### Usage ###

```jedi2php example.jedi```

```jedi2php -w example.jedi```

### Template Syntax ###

See examples/hello.jedi

### Known major bugs and limitations of 0.9.5

1. subtemplate instruction (which will replace Jade's mixin and block feature) is not implemented

2. @title = "Hello {username}" is not implemented

3. string concat is not implemented yet

4. only one attribute is allowed in the same line of element

