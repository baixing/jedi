import {dir} from '../util/debug'

import doImport	from './import'
import sortNodes	from './sort-nodes'
import escapeScript	from './script-element'
import reportError	from './report-error'

export default (tree, show = []) => {
	if (show[0]) dir(tree)

	console.time('transform 1')
	tree = doImport(tree)
	console.timeEnd('transform 1')
	if (show[1]) dir(tree)

	console.time('transform 2')
	tree = escapeScript(tree)
	console.timeEnd('transform 2')
	if (show[2]) dir(tree)

	console.time('transform 3')
	tree = sortNodes(tree)
	console.timeEnd('transform 3')
	if (show[3]) dir(tree)

	return tree
}
