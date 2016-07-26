module.exports = load

function load(mod) {
	if (/[/\\]node_modules[/\\]jedi$/.test(__dirname)) {
		require('babel-polyfill')
		require('./lib/ometa-js')
		return require('./lib/' + mod)
	} else { // dev env
		console.info('jedi development version')
		require('source-map-support').install()
		require('babel-register')
		require('babel-polyfill')
		require('./lib/ometa-js')
		return require('./src/' + mod)
	}
}

if (require.main === module) {
	if (process.argv.length > 2) load(process.argv[2])
}
