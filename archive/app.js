//require('underscore')

/*require('my').load('lib/Tabish/type', function(type){

	console.log(type.Class)
})*/


/*
require('my').load('lib/Tabish/iterator', function(m){

	console.log(m.Iterator)
	console.log(m.StopIteration)

	var it = m.Iterator({a:1, b:2})
	try {
		while (true) {
			console.log(it.next())
		}
	} catch(e) {}

})

require('my').load('lib/Tabish/matcher', function(m){

	console.log(m.RegExpMatcherIterator)

	var it = m.RegExpMatcherIterator(/l/g, 'Hello world!')

	try {
		while (true) {
			console.log(it.next())
		}
	} catch(e) {}

})
*/


/*require('my').load('lib/Tabish/tabish', function(m){

	console.log(m.parse('Hello!\n	Hello 2!'))

})*/

require('my').global.console = console

require('my').load('jedi', function(jedi){

	var source = 'html'
	var runtime = new jedi.JSRuntime()
	var template = runtime.eval(jedi.compileToJS(source))
	template.echo = function(s){
		console.log(s)
	}
	template()
})

