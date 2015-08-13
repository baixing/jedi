// import {HashMap} from 'maps'

export class Cache extends Map {
	constructor() {
		super()
		this._stats = new Map
	}
	clear() {
		this._stats.clear()
		return super.clear()
	}
	delete(key) {
		const deleted = super.delete(key)
		if (deleted) this._stats.delete(key)
	}
	get(key) {
		if (this._stats.has(key)) ++this._stats.get(key).visits
		return super.get(key)
	}
	set(key, value) {
		super.set(key, value)
		if (this._stats.has(key)) ++this._stats.get(key).updates
		else this._stats.set(key, {visits: 0, updates: 0})
		return this
	}
}
