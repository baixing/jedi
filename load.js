require('source-map-support').install()
require('./lib/ometa-js')

module.exports = function load(mod) {
	if (/[/\\]node_modules[/\\]jedi$/.test(__dirname)) {
		require('babel/polyfill')
		return require('./lib/' + mod)
	} else { // dev env
		console.info('jedi development version')
		require('babel/register')
		return require('./src/' + mod)
	}
}
