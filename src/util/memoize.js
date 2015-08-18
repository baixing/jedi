import Debug from 'debug'
const debug = Debug('memoize')

import Cache from './cache'

export default function memoize(hash = x => x) {
	const f = this
	const cache = new Cache()
	const g = function (...args) {
		const thisAndArgs = [this].concat(args)

		debug('start hash')
		const k = hash(thisAndArgs)
		debug('end hash')

		debug('lookup cache')
		if (cache.has(k)) {
			const result = cache.get(k)
			debug('cache hit')
			return result
		}
		debug('cache miss')

		debug('start invoke')
		const result = this::f(...args)
		debug('end invoke')
		cache.set(k, result)

		return result
	}
	return g
}
