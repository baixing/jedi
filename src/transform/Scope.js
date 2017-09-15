import {inspect} from 'util'
import {macroName} from '../util/macro'


let id = 0
function generateId() {
	return ++id
}

export default class Scope {

	constructor(parent, {position, nodeType, nodeName}) {
		this.id = generateId()
		this.parent = parent
		this.macrosParent = parent
		this.position = position
		this.temp = 0
		this.bindings = new Map
		this.freeVars = new Set
		this.macros = []
		this.freeMacros = new Set
	}

	[inspect.custom]() {
		return {
			...this,
			id:	this.id,
			parent:	this.parent.id,
			macrosParent:	this.macrosParent.id,
		}
	}

	newTemp() {
		++this.temp
		return `_${this.temp}`
	}

	mergeMacros(macros) {
		let s = this
		while (!s.macros) s = s.parent
		s.macros.push(...macros)
	}

	saveMacro(name) {
		let s = this
		while (!s.macros) s = s.parent
		name.push(macroName(name))
		s.macros.push(name)
	}

	findMacro([tag0, cls0, id0]) {
		let s = this, specificity = 0, mostSpecific, scope
		while (s) {
			if (s.macros) {
				s.macros.forEach(([tag, cls, id, ref]) => {
					// console.log(tag0, cls0, id0)
					// console.log(tag, cls, id, ref)
					if ((tag === '*' || tag === tag0)
						&&	cls.every(c => cls0.includes(c))
						&&	(!id || id === id0)
					) {
						const sp = (id ? 0 : 0x1000000) + (cls.length * 0x100000) + (tag === '*' ? 0 : 0x10000)
						if (sp >= specificity) {
							specificity = sp
							mostSpecific = ref
							scope = s
						}
					}
				})
			}
			s = s.macrosParent
			++specificity
		}
		// console.log('most specific:', mostSpecific)
		if (mostSpecific) this.saveFreeMacro(mostSpecific, scope)
		return mostSpecific
	}

	saveBindings(bindings) {
		collectBindings(bindings).forEach(name => this.saveSymbol(name, 'local'))
	}

	saveSymbol(name, resolution) {
		if (name === '_') return
		if (this.bindings.has(name)) {
			const e = new Error('SymbolConflict')
			e.position = this.position
			e.data = {name, binding: this.bindings.get(name)}
			throw e
		}
		this.bindings.set(name, resolution)
	}

	findSymbol(name) {
		if (name === '*') return ['local', 'context']
		if (name === '_') return ['local', '_']
		let s = this
		while (s) {
			if (s.bindings.has(name)) {
				const result = s.bindings.get(name)
				switch (result) {
					case 'local':
						this.saveFreeVar(name, s)
						return ['local', name]
					default:
						return ['use', result]
				}
			}
			s = s.parent
		}
		// console.log('failed to find symbol', name, 'fallback to global')
		this.saveFreeVar('data', null)
		return ['global', name]
	}

	saveFreeVar(name, declScope) {
		for (let s = this; s !== declScope; s = s.parent) {
			s.freeVars.add(name)
		}
	}

	saveFreeMacro(name, declScope) {
		for (let s = this; s !== declScope; s = s.macrosParent) {
			s.freeMacros.add(name)
		}
	}

}


export function createScope() {
	return new Scope(null, {})
}


function collectBindings([kind, value, value2]) {
	switch (kind) {
		case 'Symbol':
			return [value]
		case 'RestPattern':
			return collectBindings(value)
		case 'ListPattern':
		case 'RecordPattern':
			return value.reduce((all, element) => all.concat(collectBindings(element)), [])
		case 'MappingPattern':
			return collectBindings(value2)
		case 'TuplePattern':
			return []
		default:
			throw new Error('Unknown pattern: ' + kind)
	}
}
