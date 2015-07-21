'use strict';

var _toArray = require('babel-runtime/helpers/to-array')['default'];

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _objectWithoutProperties = require('babel-runtime/helpers/object-without-properties')['default'];

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.resolve = resolve;
exports.query = query;
exports.queryAll = queryAll;
exports.traverse = traverse;

var _url = require('url');

function resolve(name, referrer) {
	return (0, _url.resolve)(referrer, name);
}

var tuple2record = function tuple2record(t) {
	if (skip(t)) return { nodeType: 'skip', data: t };

	var _t = _toArray(t);

	var nodeType = _t[0];
	var position = _t[1];

	var data = _t.slice(2);

	if (nodeType === 'element') {
		var _data = _slicedToArray(data, 3);

		var _data$0 = _slicedToArray(_data[0], 3);

		var tagName = _data$0[0];
		var classList = _data$0[1];
		var id = _data$0[2];
		var binding = _data[1];
		var childNodes = _data[2];

		return { nodeType: nodeType, position: position, nodeName: tagName, tagName: tagName, classList: classList, id: id, binding: binding, childNodes: childNodes };
	}
	if (hasChildNodes(nodeType)) {
		var _data2 = _slicedToArray(data, 3);

		var nodeName = _data2[0];
		var nodeValue = _data2[1];
		var childNodes = _data2[2];

		return { nodeType: nodeType, position: position, nodeName: nodeName, nodeValue: nodeValue, childNodes: childNodes };
	}
	return { nodeType: nodeType, position: position, data: data };
};

exports.tuple2record = tuple2record;
var record2tuple = function record2tuple(_ref) {
	var nodeType = _ref.nodeType;
	var position = _ref.position;

	var data = _objectWithoutProperties(_ref, ['nodeType', 'position']);

	if (nodeType === 'skip') return data.data;
	if (nodeType === 'element') {
		var tagName = data.tagName;
		var classList = data.classList;
		var id = data.id;
		var binding = data.binding;
		var childNodes = data.childNodes;

		return [nodeType, position, [tagName, classList, id], binding, childNodes];
	}
	if (hasChildNodes(nodeType)) {
		var nodeName = data.nodeName;
		var nodeValue = data.nodeValue;
		var childNodes = data.childNodes;

		return [nodeType, position, nodeName, nodeValue, childNodes];
	}
	return [nodeType, position].concat(_toConsumableArray(data.data));
};

exports.record2tuple = record2tuple;

function query(f, order) {
	var match1 = undefined;
	traverse.call(this, function (node) {
		if (match1) return false;
		if (f(node)) {
			match1 = node;
			return false;
		}
	}, order);
	return match1 ? record2tuple(match1) : match1;
}

function queryAll(f, order) {
	var matches = [];
	traverse.call(this, function (node) {
		if (f(node)) matches.push(node);
	}, order);
	return matches;
}

function traverse(f, order, traverseAll) {
	if (order === undefined) order = 'pre';

	if (skip(this)) return this;

	if (isNode(this)) {
		var node = tuple2record(this);
		if (order === 'post') traverseChildNodes(node);
		var recursive = f(node);
		if (recursive || recursive === undefined && order === 'pre') traverseChildNodes(node);
		return record2tuple(node);
	}

	if (Array.isArray(this)) {
		return this.map(function (child) {
			return traverse.call(child, f, order, traverseAll);
		});
	}

	throw new Error(this);

	function traverseChildNodes(node) {
		if (Array.isArray(node.childNodes)) {
			node.childNodes = node.childNodes.map(function (child) {
				return traverse.call(child, f, order, traverseAll);
			});
		}
		if (traverseAll) {
			if (Array.isArray(node.binding) && isNode(node.binding)) {
				var _context;

				node.binding = (_context = node.binding, traverse).call(_context, f, order, traverseAll);
			}
			// if (Array.isArray(node.data) && Array.isArray(node.data[node.data.length - 1])) {
			// 	node.data[node.data.length - 1] = node.data[node.data.length - 1].map(child => child::traverse(f, order, traverseAll))
			// }
		}
	}
}

