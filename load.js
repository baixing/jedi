module.exports = function load(mod) {
	if (/[/\\]node_modules[/\\]jedi$/.test(__dirname)) {
		require('babel/polyfill')
		require('./lib/ometa-js')
		return require('./lib/' + mod)
	} else { // dev env
		console.info('jedi development version')
		require('source-map-support').install()
		require('babel/register')
		require('./lib/ometa-js')
		return require('./src/' + mod)
	}
}
