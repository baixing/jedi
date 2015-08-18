import {inspect} from 'util'
export const dir = o => console.log(inspect(o, false, 32, true))

export const diff = (a, b) => {
	if (a === b) return false
	if (Number.isNaN(a) && Number.isNaN(b)) return false
	if (typeof b === 'function') return a instanceof b
	if (Array.isArray(a)) {
		if (a.length !== b.length) return [a, b, 'length', a.length, b.length]
		for (let i = 0; i < a.length; ++i) {
			const r = diff(a[i], b[i])
			if (r) return r
		}
		return false
	}
	return [a, b]
}
