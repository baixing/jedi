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
exports.errorInfo = errorInfo;

var _url = require('url');

var _fs = require('fs');

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

	if (skip(this)) {
		if (!traverseAll) return this;
		var node = tuple2record(this);
		f(node);
		return record2tuple(node);
	}
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
	return nodeTuple.length > 0 && /^(?:document|element|attribute|text|comment|scriptsource|suppress|inject|binding|instruction|macro|fragment|Section|Offside|MixedWhitespace|Error)$/.test(nodeTuple[0]);
}

function skip(nodeTuple) {
	var white = /^\s*(?:\/\/.*)?$/;
	if (Array.isArray(nodeTuple)) {
		if (nodeTuple.length === 1 && nodeTuple[0] === 'closeStartTag') return true;
		if (nodeTuple.length > 0 && nodeTuple.every(function (x) {
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
		case 'inject':
		case 'macro':
			return true;
		default:
			return false;
	}
}

function errorInfo(e, source) {

	var info = [];

	if (e.position) {
		var spaces;

		(function () {
			var _e$position = _slicedToArray(e.position, 3);

			var filename = _e$position[0];
			var line = _e$position[1];
			var col = _e$position[2];

			var errorType = e.message === 'Section' ? 'SyntaxError' : e.message;
			info.push([]);
			info.push(['Syntax error:', filename === '*' ? 'I guest it may be ' + source + ' , but not sure...' : filename]);
			info.push([]);

			var lines = (0, _fs.readFileSync)(filename === '*' ? source : filename).toString().split(/\r?\n/);
			lines[lines.length - 1] += '🔚';

			var startLine = Math.max(e.position[1] - 8, 0),
			    endLine = Math.min(e.position[1] + 7, lines.length);

			var showLines = lines.slice(startLine, endLine).map(function (line, i) {
				return startLine + i + 1 + ' | ' + line.replace(/\t/g, '    ');
			});

			spaces = ' '.repeat(String(line).length + 2 + col);

			showLines.splice(line - startLine, 0, spaces + '^', spaces + '|__ Ooops, ' + errorType + ' at line ' + line + ', column ' + col, spaces);

			showLines.forEach(function (l) {
				return info.push([l]);
			});
		})();
	} else {
		info.push([String(e.stack || e.message || e)]);
	}
	return info;
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
//# sourceMappingURL=data:application/json;base64,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QUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTs7QUFFcEQsT0FBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUNwRCxVQUFDLElBQUksRUFBRSxDQUFDO1dBQUssQUFBQyxTQUFTLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDO0lBQUEsQ0FBQyxDQUFBOztBQUVwRSxTQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7O0FBQ3RELFlBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLFNBQVMsRUFBRSxDQUFDLEVBQ25DLE1BQU0sR0FBRyxHQUFHLEVBQ1osTUFBTSxHQUFHLGFBQWEsR0FBRyxTQUFTLEdBQUcsV0FBVyxHQUFHLElBQUksR0FBRyxXQUFXLEdBQUcsR0FBRyxFQUMzRSxNQUFNLENBQUMsQ0FBQTs7QUFFUixZQUFTLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQztXQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUFBLENBQUMsQ0FBQTs7RUFFdEMsTUFBTTtBQUNOLE1BQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtFQUM5QztBQUNELFFBQU8sSUFBSSxDQUFBO0NBQ1g7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEiLCJmaWxlIjoidXRpbDIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3Jlc29sdmUgYXMgcmVzb2x2ZVBhdGh9IGZyb20gJ3VybCdcbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlKG5hbWUsIHJlZmVycmVyKSB7XG5cdHJldHVybiByZXNvbHZlUGF0aChyZWZlcnJlciwgbmFtZSlcbn1cblxuZXhwb3J0IGNvbnN0IHR1cGxlMnJlY29yZCA9ICh0KSA9PiB7XG5cdGlmIChza2lwKHQpKSByZXR1cm4ge25vZGVUeXBlOiAnc2tpcCcsIGRhdGE6IHR9XG5cdGNvbnN0IFtub2RlVHlwZSwgcG9zaXRpb24sIC4uLmRhdGFdID0gdFxuXHRpZiAobm9kZVR5cGUgPT09ICdlbGVtZW50Jykge1xuXHRcdGNvbnN0IFtbdGFnTmFtZSwgY2xhc3NMaXN0LCBpZF0sIGJpbmRpbmcsIGNoaWxkTm9kZXNdID0gZGF0YVxuXHRcdHJldHVybiAoe25vZGVUeXBlLCBwb3NpdGlvbiwgbm9kZU5hbWU6IHRhZ05hbWUsIHRhZ05hbWUsIGNsYXNzTGlzdCwgaWQsIGJpbmRpbmcsIGNoaWxkTm9kZXN9KVxuXHR9XG5cdGlmIChoYXNDaGlsZE5vZGVzKG5vZGVUeXBlKSkge1xuXHRcdGNvbnN0IFtub2RlTmFtZSwgbm9kZVZhbHVlLCBjaGlsZE5vZGVzXSA9IGRhdGFcblx0XHRyZXR1cm4ge25vZGVUeXBlLCBwb3NpdGlvbiwgbm9kZU5hbWUsIG5vZGVWYWx1ZSwgY2hpbGROb2Rlc31cblx0fVxuXHRyZXR1cm4ge25vZGVUeXBlLCBwb3NpdGlvbiwgZGF0YX1cbn1cblxuZXhwb3J0IGNvbnN0IHJlY29yZDJ0dXBsZSA9ICh7bm9kZVR5cGUsIHBvc2l0aW9uLCAuLi5kYXRhfSkgPT4ge1xuXHRpZiAobm9kZVR5cGUgPT09ICdza2lwJykgcmV0dXJuIGRhdGEuZGF0YVxuXHRpZiAobm9kZVR5cGUgPT09ICdlbGVtZW50Jykge1xuXHRcdGNvbnN0IHt0YWdOYW1lLCBjbGFzc0xpc3QsIGlkLCBiaW5kaW5nLCBjaGlsZE5vZGVzfSA9IGRhdGFcblx0XHRyZXR1cm4gW25vZGVUeXBlLCBwb3NpdGlvbiwgW3RhZ05hbWUsIGNsYXNzTGlzdCwgaWRdLCBiaW5kaW5nLCBjaGlsZE5vZGVzXVxuXHR9XG5cdGlmIChoYXNDaGlsZE5vZGVzKG5vZGVUeXBlKSkge1xuXHRcdGNvbnN0IHtub2RlTmFtZSwgbm9kZVZhbHVlLCBjaGlsZE5vZGVzfSA9IGRhdGFcblx0XHRyZXR1cm4gW25vZGVUeXBlLCBwb3NpdGlvbiwgbm9kZU5hbWUsIG5vZGVWYWx1ZSwgY2hpbGROb2Rlc11cblx0fVxuXHRyZXR1cm4gW25vZGVUeXBlLCBwb3NpdGlvbiwgLi4uZGF0YS5kYXRhXVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcXVlcnkoZiwgb3JkZXIpIHtcblx0bGV0IG1hdGNoMVxuXHR0aGlzOjp0cmF2ZXJzZShub2RlID0+IHtcblx0XHRpZiAobWF0Y2gxKSByZXR1cm4gZmFsc2Vcblx0XHRpZiAoZihub2RlKSkge1xuXHRcdFx0bWF0Y2gxID0gbm9kZVxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0fVxuXHR9LCBvcmRlcilcblx0cmV0dXJuIG1hdGNoMSA/IHJlY29yZDJ0dXBsZShtYXRjaDEpIDogbWF0Y2gxXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBxdWVyeUFsbChmLCBvcmRlcikge1xuXHRjb25zdCBtYXRjaGVzID0gW11cblx0dGhpczo6dHJhdmVyc2Uobm9kZSA9PiB7XG5cdFx0aWYgKGYobm9kZSkpIG1hdGNoZXMucHVzaChub2RlKVxuXHR9LCBvcmRlcilcblx0cmV0dXJuIG1hdGNoZXNcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYXZlcnNlKGYsIG9yZGVyID0gJ3ByZScsIHRyYXZlcnNlQWxsKSB7XG5cdGlmIChza2lwKHRoaXMpKSB7XG5cdFx0aWYgKCF0cmF2ZXJzZUFsbCkgcmV0dXJuIHRoaXNcblx0XHRjb25zdCBub2RlID0gdHVwbGUycmVjb3JkKHRoaXMpXG5cdFx0Zihub2RlKVxuXHRcdHJldHVybiByZWNvcmQydHVwbGUobm9kZSlcblx0fVxuXHRpZiAoaXNOb2RlKHRoaXMpKSB7XG5cdFx0Y29uc3Qgbm9kZSA9IHR1cGxlMnJlY29yZCh0aGlzKVxuXHRcdGlmIChvcmRlciA9PT0gJ3Bvc3QnKSB0cmF2ZXJzZUNoaWxkTm9kZXMobm9kZSlcblx0XHRjb25zdCByZWN1cnNpdmUgPSBmKG5vZGUpXG5cdFx0aWYgKHJlY3Vyc2l2ZSB8fCByZWN1cnNpdmUgPT09IHVuZGVmaW5lZCAmJiBvcmRlciA9PT0gJ3ByZScpIHRyYXZlcnNlQ2hpbGROb2Rlcyhub2RlKVxuXHRcdHJldHVybiByZWNvcmQydHVwbGUobm9kZSlcblx0fVxuXG5cdGlmIChBcnJheS5pc0FycmF5KHRoaXMpKSB7XG5cdFx0cmV0dXJuIHRoaXMubWFwKGNoaWxkID0+IGNoaWxkOjp0cmF2ZXJzZShmLCBvcmRlciwgdHJhdmVyc2VBbGwpKVxuXHR9XG5cblx0dGhyb3cgbmV3IEVycm9yKHRoaXMpXG5cblx0ZnVuY3Rpb24gdHJhdmVyc2VDaGlsZE5vZGVzKG5vZGUpIHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheShub2RlLmNoaWxkTm9kZXMpKSB7XG5cdFx0XHRub2RlLmNoaWxkTm9kZXMgPSBub2RlLmNoaWxkTm9kZXMubWFwKGNoaWxkID0+IGNoaWxkOjp0cmF2ZXJzZShmLCBvcmRlciwgdHJhdmVyc2VBbGwpKVxuXHRcdH1cblx0XHRpZiAodHJhdmVyc2VBbGwpIHtcblx0XHRcdGlmIChBcnJheS5pc0FycmF5KG5vZGUuYmluZGluZykgJiYgaXNOb2RlKG5vZGUuYmluZGluZykpIHtcblx0XHRcdFx0bm9kZS5iaW5kaW5nID0gbm9kZS5iaW5kaW5nOjp0cmF2ZXJzZShmLCBvcmRlciwgdHJhdmVyc2VBbGwpXG5cdFx0XHR9XG5cdFx0XHQvLyBpZiAoQXJyYXkuaXNBcnJheShub2RlLmRhdGEpICYmIEFycmF5LmlzQXJyYXkobm9kZS5kYXRhW25vZGUuZGF0YS5sZW5ndGggLSAxXSkpIHtcblx0XHRcdC8vIFx0bm9kZS5kYXRhW25vZGUuZGF0YS5sZW5ndGggLSAxXSA9IG5vZGUuZGF0YVtub2RlLmRhdGEubGVuZ3RoIC0gMV0ubWFwKGNoaWxkID0+IGNoaWxkOjp0cmF2ZXJzZShmLCBvcmRlciwgdHJhdmVyc2VBbGwpKVxuXHRcdFx0Ly8gfVxuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBpc05vZGUobm9kZVR1cGxlKSB7XG5cdHJldHVybiBub2RlVHVwbGUubGVuZ3RoID4gMFxuXHRcdCYmIC9eKD86ZG9jdW1lbnR8ZWxlbWVudHxhdHRyaWJ1dGV8dGV4dHxjb21tZW50fHNjcmlwdHNvdXJjZXxzdXBwcmVzc3xpbmplY3R8YmluZGluZ3xpbnN0cnVjdGlvbnxtYWNyb3xmcmFnbWVudHxTZWN0aW9ufE9mZnNpZGV8TWl4ZWRXaGl0ZXNwYWNlfEVycm9yKSQvLnRlc3Qobm9kZVR1cGxlWzBdKVxufVxuXG5mdW5jdGlvbiBza2lwKG5vZGVUdXBsZSkge1xuXHRjb25zdCB3aGl0ZSA9IC9eXFxzKig/OlxcL1xcLy4qKT8kL1xuXHRpZiAoQXJyYXkuaXNBcnJheShub2RlVHVwbGUpKSB7XG5cdFx0aWYgKG5vZGVUdXBsZS5sZW5ndGggPT09IDEgJiYgbm9kZVR1cGxlWzBdID09PSAnY2xvc2VTdGFydFRhZycpIHJldHVybiB0cnVlXG5cdFx0aWYgKG5vZGVUdXBsZS5sZW5ndGggPiAwICYmIG5vZGVUdXBsZS5ldmVyeSh4ID0+IHR5cGVvZiB4ID09PSAnc3RyaW5nJyAmJiB4Lmxlbmd0aCA9PT0gMSlcblx0XHRcdCYmIHdoaXRlLnRlc3Qobm9kZVR1cGxlLmpvaW4oJycpKSkgcmV0dXJuIHRydWVcblx0fSBlbHNlIHtcblx0XHRpZiAodHlwZW9mIG5vZGVUdXBsZSA9PT0gJ3N0cmluZycgJiYgd2hpdGUudGVzdChub2RlVHVwbGUpKSByZXR1cm4gdHJ1ZVxuXHRcdHRocm93IG5ldyBFcnJvcihub2RlVHVwbGUpXG5cdH1cbn1cblxuZnVuY3Rpb24gaGFzQ2hpbGROb2Rlcyhub2RlVHlwZSkge1xuXHRzd2l0Y2ggKG5vZGVUeXBlKSB7XG5cdFx0Y2FzZSAnZG9jdW1lbnQnOlxuXHRcdGNhc2UgJ2ZyYWdtZW50Jzpcblx0XHRjYXNlICdlbGVtZW50Jzpcblx0XHRjYXNlICdiaW5kaW5nJzpcblx0XHRjYXNlICdpbnN0cnVjdGlvbic6XG5cdFx0Y2FzZSAnaW5qZWN0Jzpcblx0XHRjYXNlICdtYWNybyc6XG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0fVxufVxuXG5pbXBvcnQge3JlYWRGaWxlU3luY30gZnJvbSAnZnMnXG5leHBvcnQgZnVuY3Rpb24gZXJyb3JJbmZvKGUsIHNvdXJjZSkge1xuXG5cdGNvbnN0IGluZm8gPSBbXVxuXG5cdGlmIChlLnBvc2l0aW9uKSB7XG5cblx0XHRjb25zdCBbZmlsZW5hbWUsIGxpbmUsIGNvbF0gPSBlLnBvc2l0aW9uXG5cdFx0Y29uc3QgZXJyb3JUeXBlID0gZS5tZXNzYWdlID09PSAnU2VjdGlvbicgPyAnU3ludGF4RXJyb3InIDogZS5tZXNzYWdlXG5cdFx0aW5mby5wdXNoKFtdKVxuXHRcdGluZm8ucHVzaChbJ1N5bnRheCBlcnJvcjonLFxuXHRcdFx0ZmlsZW5hbWUgPT09ICcqJ1xuXHRcdFx0PyBgSSBndWVzdCBpdCBtYXkgYmUgJHtzb3VyY2V9ICwgYnV0IG5vdCBzdXJlLi4uYFxuXHRcdFx0OiBmaWxlbmFtZVxuXHRcdF0pXG5cdFx0aW5mby5wdXNoKFtdKVxuXG5cdFx0Y29uc3QgbGluZXMgPSByZWFkRmlsZVN5bmMoZmlsZW5hbWUgPT09ICcqJyA/IHNvdXJjZSA6IGZpbGVuYW1lKS50b1N0cmluZygpLnNwbGl0KC9cXHI/XFxuLylcblx0XHRsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSArPSAnXFx1ezFGNTFBfSdcblxuXHRcdGNvbnN0IHN0YXJ0TGluZSA9IE1hdGgubWF4KGUucG9zaXRpb25bMV0gLSA4LCAwKSxcblx0XHRcdGVuZExpbmUgPSBNYXRoLm1pbihlLnBvc2l0aW9uWzFdICsgNywgbGluZXMubGVuZ3RoKVxuXG5cdFx0Y29uc3Qgc2hvd0xpbmVzID0gbGluZXMuc2xpY2Uoc3RhcnRMaW5lLCBlbmRMaW5lKS5tYXAoXG5cdFx0XHQobGluZSwgaSkgPT4gKHN0YXJ0TGluZSArIGkgKyAxKSArICcgfCAnICsgbGluZS5yZXBsYWNlKC9cXHQvZywgJyAgICAnKSlcblxuXHRcdHZhciBzcGFjZXMgPSAnICcucmVwZWF0KFN0cmluZyhsaW5lKS5sZW5ndGggKyAyICsgY29sKVxuXHRcdHNob3dMaW5lcy5zcGxpY2UobGluZSAtIHN0YXJ0TGluZSwgMCxcblx0XHRcdHNwYWNlcyArICdeJyxcblx0XHRcdHNwYWNlcyArICd8X18gT29vcHMsICcgKyBlcnJvclR5cGUgKyAnIGF0IGxpbmUgJyArIGxpbmUgKyAnLCBjb2x1bW4gJyArIGNvbCxcblx0XHRcdHNwYWNlcylcblxuXHRcdHNob3dMaW5lcy5mb3JFYWNoKGwgPT4gaW5mby5wdXNoKFtsXSkpXG5cblx0fSBlbHNlIHtcblx0XHRpbmZvLnB1c2goW1N0cmluZyhlLnN0YWNrIHx8IGUubWVzc2FnZSB8fCBlKV0pXG5cdH1cblx0cmV0dXJuIGluZm9cbn1cblxuLy8gZXhwb3J0IGZ1bmN0aW9uIG1hdGNoKHBhdHRlcm4pIHtcbi8vIFx0aWYgKHR5cGVvZiBwYXR0ZXJuID09PSAnZnVuY3Rpb24nICYmIHBhdHRlcm4ucHJvdG90eXBlKSByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIHBhdHRlcm5cbi8vIFx0aWYgKHBhdHRlcm4gJiYgdHlwZW9mIHBhdHRlcm4udGVzdCA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHBhdHRlcm4udGVzdCh0aGlzKVxuLy8gXHRzd2l0Y2ggKHR5cGVvZiB0aGlzKSB7XG4vLyBcdFx0Y2FzZSAndW5kZWZpbmVkJzpcbi8vIFx0XHRjYXNlICdib29sZWFuJzpcbi8vIFx0XHRjYXNlICdudW1iZXInOlxuLy8gXHRcdGNhc2UgJ3N0cmluZyc6XG4vLyBcdFx0Y2FzZSAnc3ltYm9sJzpcbi8vIFx0XHRcdHJldHVybiB0aGlzID09PSBwYXR0ZXJuXG4vLyBcdFx0Y2FzZSAnb2JqZWN0Jzpcbi8vIFx0XHRcdGlmICh0aGlzID09PSBudWxsKSByZXR1cm4gcGF0dGVybiA9PT0gbnVsbFxuLy8gXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkocGF0dGVybikpIHJldHVybiBwYXR0ZXJuLmV2ZXJ5KChwLCBpKSA9PiB0aGlzW2ldOjptYXRjaChwKSlcbi8vIFx0XHRcdGlmICh0eXBlb2YgcGF0dGVybiA9PT0gJ29iamVjdCcpIHJldHVybiBPYmplY3Qua2V5cyhwYXR0ZXJuKS5ldmVyeShrZXkgPT4gdGhpc1trZXldOjptYXRjaChwYXR0ZXJuW2tleV0pKVxuLy8gXHRcdFx0cmV0dXJuIGZhbHNlXG4vLyBcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKCdzaG91bGQgbm90IGJlIGZ1bmN0aW9uJylcbi8vIFx0fVxuLy8gfVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9