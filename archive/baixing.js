var express = require('express')

var app = express(), fs = require('fs')

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jedi');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

require('my').load('jedi', function(jedi){
	app.engine('jedi', function __express(path, options, callback) {
		//console.log(arguments)
		console.log(Object.keys(options))
		fs.readFile(path, 'utf-8', function(err, data) {
			if (err) callback(err)
			else {
				try {
					var runtime = jedi.JSRuntime()
					var source = data
					var jsSrc = jedi.compileToJS(source)
					var template = runtime.eval(jsSrc)
					var result = ''
					template.echo = function(s){
						result += s
					}
					template(options.model)
					callback(null, result)
				} catch(e) {
					e.message += jsSrc.replace(/&/g, '&amp;').replace(/</g, '&lt;')
					callback(e, jsSrc)
				}
			}
		})
	})
})

// Routes

var http = require('http')


app.get('/u/:uid/', function(req, res){
	var graphRes = http.get('http://graph.baixing.com' + req.url.slice(2) + 'ad', function(graphRes){
		graphRes.setEncoding('utf-8')
		var result = ''
		graphRes.on('data', function(data){
			result += data
		})
		graphRes.on('end', function(data){
			var m = JSON.parse(result)
			console.log(m)
			ok(res, 'ad', m)
		})
	})
	var graphReq = http.get('http://graph.baixing.com' + req.url.slice(2, -1), function(graphRes){
		graphRes.setEncoding('utf-8')
		var result = ''
		graphRes.on('data', function(data){
			result += data
		})
		graphRes.on('end', function(data){
			var m = JSON.parse(result)
			console.log(m)
			ok(res, 'user', m)
			res.render('test', {
				model: m
			})
		})
	})
	graphReq.on('error', function(e){
		console.error(e)
	})
})

app.get('/*', function(req, res){
	console.log('http://graph.baixing.com' + req.url)
	var graphReq = http.get('http://graph.baixing.com' + req.url, function(graphRes){
		graphRes.setEncoding('utf-8')
		var result = ''
		graphRes.on('data', function(data){
			result += data
		})
		graphRes.on('end', function(data){
			var m = JSON.parse(result)
			console.log(m)
			res.render('test', {
				model: m
			})
		})
	})
	graphReq.on('error', function(e){
		console.error(e)
	})
});

app.listen(3000, function(){});



