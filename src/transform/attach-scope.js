import traverse from '../util/traverse'
import Scope from './Scope'

export default function attachScope(tree) {

	let parent = new Scope(null, {})

	return tree::traverse({
		enter(node) {
			const {nodeType, nodeName, nodeValue, childNodes} = node
			if (childNodes) childNodes.scope = new Scope(parent, node)
			switch (nodeType) {
				case 'macro':
					parent.saveMacro(nodeName)
					childNodes.scope.saveBindings(nodeValue)
					break
				case 'instruction':
					switch (nodeName) {
						case 'use': {
							const [path, names] = nodeValue
							names.forEach(([name, alias = name]) => parent.saveSymbol(alias, path.concat(name)))
						} break
						case 'external':
							nodeValue.forEach(([kind, name]) => parent.saveSymbol(name, [name]))
							break
						case 'let':
							nodeValue.forEach(([bindings, _]) => parent.saveBindings(bindings))
							break
						case 'for': {
							const s = childNodes.scope
							nodeValue.forEach(([_, value, key, index]) => {
								s.saveBindings(value)
								if (key) s.saveSymbol(key[1], 'local')
								if (index) s.saveSymbol(index[1], 'local')
							})
							break
						}
					}
					break
			}
			if (childNodes) parent = childNodes.scope
		},
		leave({childNodes}) {
			if (childNodes) parent = parent.parent
		},
	})
}
