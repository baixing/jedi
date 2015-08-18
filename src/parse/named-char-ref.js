import {fail} from '../../lib/ometa-js'
import entities from './entities' // http://www.w3.org/TR/html5/entities.json

export default (name) => {
	const e = entities[name]
	if (e) return e.characters
	else throw fail
}
