export default function clone(x) {
	if (typeof x !== 'object') return x
	if (Array.isArray(x)) return x.map(clone)
	const obj = {}
	for (const k of Object.keys(x)) obj[k] = clone(x[k])
	return obj
}
