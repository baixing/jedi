import Cache from './cache'

export default function memoize(hash = x => x) {
	const f = this
	const cache = new Cache()
	const g = function (...args) {
		const thisAndArgs = [this].concat(args)
		console.time('hash')
		const k = hash(thisAndArgs)
		console.timeEnd('hash')
		console.time('lookup cache')
		if (cache.has(k)) {
			const result = cache.get(k)
			console.timeEnd('lookup cache')
			return result
		}
		console.time(f.name)
		const result = this::f(...args)
		cache.set(k, result)
		console.timeEnd(f.name)
		return result
	}
	return g
}
