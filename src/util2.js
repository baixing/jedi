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
//# sourceMappingURL=data:application/json;base64,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QUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUE7O0FBRXBELE9BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FDcEQsVUFBQyxJQUFJLEVBQUUsQ0FBQztXQUFLLEFBQUMsU0FBUyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQztJQUFBLENBQUMsQ0FBQTs7QUFFcEUsU0FBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDOztBQUN0RCxZQUFTLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxTQUFTLEVBQUUsQ0FBQyxFQUNuQyxNQUFNLEdBQUcsR0FBRyxFQUNaLE1BQU0sR0FBRyxhQUFhLEdBQUcsU0FBUyxHQUFHLFdBQVcsR0FBRyxJQUFJLEdBQUcsV0FBVyxHQUFHLEdBQUcsRUFDM0UsTUFBTSxDQUFDLENBQUE7O0FBRVIsWUFBUyxDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUM7V0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFBQSxDQUFDLENBQUE7O0VBRXRDLE1BQU07QUFDTixNQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7RUFDOUM7QUFDRCxRQUFPLElBQUksQ0FBQTtDQUNYOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBIiwiZmlsZSI6InV0aWwyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtyZXNvbHZlIGFzIHJlc29sdmVQYXRofSBmcm9tICd1cmwnXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZShuYW1lLCByZWZlcnJlcikge1xuXHRyZXR1cm4gcmVzb2x2ZVBhdGgocmVmZXJyZXIsIG5hbWUpXG59XG5cbmV4cG9ydCBjb25zdCB0dXBsZTJyZWNvcmQgPSAodCkgPT4ge1xuXHRpZiAoc2tpcCh0KSkgcmV0dXJuIHtub2RlVHlwZTogJ3NraXAnLCBkYXRhOiB0fVxuXHRjb25zdCBbbm9kZVR5cGUsIHBvc2l0aW9uLCAuLi5kYXRhXSA9IHRcblx0aWYgKG5vZGVUeXBlID09PSAnZWxlbWVudCcpIHtcblx0XHRjb25zdCBbW3RhZ05hbWUsIGNsYXNzTGlzdCwgaWRdLCBiaW5kaW5nLCBjaGlsZE5vZGVzXSA9IGRhdGFcblx0XHRyZXR1cm4gKHtub2RlVHlwZSwgcG9zaXRpb24sIG5vZGVOYW1lOiB0YWdOYW1lLCB0YWdOYW1lLCBjbGFzc0xpc3QsIGlkLCBiaW5kaW5nLCBjaGlsZE5vZGVzfSlcblx0fVxuXHRpZiAoaGFzQ2hpbGROb2Rlcyhub2RlVHlwZSkpIHtcblx0XHRjb25zdCBbbm9kZU5hbWUsIG5vZGVWYWx1ZSwgY2hpbGROb2Rlc10gPSBkYXRhXG5cdFx0cmV0dXJuIHtub2RlVHlwZSwgcG9zaXRpb24sIG5vZGVOYW1lLCBub2RlVmFsdWUsIGNoaWxkTm9kZXN9XG5cdH1cblx0cmV0dXJuIHtub2RlVHlwZSwgcG9zaXRpb24sIGRhdGF9XG59XG5cbmV4cG9ydCBjb25zdCByZWNvcmQydHVwbGUgPSAoe25vZGVUeXBlLCBwb3NpdGlvbiwgLi4uZGF0YX0pID0+IHtcblx0aWYgKG5vZGVUeXBlID09PSAnc2tpcCcpIHJldHVybiBkYXRhLmRhdGFcblx0aWYgKG5vZGVUeXBlID09PSAnZWxlbWVudCcpIHtcblx0XHRjb25zdCB7dGFnTmFtZSwgY2xhc3NMaXN0LCBpZCwgYmluZGluZywgY2hpbGROb2Rlc30gPSBkYXRhXG5cdFx0cmV0dXJuIFtub2RlVHlwZSwgcG9zaXRpb24sIFt0YWdOYW1lLCBjbGFzc0xpc3QsIGlkXSwgYmluZGluZywgY2hpbGROb2Rlc11cblx0fVxuXHRpZiAoaGFzQ2hpbGROb2Rlcyhub2RlVHlwZSkpIHtcblx0XHRjb25zdCB7bm9kZU5hbWUsIG5vZGVWYWx1ZSwgY2hpbGROb2Rlc30gPSBkYXRhXG5cdFx0cmV0dXJuIFtub2RlVHlwZSwgcG9zaXRpb24sIG5vZGVOYW1lLCBub2RlVmFsdWUsIGNoaWxkTm9kZXNdXG5cdH1cblx0cmV0dXJuIFtub2RlVHlwZSwgcG9zaXRpb24sIC4uLmRhdGEuZGF0YV1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHF1ZXJ5KGYsIG9yZGVyKSB7XG5cdGxldCBtYXRjaDFcblx0dGhpczo6dHJhdmVyc2Uobm9kZSA9PiB7XG5cdFx0aWYgKG1hdGNoMSkgcmV0dXJuIGZhbHNlXG5cdFx0aWYgKGYobm9kZSkpIHtcblx0XHRcdG1hdGNoMSA9IG5vZGVcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdH1cblx0fSwgb3JkZXIpXG5cdHJldHVybiBtYXRjaDEgPyByZWNvcmQydHVwbGUobWF0Y2gxKSA6IG1hdGNoMVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcXVlcnlBbGwoZiwgb3JkZXIpIHtcblx0Y29uc3QgbWF0Y2hlcyA9IFtdXG5cdHRoaXM6OnRyYXZlcnNlKG5vZGUgPT4ge1xuXHRcdGlmIChmKG5vZGUpKSBtYXRjaGVzLnB1c2gobm9kZSlcblx0fSwgb3JkZXIpXG5cdHJldHVybiBtYXRjaGVzXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmF2ZXJzZShmLCBvcmRlciA9ICdwcmUnLCB0cmF2ZXJzZUFsbCkge1xuXHRpZiAoc2tpcCh0aGlzKSkge1xuXHRcdGlmICghdHJhdmVyc2VBbGwpIHJldHVybiB0aGlzXG5cdFx0Y29uc3Qgbm9kZSA9IHR1cGxlMnJlY29yZCh0aGlzKVxuXHRcdGYobm9kZSlcblx0XHRyZXR1cm4gcmVjb3JkMnR1cGxlKG5vZGUpXG5cdH1cblx0aWYgKGlzTm9kZSh0aGlzKSkge1xuXHRcdGNvbnN0IG5vZGUgPSB0dXBsZTJyZWNvcmQodGhpcylcblx0XHRpZiAob3JkZXIgPT09ICdwb3N0JykgdHJhdmVyc2VDaGlsZE5vZGVzKG5vZGUpXG5cdFx0Y29uc3QgcmVjdXJzaXZlID0gZihub2RlKVxuXHRcdGlmIChyZWN1cnNpdmUgfHwgcmVjdXJzaXZlID09PSB1bmRlZmluZWQgJiYgb3JkZXIgPT09ICdwcmUnKSB0cmF2ZXJzZUNoaWxkTm9kZXMobm9kZSlcblx0XHRyZXR1cm4gcmVjb3JkMnR1cGxlKG5vZGUpXG5cdH1cblxuXHRpZiAoQXJyYXkuaXNBcnJheSh0aGlzKSkge1xuXHRcdHJldHVybiB0aGlzLm1hcChjaGlsZCA9PiBjaGlsZDo6dHJhdmVyc2UoZiwgb3JkZXIsIHRyYXZlcnNlQWxsKSlcblx0fVxuXG5cdHRocm93IG5ldyBFcnJvcih0aGlzKVxuXG5cdGZ1bmN0aW9uIHRyYXZlcnNlQ2hpbGROb2Rlcyhub2RlKSB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkobm9kZS5jaGlsZE5vZGVzKSkge1xuXHRcdFx0bm9kZS5jaGlsZE5vZGVzID0gbm9kZS5jaGlsZE5vZGVzLm1hcChjaGlsZCA9PiBjaGlsZDo6dHJhdmVyc2UoZiwgb3JkZXIsIHRyYXZlcnNlQWxsKSlcblx0XHR9XG5cdFx0aWYgKHRyYXZlcnNlQWxsKSB7XG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheShub2RlLmJpbmRpbmcpICYmIGlzTm9kZShub2RlLmJpbmRpbmcpKSB7XG5cdFx0XHRcdG5vZGUuYmluZGluZyA9IG5vZGUuYmluZGluZzo6dHJhdmVyc2UoZiwgb3JkZXIsIHRyYXZlcnNlQWxsKVxuXHRcdFx0fVxuXHRcdFx0Ly8gaWYgKEFycmF5LmlzQXJyYXkobm9kZS5kYXRhKSAmJiBBcnJheS5pc0FycmF5KG5vZGUuZGF0YVtub2RlLmRhdGEubGVuZ3RoIC0gMV0pKSB7XG5cdFx0XHQvLyBcdG5vZGUuZGF0YVtub2RlLmRhdGEubGVuZ3RoIC0gMV0gPSBub2RlLmRhdGFbbm9kZS5kYXRhLmxlbmd0aCAtIDFdLm1hcChjaGlsZCA9PiBjaGlsZDo6dHJhdmVyc2UoZiwgb3JkZXIsIHRyYXZlcnNlQWxsKSlcblx0XHRcdC8vIH1cblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gaXNOb2RlKG5vZGVUdXBsZSkge1xuXHRyZXR1cm4gbm9kZVR1cGxlLmxlbmd0aCA+IDBcblx0XHQmJiAvXig/OmRvY3VtZW50fGVsZW1lbnR8YXR0cmlidXRlfHRleHR8Y29tbWVudHxzY3JpcHRzb3VyY2V8c3VwcHJlc3N8aW5qZWN0fGJpbmRpbmd8aW5zdHJ1Y3Rpb258bWFjcm98ZnJhZ21lbnR8U2VjdGlvbnxPZmZzaWRlfE1peGVkV2hpdGVzcGFjZXxFcnJvcikkLy50ZXN0KG5vZGVUdXBsZVswXSlcbn1cblxuZnVuY3Rpb24gc2tpcChub2RlVHVwbGUpIHtcblx0Y29uc3Qgd2hpdGUgPSAvXlxccyooPzpcXC9cXC8uKik/JC9cblx0aWYgKEFycmF5LmlzQXJyYXkobm9kZVR1cGxlKSkge1xuXHRcdGlmIChub2RlVHVwbGUubGVuZ3RoID09PSAxICYmIG5vZGVUdXBsZVswXSA9PT0gJ2Nsb3NlU3RhcnRUYWcnKSByZXR1cm4gdHJ1ZVxuXHRcdGlmIChub2RlVHVwbGUubGVuZ3RoID4gMCAmJiBub2RlVHVwbGUuZXZlcnkoeCA9PiB0eXBlb2YgeCA9PT0gJ3N0cmluZycgJiYgeC5sZW5ndGggPT09IDEpXG5cdFx0XHQmJiB3aGl0ZS50ZXN0KG5vZGVUdXBsZS5qb2luKCcnKSkpIHJldHVybiB0cnVlXG5cdH0gZWxzZSB7XG5cdFx0aWYgKHR5cGVvZiBub2RlVHVwbGUgPT09ICdzdHJpbmcnICYmIHdoaXRlLnRlc3Qobm9kZVR1cGxlKSkgcmV0dXJuIHRydWVcblx0XHR0aHJvdyBuZXcgRXJyb3Iobm9kZVR1cGxlKVxuXHR9XG59XG5cbmZ1bmN0aW9uIGhhc0NoaWxkTm9kZXMobm9kZVR5cGUpIHtcblx0c3dpdGNoIChub2RlVHlwZSkge1xuXHRcdGNhc2UgJ2RvY3VtZW50Jzpcblx0XHRjYXNlICdmcmFnbWVudCc6XG5cdFx0Y2FzZSAnZWxlbWVudCc6XG5cdFx0Y2FzZSAnYmluZGluZyc6XG5cdFx0Y2FzZSAnaW5zdHJ1Y3Rpb24nOlxuXHRcdGNhc2UgJ21hY3JvJzpcblx0XHRcdHJldHVybiB0cnVlXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBmYWxzZVxuXHR9XG59XG5cbmltcG9ydCB7cmVhZEZpbGVTeW5jfSBmcm9tICdmcydcbmV4cG9ydCBmdW5jdGlvbiBlcnJvckluZm8oZSwgc291cmNlKSB7XG5cblx0Y29uc3QgaW5mbyA9IFtdXG5cblx0aWYgKGUucG9zaXRpb24pIHtcblxuXHRcdGNvbnN0IFtmaWxlbmFtZSwgbGluZSwgY29sXSA9IGUucG9zaXRpb25cblx0XHRjb25zdCBlcnJvclR5cGUgPSBlLm1lc3NhZ2UgPT09ICdTZWN0aW9uJyA/ICdTeW50YXhFcnJvcicgOiBlLm1lc3NhZ2Vcblx0XHRpbmZvLnB1c2goW10pXG5cdFx0aW5mby5wdXNoKFsnU3ludGF4IGVycm9yOicsXG5cdFx0XHRmaWxlbmFtZSA9PT0gJyonXG5cdFx0XHQ/IGBJIGd1ZXN0IGl0IG1heSBiZSAke3NvdXJjZX0gLCBidXQgbm90IHN1cmUuLi5gXG5cdFx0XHQ6IGZpbGVuYW1lXG5cdFx0XSlcblx0XHRpbmZvLnB1c2goW10pXG5cblx0XHRjb25zdCBsaW5lcyA9IHJlYWRGaWxlU3luYyhmaWxlbmFtZSA9PT0gJyonID8gc291cmNlIDogZmlsZW5hbWUpLnRvU3RyaW5nKCkuc3BsaXQoL1xccj9cXG4vKVxuXHRcdGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdICs9ICdcXHV7MUY1MUF9J1xuXG5cdFx0Y29uc3Qgc3RhcnRMaW5lID0gTWF0aC5tYXgoZS5wb3NpdGlvblsxXSAtIDgsIDApLFxuXHRcdFx0ZW5kTGluZSA9IE1hdGgubWluKGUucG9zaXRpb25bMV0gKyA3LCBsaW5lcy5sZW5ndGgpXG5cblx0XHRjb25zdCBzaG93TGluZXMgPSBsaW5lcy5zbGljZShzdGFydExpbmUsIGVuZExpbmUpLm1hcChcblx0XHRcdChsaW5lLCBpKSA9PiAoc3RhcnRMaW5lICsgaSArIDEpICsgJyB8ICcgKyBsaW5lLnJlcGxhY2UoL1xcdC9nLCAnICAgICcpKVxuXG5cdFx0dmFyIHNwYWNlcyA9ICcgJy5yZXBlYXQoU3RyaW5nKGxpbmUpLmxlbmd0aCArIDIgKyBjb2wpXG5cdFx0c2hvd0xpbmVzLnNwbGljZShsaW5lIC0gc3RhcnRMaW5lLCAwLFxuXHRcdFx0c3BhY2VzICsgJ14nLFxuXHRcdFx0c3BhY2VzICsgJ3xfXyBPb29wcywgJyArIGVycm9yVHlwZSArICcgYXQgbGluZSAnICsgbGluZSArICcsIGNvbHVtbiAnICsgY29sLFxuXHRcdFx0c3BhY2VzKVxuXG5cdFx0c2hvd0xpbmVzLmZvckVhY2gobCA9PiBpbmZvLnB1c2goW2xdKSlcblxuXHR9IGVsc2Uge1xuXHRcdGluZm8ucHVzaChbU3RyaW5nKGUuc3RhY2sgfHwgZS5tZXNzYWdlIHx8IGUpXSlcblx0fVxuXHRyZXR1cm4gaW5mb1xufVxuXG4vLyBleHBvcnQgZnVuY3Rpb24gbWF0Y2gocGF0dGVybikge1xuLy8gXHRpZiAodHlwZW9mIHBhdHRlcm4gPT09ICdmdW5jdGlvbicgJiYgcGF0dGVybi5wcm90b3R5cGUpIHJldHVybiB0aGlzIGluc3RhbmNlb2YgcGF0dGVyblxuLy8gXHRpZiAocGF0dGVybiAmJiB0eXBlb2YgcGF0dGVybi50ZXN0ID09PSAnZnVuY3Rpb24nKSByZXR1cm4gcGF0dGVybi50ZXN0KHRoaXMpXG4vLyBcdHN3aXRjaCAodHlwZW9mIHRoaXMpIHtcbi8vIFx0XHRjYXNlICd1bmRlZmluZWQnOlxuLy8gXHRcdGNhc2UgJ2Jvb2xlYW4nOlxuLy8gXHRcdGNhc2UgJ251bWJlcic6XG4vLyBcdFx0Y2FzZSAnc3RyaW5nJzpcbi8vIFx0XHRjYXNlICdzeW1ib2wnOlxuLy8gXHRcdFx0cmV0dXJuIHRoaXMgPT09IHBhdHRlcm5cbi8vIFx0XHRjYXNlICdvYmplY3QnOlxuLy8gXHRcdFx0aWYgKHRoaXMgPT09IG51bGwpIHJldHVybiBwYXR0ZXJuID09PSBudWxsXG4vLyBcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShwYXR0ZXJuKSkgcmV0dXJuIHBhdHRlcm4uZXZlcnkoKHAsIGkpID0+IHRoaXNbaV06Om1hdGNoKHApKVxuLy8gXHRcdFx0aWYgKHR5cGVvZiBwYXR0ZXJuID09PSAnb2JqZWN0JykgcmV0dXJuIE9iamVjdC5rZXlzKHBhdHRlcm4pLmV2ZXJ5KGtleSA9PiB0aGlzW2tleV06Om1hdGNoKHBhdHRlcm5ba2V5XSkpXG4vLyBcdFx0XHRyZXR1cm4gZmFsc2Vcbi8vIFx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoJ3Nob3VsZCBub3QgYmUgZnVuY3Rpb24nKVxuLy8gXHR9XG4vLyB9XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=