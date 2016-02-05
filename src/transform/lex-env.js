import traverse from '../util/traverse'
export function initLexicalEnvironments(tree) {

}

const own = {}.hasOwnProperty

class LexicalEnvironment {
	constructor(outer) {
		this.outer = outer
		this.bindings = Object.create(this.outer.bindings)
		this.macros = []
	}
	createBinding(name) {
		if (this::own(name)) throw new Error(name)
		this.bindings[name] = {}
	}
	createExternal(name, alias, from) {
		if (this::own(name)) throw new Error(name)
		this.bindings[name] = {external: true}
	}
	resolveBinding(name) {
		const ref = this.bindings[name]
		if (ref) return ref

	}
}
