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
//# sourceMappingURL=data:application/json;base64,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T0FBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUNwRCxVQUFDLElBQUksRUFBRSxDQUFDO1dBQUssQUFBQyxTQUFTLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDO0lBQUEsQ0FBQyxDQUFBOztBQUVwRSxTQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7O0FBQ3RELFlBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLFNBQVMsRUFBRSxDQUFDLEVBQ25DLE1BQU0sR0FBRyxHQUFHLEVBQ1osTUFBTSxHQUFHLGFBQWEsR0FBRyxTQUFTLEdBQUcsV0FBVyxHQUFHLElBQUksR0FBRyxXQUFXLEdBQUcsR0FBRyxFQUMzRSxNQUFNLENBQUMsQ0FBQTs7QUFFUixZQUFTLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQztXQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUFBLENBQUMsQ0FBQTs7RUFFdEMsTUFBTTtBQUNOLE1BQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtFQUM5QztBQUNELFFBQU8sSUFBSSxDQUFBO0NBQ1g7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEiLCJmaWxlIjoidXRpbDIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3Jlc29sdmUgYXMgcmVzb2x2ZVBhdGh9IGZyb20gJ3VybCdcbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlKG5hbWUsIHJlZmVycmVyKSB7XG5cdHJldHVybiByZXNvbHZlUGF0aChyZWZlcnJlciwgbmFtZSlcbn1cblxuZXhwb3J0IGNvbnN0IHR1cGxlMnJlY29yZCA9ICh0KSA9PiB7XG5cdGlmIChza2lwKHQpKSByZXR1cm4ge25vZGVUeXBlOiAnc2tpcCcsIGRhdGE6IHR9XG5cdGNvbnN0IFtub2RlVHlwZSwgcG9zaXRpb24sIC4uLmRhdGFdID0gdFxuXHRpZiAobm9kZVR5cGUgPT09ICdlbGVtZW50Jykge1xuXHRcdGNvbnN0IFtbdGFnTmFtZSwgY2xhc3NMaXN0LCBpZF0sIGJpbmRpbmcsIGNoaWxkTm9kZXNdID0gZGF0YVxuXHRcdHJldHVybiAoe25vZGVUeXBlLCBwb3NpdGlvbiwgbm9kZU5hbWU6IHRhZ05hbWUsIHRhZ05hbWUsIGNsYXNzTGlzdCwgaWQsIGJpbmRpbmcsIGNoaWxkTm9kZXN9KVxuXHR9XG5cdGlmIChoYXNDaGlsZE5vZGVzKG5vZGVUeXBlKSkge1xuXHRcdGNvbnN0IFtub2RlTmFtZSwgbm9kZVZhbHVlLCBjaGlsZE5vZGVzXSA9IGRhdGFcblx0XHRyZXR1cm4gKHtub2RlVHlwZSwgcG9zaXRpb24sIG5vZGVOYW1lLCBub2RlVmFsdWUsIGNoaWxkTm9kZXN9KVxuXHR9XG5cdHJldHVybiB7bm9kZVR5cGUsIHBvc2l0aW9uLCBkYXRhfVxufVxuXG5leHBvcnQgY29uc3QgcmVjb3JkMnR1cGxlID0gKHtub2RlVHlwZSwgcG9zaXRpb24sIC4uLmRhdGF9KSA9PiB7XG5cdGlmIChub2RlVHlwZSA9PT0gJ3NraXAnKSByZXR1cm4gZGF0YS5kYXRhXG5cdGlmIChub2RlVHlwZSA9PT0gJ2VsZW1lbnQnKSB7XG5cdFx0Y29uc3Qge3RhZ05hbWUsIGNsYXNzTGlzdCwgaWQsIGJpbmRpbmcsIGNoaWxkTm9kZXN9ID0gZGF0YVxuXHRcdHJldHVybiBbbm9kZVR5cGUsIHBvc2l0aW9uLCBbdGFnTmFtZSwgY2xhc3NMaXN0LCBpZF0sIGJpbmRpbmcsIGNoaWxkTm9kZXNdXG5cdH1cblx0aWYgKGhhc0NoaWxkTm9kZXMobm9kZVR5cGUpKSB7XG5cdFx0Y29uc3Qge25vZGVOYW1lLCBub2RlVmFsdWUsIGNoaWxkTm9kZXN9ID0gZGF0YVxuXHRcdHJldHVybiBbbm9kZVR5cGUsIHBvc2l0aW9uLCBub2RlTmFtZSwgbm9kZVZhbHVlLCBjaGlsZE5vZGVzXVxuXHR9XG5cdHJldHVybiBbbm9kZVR5cGUsIHBvc2l0aW9uLCAuLi5kYXRhLmRhdGFdXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBxdWVyeShmLCBvcmRlcikge1xuXHRsZXQgbWF0Y2gxXG5cdHRoaXM6OnRyYXZlcnNlKG5vZGUgPT4ge1xuXHRcdGlmIChtYXRjaDEpIHJldHVybiBmYWxzZVxuXHRcdGlmIChmKG5vZGUpKSB7XG5cdFx0XHRtYXRjaDEgPSBub2RlXG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHR9XG5cdH0sIG9yZGVyKVxuXHRyZXR1cm4gbWF0Y2gxID8gcmVjb3JkMnR1cGxlKG1hdGNoMSkgOiBtYXRjaDFcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHF1ZXJ5QWxsKGYsIG9yZGVyKSB7XG5cdGNvbnN0IG1hdGNoZXMgPSBbXVxuXHR0aGlzOjp0cmF2ZXJzZShub2RlID0+IHtcblx0XHRpZiAoZihub2RlKSkgbWF0Y2hlcy5wdXNoKG5vZGUpXG5cdH0sIG9yZGVyKVxuXHRyZXR1cm4gbWF0Y2hlc1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhdmVyc2UoZiwgb3JkZXIgPSAncHJlJywgdHJhdmVyc2VBbGwpIHtcblx0aWYgKHNraXAodGhpcykpIHtcblx0XHRpZiAoIXRyYXZlcnNlQWxsKSByZXR1cm4gdGhpc1xuXHRcdGNvbnN0IG5vZGUgPSB0dXBsZTJyZWNvcmQodGhpcylcblx0XHRmKG5vZGUpXG5cdFx0cmV0dXJuIHJlY29yZDJ0dXBsZShub2RlKVxuXHR9XG5cdGlmIChpc05vZGUodGhpcykpIHtcblx0XHRjb25zdCBub2RlID0gdHVwbGUycmVjb3JkKHRoaXMpXG5cdFx0aWYgKG9yZGVyID09PSAncG9zdCcpIHRyYXZlcnNlQ2hpbGROb2Rlcyhub2RlKVxuXHRcdGNvbnN0IHJlY3Vyc2l2ZSA9IGYobm9kZSlcblx0XHRpZiAocmVjdXJzaXZlIHx8IHJlY3Vyc2l2ZSA9PT0gdW5kZWZpbmVkICYmIG9yZGVyID09PSAncHJlJykgdHJhdmVyc2VDaGlsZE5vZGVzKG5vZGUpXG5cdFx0cmV0dXJuIHJlY29yZDJ0dXBsZShub2RlKVxuXHR9XG5cblx0aWYgKEFycmF5LmlzQXJyYXkodGhpcykpIHtcblx0XHRyZXR1cm4gdGhpcy5tYXAoY2hpbGQgPT4gY2hpbGQ6OnRyYXZlcnNlKGYsIG9yZGVyLCB0cmF2ZXJzZUFsbCkpXG5cdH1cblxuXHR0aHJvdyBuZXcgRXJyb3IodGhpcylcblxuXHRmdW5jdGlvbiB0cmF2ZXJzZUNoaWxkTm9kZXMobm9kZSkge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KG5vZGUuY2hpbGROb2RlcykpIHtcblx0XHRcdG5vZGUuY2hpbGROb2RlcyA9IG5vZGUuY2hpbGROb2Rlcy5tYXAoY2hpbGQgPT4gY2hpbGQ6OnRyYXZlcnNlKGYsIG9yZGVyLCB0cmF2ZXJzZUFsbCkpXG5cdFx0fVxuXHRcdGlmICh0cmF2ZXJzZUFsbCkge1xuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkobm9kZS5iaW5kaW5nKSAmJiBpc05vZGUobm9kZS5iaW5kaW5nKSkge1xuXHRcdFx0XHRub2RlLmJpbmRpbmcgPSBub2RlLmJpbmRpbmc6OnRyYXZlcnNlKGYsIG9yZGVyLCB0cmF2ZXJzZUFsbClcblx0XHRcdH1cblx0XHRcdC8vIGlmIChBcnJheS5pc0FycmF5KG5vZGUuZGF0YSkgJiYgQXJyYXkuaXNBcnJheShub2RlLmRhdGFbbm9kZS5kYXRhLmxlbmd0aCAtIDFdKSkge1xuXHRcdFx0Ly8gXHRub2RlLmRhdGFbbm9kZS5kYXRhLmxlbmd0aCAtIDFdID0gbm9kZS5kYXRhW25vZGUuZGF0YS5sZW5ndGggLSAxXS5tYXAoY2hpbGQgPT4gY2hpbGQ6OnRyYXZlcnNlKGYsIG9yZGVyLCB0cmF2ZXJzZUFsbCkpXG5cdFx0XHQvLyB9XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGlzTm9kZShub2RlVHVwbGUpIHtcblx0cmV0dXJuIC9eKD86ZG9jdW1lbnR8ZWxlbWVudHxhdHRyaWJ1dGV8dGV4dHxjb21tZW50fHNjcmlwdHNvdXJjZXxzdXBwcmVzc3xpbmplY3R8YmluZGluZ3xpbnN0cnVjdGlvbnxtYWNyb3xmcmFnbWVudHxTZWN0aW9ufE9mZnNpZGV8TWl4ZWRXaGl0ZXNwYWNlfEVycm9yKSQvLnRlc3Qobm9kZVR1cGxlWzBdKVxufVxuXG5mdW5jdGlvbiBza2lwKG5vZGVUdXBsZSkge1xuXHRjb25zdCB3aGl0ZSA9IC9eXFxzKig/OlxcL1xcLy4qKT8kL1xuXHRpZiAoQXJyYXkuaXNBcnJheShub2RlVHVwbGUpKSB7XG5cdFx0aWYgKG5vZGVUdXBsZS5sZW5ndGggPT09IDEgJiYgbm9kZVR1cGxlWzBdID09PSAnY2xvc2VTdGFydFRhZycpIHJldHVybiB0cnVlXG5cdFx0aWYgKG5vZGVUdXBsZS5ldmVyeSh4ID0+IHR5cGVvZiB4ID09PSAnc3RyaW5nJyAmJiB4Lmxlbmd0aCA9PT0gMSlcblx0XHRcdCYmIHdoaXRlLnRlc3Qobm9kZVR1cGxlLmpvaW4oJycpKSkgcmV0dXJuIHRydWVcblx0fSBlbHNlIHtcblx0XHRpZiAodHlwZW9mIG5vZGVUdXBsZSA9PT0gJ3N0cmluZycgJiYgd2hpdGUudGVzdChub2RlVHVwbGUpKSByZXR1cm4gdHJ1ZVxuXHRcdHRocm93IG5ldyBFcnJvcihub2RlVHVwbGUpXG5cdH1cbn1cblxuZnVuY3Rpb24gaGFzQ2hpbGROb2Rlcyhub2RlVHlwZSkge1xuXHRzd2l0Y2ggKG5vZGVUeXBlKSB7XG5cdFx0Y2FzZSAnZG9jdW1lbnQnOlxuXHRcdGNhc2UgJ2ZyYWdtZW50Jzpcblx0XHRjYXNlICdlbGVtZW50Jzpcblx0XHRjYXNlICdiaW5kaW5nJzpcblx0XHRjYXNlICdpbnN0cnVjdGlvbic6XG5cdFx0Y2FzZSAnbWFjcm8nOlxuXHRcdFx0cmV0dXJuIHRydWVcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdH1cbn1cblxuaW1wb3J0IHtyZWFkRmlsZVN5bmN9IGZyb20gJ2ZzJ1xuZXhwb3J0IGZ1bmN0aW9uIGVycm9ySW5mbyhlLCBzb3VyY2UpIHtcblxuXHRjb25zdCBpbmZvID0gW11cblxuXHRpZiAoZS5wb3NpdGlvbikge1xuXG5cdFx0Y29uc3QgW2ZpbGVuYW1lLCBsaW5lLCBjb2xdID0gZS5wb3NpdGlvblxuXHRcdGNvbnN0IGVycm9yVHlwZSA9IGUubWVzc2FnZSA9PT0gJ1NlY3Rpb24nID8gJ1N5bnRheEVycm9yJyA6IGUubWVzc2FnZVxuXHRcdGluZm8ucHVzaChbXSlcblx0XHRpbmZvLnB1c2goWydTeW50YXggZXJyb3I6Jyxcblx0XHRcdGZpbGVuYW1lID09PSAnKidcblx0XHRcdD8gYEkgZ3Vlc3QgaXQgbWF5IGJlICR7c291cmNlfSAsIGJ1dCBub3Qgc3VyZS4uLmBcblx0XHRcdDogZmlsZW5hbWVcblx0XHRdKVxuXHRcdGluZm8ucHVzaChbXSlcblxuXHRcdGNvbnN0IGxpbmVzID0gcmVhZEZpbGVTeW5jKGZpbGVuYW1lID09PSAnKicgPyBzb3VyY2UgOiBmaWxlbmFtZSkudG9TdHJpbmcoKS5zcGxpdCgvXFxyP1xcbi8pXG5cdFx0bGluZXNbbGluZXMubGVuZ3RoIC0gMV0gKz0gJ1xcdXsxRjUxQX0nXG5cblx0XHRjb25zdCBzdGFydExpbmUgPSBNYXRoLm1heChlLnBvc2l0aW9uWzFdIC0gOCwgMCksXG5cdFx0XHRlbmRMaW5lID0gTWF0aC5taW4oZS5wb3NpdGlvblsxXSArIDcsIGxpbmVzLmxlbmd0aClcblxuXHRcdGNvbnN0IHNob3dMaW5lcyA9IGxpbmVzLnNsaWNlKHN0YXJ0TGluZSwgZW5kTGluZSkubWFwKFxuXHRcdFx0KGxpbmUsIGkpID0+IChzdGFydExpbmUgKyBpICsgMSkgKyAnIHwgJyArIGxpbmUucmVwbGFjZSgvXFx0L2csICcgICAgJykpXG5cblx0XHR2YXIgc3BhY2VzID0gJyAnLnJlcGVhdChTdHJpbmcobGluZSkubGVuZ3RoICsgMiArIGNvbClcblx0XHRzaG93TGluZXMuc3BsaWNlKGxpbmUgLSBzdGFydExpbmUsIDAsXG5cdFx0XHRzcGFjZXMgKyAnXicsXG5cdFx0XHRzcGFjZXMgKyAnfF9fIE9vb3BzLCAnICsgZXJyb3JUeXBlICsgJyBhdCBsaW5lICcgKyBsaW5lICsgJywgY29sdW1uICcgKyBjb2wsXG5cdFx0XHRzcGFjZXMpXG5cblx0XHRzaG93TGluZXMuZm9yRWFjaChsID0+IGluZm8ucHVzaChbbF0pKVxuXG5cdH0gZWxzZSB7XG5cdFx0aW5mby5wdXNoKFtTdHJpbmcoZS5zdGFjayB8fCBlLm1lc3NhZ2UgfHwgZSldKVxuXHR9XG5cdHJldHVybiBpbmZvXG59XG5cbi8vIGV4cG9ydCBmdW5jdGlvbiBtYXRjaChwYXR0ZXJuKSB7XG4vLyBcdGlmICh0eXBlb2YgcGF0dGVybiA9PT0gJ2Z1bmN0aW9uJyAmJiBwYXR0ZXJuLnByb3RvdHlwZSkgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBwYXR0ZXJuXG4vLyBcdGlmIChwYXR0ZXJuICYmIHR5cGVvZiBwYXR0ZXJuLnRlc3QgPT09ICdmdW5jdGlvbicpIHJldHVybiBwYXR0ZXJuLnRlc3QodGhpcylcbi8vIFx0c3dpdGNoICh0eXBlb2YgdGhpcykge1xuLy8gXHRcdGNhc2UgJ3VuZGVmaW5lZCc6XG4vLyBcdFx0Y2FzZSAnYm9vbGVhbic6XG4vLyBcdFx0Y2FzZSAnbnVtYmVyJzpcbi8vIFx0XHRjYXNlICdzdHJpbmcnOlxuLy8gXHRcdGNhc2UgJ3N5bWJvbCc6XG4vLyBcdFx0XHRyZXR1cm4gdGhpcyA9PT0gcGF0dGVyblxuLy8gXHRcdGNhc2UgJ29iamVjdCc6XG4vLyBcdFx0XHRpZiAodGhpcyA9PT0gbnVsbCkgcmV0dXJuIHBhdHRlcm4gPT09IG51bGxcbi8vIFx0XHRcdGlmIChBcnJheS5pc0FycmF5KHBhdHRlcm4pKSByZXR1cm4gcGF0dGVybi5ldmVyeSgocCwgaSkgPT4gdGhpc1tpXTo6bWF0Y2gocCkpXG4vLyBcdFx0XHRpZiAodHlwZW9mIHBhdHRlcm4gPT09ICdvYmplY3QnKSByZXR1cm4gT2JqZWN0LmtleXMocGF0dGVybikuZXZlcnkoa2V5ID0+IHRoaXNba2V5XTo6bWF0Y2gocGF0dGVybltrZXldKSlcbi8vIFx0XHRcdHJldHVybiBmYWxzZVxuLy8gXHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcignc2hvdWxkIG5vdCBiZSBmdW5jdGlvbicpXG4vLyBcdH1cbi8vIH1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==