function isNode(nodeTuple) {
	return /^(?:document|element|attribute|text|comment|scriptsource|suppress|inject|binding|instruction|macro|fragment|Section|Offside|MixedWhitespace|Error)$/.test(nodeTuple[0]);
}

function skip(nodeTuple) {
	var white = /^\s*(?:\/\/.*)?$/;
	if (Array.isArray(nodeTuple)) {
		if (nodeTuple.length === 1 && nodeTuple[0] === 'closeStartTag') return true;
		if (nodeTuple.every(function (x) {
			return typeof x === 'string' && x.length === 1;
		}) && white.test(nodeTuple.join(''))) return true;
	} else {
		if (typeof nodeTuple === 'string' && white.test(nodeTuple)) return true;
		throw new Error(nodeTuple);
	}
}

function hasChildNodes(nodeType) {
	switch (nodeType) {
		case 'document':
		case 'fragment':
		case 'element':
		case 'binding':
		case 'instruction':
		case 'macro':
			return true;
		default:
			return false;
	}
}

// export function match(pattern) {
// 	if (typeof pattern === 'function' && pattern.prototype) return this instanceof pattern
// 	if (pattern && typeof pattern.test === 'function') return pattern.test(this)
// 	switch (typeof this) {
// 		case 'undefined':
// 		case 'boolean':
// 		case 'number':
// 		case 'string':
// 		case 'symbol':
// 			return this === pattern
// 		case 'object':
// 			if (this === null) return pattern === null
// 			if (Array.isArray(pattern)) return pattern.every((p, i) => this[i]::match(p))
// 			if (typeof pattern === 'object') return Object.keys(pattern).every(key => this[key]::match(pattern[key]))
// 			return false
// 		default: throw new Error('should not be function')
// 	}
// }
//# sourceMappingURL=data:application/json;base64,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QUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtDQUMvSzs7QUFFRCxTQUFTLElBQUksQ0FBQyxTQUFTLEVBQUU7QUFDeEIsS0FBTSxLQUFLLEdBQUcsa0JBQWtCLENBQUE7QUFDaEMsS0FBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFO0FBQzdCLE1BQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLGVBQWUsRUFBRSxPQUFPLElBQUksQ0FBQTtBQUMzRSxNQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsVUFBQSxDQUFDO1VBQUksT0FBTyxDQUFDLEtBQUssUUFBUSxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQztHQUFBLENBQUMsSUFDN0QsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsT0FBTyxJQUFJLENBQUE7RUFDL0MsTUFBTTtBQUNOLE1BQUksT0FBTyxTQUFTLEtBQUssUUFBUSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsT0FBTyxJQUFJLENBQUE7QUFDdkUsUUFBTSxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQTtFQUMxQjtDQUNEOztBQUVELFNBQVMsYUFBYSxDQUFDLFFBQVEsRUFBRTtBQUNoQyxTQUFRLFFBQVE7QUFDZixPQUFLLFVBQVUsQ0FBQztBQUNoQixPQUFLLFVBQVUsQ0FBQztBQUNoQixPQUFLLFNBQVMsQ0FBQztBQUNmLE9BQUssU0FBUyxDQUFDO0FBQ2YsT0FBSyxhQUFhLENBQUM7QUFDbkIsT0FBSyxPQUFPO0FBQ1gsVUFBTyxJQUFJLENBQUE7QUFBQSxBQUNaO0FBQ0MsVUFBTyxLQUFLLENBQUE7QUFBQSxFQUNiO0NBQ0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEiLCJmaWxlIjoidXRpbDIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3Jlc29sdmUgYXMgcmVzb2x2ZVBhdGh9IGZyb20gJ3VybCdcbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlKG5hbWUsIHJlZmVycmVyKSB7XG5cdHJldHVybiByZXNvbHZlUGF0aChyZWZlcnJlciwgbmFtZSlcbn1cblxuZXhwb3J0IGNvbnN0IHR1cGxlMnJlY29yZCA9ICh0KSA9PiB7XG5cdGlmIChza2lwKHQpKSByZXR1cm4ge25vZGVUeXBlOiAnc2tpcCcsIGRhdGE6IHR9XG5cdGNvbnN0IFtub2RlVHlwZSwgcG9zaXRpb24sIC4uLmRhdGFdID0gdFxuXHRpZiAobm9kZVR5cGUgPT09ICdlbGVtZW50Jykge1xuXHRcdGNvbnN0IFtbdGFnTmFtZSwgY2xhc3NMaXN0LCBpZF0sIGJpbmRpbmcsIGNoaWxkTm9kZXNdID0gZGF0YVxuXHRcdHJldHVybiAoe25vZGVUeXBlLCBwb3NpdGlvbiwgbm9kZU5hbWU6IHRhZ05hbWUsIHRhZ05hbWUsIGNsYXNzTGlzdCwgaWQsIGJpbmRpbmcsIGNoaWxkTm9kZXN9KVxuXHR9XG5cdGlmIChoYXNDaGlsZE5vZGVzKG5vZGVUeXBlKSkge1xuXHRcdGNvbnN0IFtub2RlTmFtZSwgbm9kZVZhbHVlLCBjaGlsZE5vZGVzXSA9IGRhdGFcblx0XHRyZXR1cm4gKHtub2RlVHlwZSwgcG9zaXRpb24sIG5vZGVOYW1lLCBub2RlVmFsdWUsIGNoaWxkTm9kZXN9KVxuXHR9XG5cdHJldHVybiB7bm9kZVR5cGUsIHBvc2l0aW9uLCBkYXRhfVxufVxuXG5leHBvcnQgY29uc3QgcmVjb3JkMnR1cGxlID0gKHtub2RlVHlwZSwgcG9zaXRpb24sIC4uLmRhdGF9KSA9PiB7XG5cdGlmIChub2RlVHlwZSA9PT0gJ3NraXAnKSByZXR1cm4gZGF0YS5kYXRhXG5cdGlmIChub2RlVHlwZSA9PT0gJ2VsZW1lbnQnKSB7XG5cdFx0Y29uc3Qge3RhZ05hbWUsIGNsYXNzTGlzdCwgaWQsIGJpbmRpbmcsIGNoaWxkTm9kZXN9ID0gZGF0YVxuXHRcdHJldHVybiBbbm9kZVR5cGUsIHBvc2l0aW9uLCBbdGFnTmFtZSwgY2xhc3NMaXN0LCBpZF0sIGJpbmRpbmcsIGNoaWxkTm9kZXNdXG5cdH1cblx0aWYgKGhhc0NoaWxkTm9kZXMobm9kZVR5cGUpKSB7XG5cdFx0Y29uc3Qge25vZGVOYW1lLCBub2RlVmFsdWUsIGNoaWxkTm9kZXN9ID0gZGF0YVxuXHRcdHJldHVybiBbbm9kZVR5cGUsIHBvc2l0aW9uLCBub2RlTmFtZSwgbm9kZVZhbHVlLCBjaGlsZE5vZGVzXVxuXHR9XG5cdHJldHVybiAoW25vZGVUeXBlLCBwb3NpdGlvbiwgLi4uZGF0YS5kYXRhXSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHF1ZXJ5KGYsIG9yZGVyKSB7XG5cdGxldCBtYXRjaDFcblx0dGhpczo6dHJhdmVyc2Uobm9kZSA9PiB7XG5cdFx0aWYgKG1hdGNoMSkgcmV0dXJuIGZhbHNlXG5cdFx0aWYgKGYobm9kZSkpIHtcblx0XHRcdG1hdGNoMSA9IG5vZGVcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdH1cblx0fSwgb3JkZXIpXG5cdHJldHVybiBtYXRjaDEgPyByZWNvcmQydHVwbGUobWF0Y2gxKSA6IG1hdGNoMVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcXVlcnlBbGwoZiwgb3JkZXIpIHtcblx0Y29uc3QgbWF0Y2hlcyA9IFtdXG5cdHRoaXM6OnRyYXZlcnNlKG5vZGUgPT4ge1xuXHRcdGlmIChmKG5vZGUpKSBtYXRjaGVzLnB1c2gobm9kZSlcblx0fSwgb3JkZXIpXG5cdHJldHVybiBtYXRjaGVzXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmF2ZXJzZShmLCBvcmRlciA9ICdwcmUnLCB0cmF2ZXJzZUFsbCkge1xuXHRpZiAoc2tpcCh0aGlzKSkgcmV0dXJuIHRoaXNcblxuXHRpZiAoaXNOb2RlKHRoaXMpKSB7XG5cdFx0Y29uc3Qgbm9kZSA9IHR1cGxlMnJlY29yZCh0aGlzKVxuXHRcdGlmIChvcmRlciA9PT0gJ3Bvc3QnKSB0cmF2ZXJzZUNoaWxkTm9kZXMobm9kZSlcblx0XHRjb25zdCByZWN1cnNpdmUgPSBmKG5vZGUpXG5cdFx0aWYgKHJlY3Vyc2l2ZSB8fCByZWN1cnNpdmUgPT09IHVuZGVmaW5lZCAmJiBvcmRlciA9PT0gJ3ByZScpIHRyYXZlcnNlQ2hpbGROb2Rlcyhub2RlKVxuXHRcdHJldHVybiByZWNvcmQydHVwbGUobm9kZSlcblx0fVxuXG5cdGlmIChBcnJheS5pc0FycmF5KHRoaXMpKSB7XG5cdFx0cmV0dXJuIHRoaXMubWFwKGNoaWxkID0+IGNoaWxkOjp0cmF2ZXJzZShmLCBvcmRlciwgdHJhdmVyc2VBbGwpKVxuXHR9XG5cblx0dGhyb3cgbmV3IEVycm9yKHRoaXMpXG5cblx0ZnVuY3Rpb24gdHJhdmVyc2VDaGlsZE5vZGVzKG5vZGUpIHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheShub2RlLmNoaWxkTm9kZXMpKSB7XG5cdFx0XHRub2RlLmNoaWxkTm9kZXMgPSBub2RlLmNoaWxkTm9kZXMubWFwKGNoaWxkID0+IGNoaWxkOjp0cmF2ZXJzZShmLCBvcmRlciwgdHJhdmVyc2VBbGwpKVxuXHRcdH1cblx0XHRpZiAodHJhdmVyc2VBbGwpIHtcblx0XHRcdGlmIChBcnJheS5pc0FycmF5KG5vZGUuYmluZGluZykgJiYgaXNOb2RlKG5vZGUuYmluZGluZykpIHtcblx0XHRcdFx0bm9kZS5iaW5kaW5nID0gbm9kZS5iaW5kaW5nOjp0cmF2ZXJzZShmLCBvcmRlciwgdHJhdmVyc2VBbGwpXG5cdFx0XHR9XG5cdFx0XHQvLyBpZiAoQXJyYXkuaXNBcnJheShub2RlLmRhdGEpICYmIEFycmF5LmlzQXJyYXkobm9kZS5kYXRhW25vZGUuZGF0YS5sZW5ndGggLSAxXSkpIHtcblx0XHRcdC8vIFx0bm9kZS5kYXRhW25vZGUuZGF0YS5sZW5ndGggLSAxXSA9IG5vZGUuZGF0YVtub2RlLmRhdGEubGVuZ3RoIC0gMV0ubWFwKGNoaWxkID0+IGNoaWxkOjp0cmF2ZXJzZShmLCBvcmRlciwgdHJhdmVyc2VBbGwpKVxuXHRcdFx0Ly8gfVxuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBpc05vZGUobm9kZVR1cGxlKSB7XG5cdHJldHVybiAvXig/OmRvY3VtZW50fGVsZW1lbnR8YXR0cmlidXRlfHRleHR8Y29tbWVudHxzY3JpcHRzb3VyY2V8c3VwcHJlc3N8aW5qZWN0fGJpbmRpbmd8aW5zdHJ1Y3Rpb258bWFjcm98ZnJhZ21lbnR8U2VjdGlvbnxPZmZzaWRlfE1peGVkV2hpdGVzcGFjZXxFcnJvcikkLy50ZXN0KG5vZGVUdXBsZVswXSlcbn1cblxuZnVuY3Rpb24gc2tpcChub2RlVHVwbGUpIHtcblx0Y29uc3Qgd2hpdGUgPSAvXlxccyooPzpcXC9cXC8uKik/JC9cblx0aWYgKEFycmF5LmlzQXJyYXkobm9kZVR1cGxlKSkge1xuXHRcdGlmIChub2RlVHVwbGUubGVuZ3RoID09PSAxICYmIG5vZGVUdXBsZVswXSA9PT0gJ2Nsb3NlU3RhcnRUYWcnKSByZXR1cm4gdHJ1ZVxuXHRcdGlmIChub2RlVHVwbGUuZXZlcnkoeCA9PiB0eXBlb2YgeCA9PT0gJ3N0cmluZycgJiYgeC5sZW5ndGggPT09IDEpXG5cdFx0XHQmJiB3aGl0ZS50ZXN0KG5vZGVUdXBsZS5qb2luKCcnKSkpIHJldHVybiB0cnVlXG5cdH0gZWxzZSB7XG5cdFx0aWYgKHR5cGVvZiBub2RlVHVwbGUgPT09ICdzdHJpbmcnICYmIHdoaXRlLnRlc3Qobm9kZVR1cGxlKSkgcmV0dXJuIHRydWVcblx0XHR0aHJvdyBuZXcgRXJyb3Iobm9kZVR1cGxlKVxuXHR9XG59XG5cbmZ1bmN0aW9uIGhhc0NoaWxkTm9kZXMobm9kZVR5cGUpIHtcblx0c3dpdGNoIChub2RlVHlwZSkge1xuXHRcdGNhc2UgJ2RvY3VtZW50Jzpcblx0XHRjYXNlICdmcmFnbWVudCc6XG5cdFx0Y2FzZSAnZWxlbWVudCc6XG5cdFx0Y2FzZSAnYmluZGluZyc6XG5cdFx0Y2FzZSAnaW5zdHJ1Y3Rpb24nOlxuXHRcdGNhc2UgJ21hY3JvJzpcblx0XHRcdHJldHVybiB0cnVlXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBmYWxzZVxuXHR9XG59XG5cbi8vIGV4cG9ydCBmdW5jdGlvbiBtYXRjaChwYXR0ZXJuKSB7XG4vLyBcdGlmICh0eXBlb2YgcGF0dGVybiA9PT0gJ2Z1bmN0aW9uJyAmJiBwYXR0ZXJuLnByb3RvdHlwZSkgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBwYXR0ZXJuXG4vLyBcdGlmIChwYXR0ZXJuICYmIHR5cGVvZiBwYXR0ZXJuLnRlc3QgPT09ICdmdW5jdGlvbicpIHJldHVybiBwYXR0ZXJuLnRlc3QodGhpcylcbi8vIFx0c3dpdGNoICh0eXBlb2YgdGhpcykge1xuLy8gXHRcdGNhc2UgJ3VuZGVmaW5lZCc6XG4vLyBcdFx0Y2FzZSAnYm9vbGVhbic6XG4vLyBcdFx0Y2FzZSAnbnVtYmVyJzpcbi8vIFx0XHRjYXNlICdzdHJpbmcnOlxuLy8gXHRcdGNhc2UgJ3N5bWJvbCc6XG4vLyBcdFx0XHRyZXR1cm4gdGhpcyA9PT0gcGF0dGVyblxuLy8gXHRcdGNhc2UgJ29iamVjdCc6XG4vLyBcdFx0XHRpZiAodGhpcyA9PT0gbnVsbCkgcmV0dXJuIHBhdHRlcm4gPT09IG51bGxcbi8vIFx0XHRcdGlmIChBcnJheS5pc0FycmF5KHBhdHRlcm4pKSByZXR1cm4gcGF0dGVybi5ldmVyeSgocCwgaSkgPT4gdGhpc1tpXTo6bWF0Y2gocCkpXG4vLyBcdFx0XHRpZiAodHlwZW9mIHBhdHRlcm4gPT09ICdvYmplY3QnKSByZXR1cm4gT2JqZWN0LmtleXMocGF0dGVybikuZXZlcnkoa2V5ID0+IHRoaXNba2V5XTo6bWF0Y2gocGF0dGVybltrZXldKSlcbi8vIFx0XHRcdHJldHVybiBmYWxzZVxuLy8gXHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcignc2hvdWxkIG5vdCBiZSBmdW5jdGlvbicpXG4vLyBcdH1cbi8vIH1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==