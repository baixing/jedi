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
		info.push([String(err = e.stack || e.message || e)]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInV0aWwyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7UUFDZ0IsT0FBTyxHQUFQLE9BQU87UUErQlAsS0FBSyxHQUFMLEtBQUs7UUFZTCxRQUFRLEdBQVIsUUFBUTtRQVFSLFFBQVEsR0FBUixRQUFRO1FBK0RSLFNBQVMsR0FBVCxTQUFTOzttQkFuSFksS0FBSzs7a0JBa0hmLElBQUk7O0FBakh4QixTQUFTLE9BQU8sQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFO0FBQ3ZDLFFBQU8sU0FGQSxPQUFPLEVBRUssUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFBO0NBQ2xDOztBQUVNLElBQU0sWUFBWSxHQUFHLFNBQWYsWUFBWSxDQUFJLENBQUMsRUFBSztBQUNsQyxLQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFDLENBQUE7O21CQUNULENBQUM7O0tBQWhDLFFBQVE7S0FBRSxRQUFROztLQUFLLElBQUk7O0FBQ2xDLEtBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTs2QkFDNkIsSUFBSTs7OztNQUFwRCxPQUFPO01BQUUsU0FBUztNQUFFLEVBQUU7TUFBRyxPQUFPO01BQUUsVUFBVTs7QUFDcEQsU0FBUSxFQUFDLFFBQVEsRUFBUixRQUFRLEVBQUUsUUFBUSxFQUFSLFFBQVEsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBUCxPQUFPLEVBQUUsU0FBUyxFQUFULFNBQVMsRUFBRSxFQUFFLEVBQUYsRUFBRSxFQUFFLE9BQU8sRUFBUCxPQUFPLEVBQUUsVUFBVSxFQUFWLFVBQVUsRUFBQyxDQUFDO0VBQzdGO0FBQ0QsS0FBSSxhQUFhLENBQUMsUUFBUSxDQUFDLEVBQUU7OEJBQ2MsSUFBSTs7TUFBdkMsUUFBUTtNQUFFLFNBQVM7TUFBRSxVQUFVOztBQUN0QyxTQUFRLEVBQUMsUUFBUSxFQUFSLFFBQVEsRUFBRSxRQUFRLEVBQVIsUUFBUSxFQUFFLFFBQVEsRUFBUixRQUFRLEVBQUUsU0FBUyxFQUFULFNBQVMsRUFBRSxVQUFVLEVBQVYsVUFBVSxFQUFDLENBQUM7RUFDOUQ7QUFDRCxRQUFPLEVBQUMsUUFBUSxFQUFSLFFBQVEsRUFBRSxRQUFRLEVBQVIsUUFBUSxFQUFFLElBQUksRUFBSixJQUFJLEVBQUMsQ0FBQTtDQUNqQyxDQUFBOztRQVpZLFlBQVksR0FBWixZQUFZO0FBY2xCLElBQU0sWUFBWSxHQUFHLFNBQWYsWUFBWSxDQUFJLElBQTZCLEVBQUs7S0FBakMsUUFBUSxHQUFULElBQTZCLENBQTVCLFFBQVE7S0FBRSxRQUFRLEdBQW5CLElBQTZCLENBQWxCLFFBQVE7O0tBQUssSUFBSSw0QkFBNUIsSUFBNkI7O0FBQ3pELEtBQUksUUFBUSxLQUFLLE1BQU0sRUFBRSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUE7QUFDekMsS0FBSSxRQUFRLEtBQUssU0FBUyxFQUFFO01BQ3BCLE9BQU8sR0FBd0MsSUFBSSxDQUFuRCxPQUFPO01BQUUsU0FBUyxHQUE2QixJQUFJLENBQTFDLFNBQVM7TUFBRSxFQUFFLEdBQXlCLElBQUksQ0FBL0IsRUFBRTtNQUFFLE9BQU8sR0FBZ0IsSUFBSSxDQUEzQixPQUFPO01BQUUsVUFBVSxHQUFJLElBQUksQ0FBbEIsVUFBVTs7QUFDbEQsU0FBTyxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQTtFQUMxRTtBQUNELEtBQUksYUFBYSxDQUFDLFFBQVEsQ0FBQyxFQUFFO01BQ3JCLFFBQVEsR0FBMkIsSUFBSSxDQUF2QyxRQUFRO01BQUUsU0FBUyxHQUFnQixJQUFJLENBQTdCLFNBQVM7TUFBRSxVQUFVLEdBQUksSUFBSSxDQUFsQixVQUFVOztBQUN0QyxTQUFPLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFBO0VBQzVEO0FBQ0QsU0FBUyxRQUFRLEVBQUUsUUFBUSw0QkFBSyxJQUFJLENBQUMsSUFBSSxHQUFFO0NBQzNDLENBQUE7O1FBWFksWUFBWSxHQUFaLFlBQVk7O0FBYWxCLFNBQVMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUU7QUFDL0IsS0FBSSxNQUFNLFlBQUEsQ0FBQTtBQUNWLEFBQU0sU0FBUSxNQUFkLElBQUksRUFBVyxVQUFBLElBQUksRUFBSTtBQUN0QixNQUFJLE1BQU0sRUFBRSxPQUFPLEtBQUssQ0FBQTtBQUN4QixNQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUNaLFNBQU0sR0FBRyxJQUFJLENBQUE7QUFDYixVQUFPLEtBQUssQ0FBQTtHQUNaO0VBQ0QsRUFBRSxLQUFLLENBQUMsQ0FBQTtBQUNULFFBQU8sTUFBTSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUE7Q0FDN0M7O0FBRU0sU0FBUyxRQUFRLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRTtBQUNsQyxLQUFNLE9BQU8sR0FBRyxFQUFFLENBQUE7QUFDbEIsQUFBTSxTQUFRLE1BQWQsSUFBSSxFQUFXLFVBQUEsSUFBSSxFQUFJO0FBQ3RCLE1BQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7RUFDL0IsRUFBRSxLQUFLLENBQUMsQ0FBQTtBQUNULFFBQU8sT0FBTyxDQUFBO0NBQ2Q7O0FBRU0sU0FBUyxRQUFRLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBVSxXQUFXLEVBQUU7S0FBNUIsS0FBSyxnQkFBTCxLQUFLLEdBQUcsS0FBSzs7QUFDeEMsS0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxJQUFJLENBQUE7O0FBRTNCLEtBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ2pCLE1BQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUMvQixNQUFJLEtBQUssS0FBSyxNQUFNLEVBQUUsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDOUMsTUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3pCLE1BQUksU0FBUyxJQUFJLFNBQVMsS0FBSyxTQUFTLElBQUksS0FBSyxLQUFLLEtBQUssRUFBRSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNyRixTQUFPLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQTtFQUN6Qjs7QUFFRCxLQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDeEIsU0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSztVQUFJLEFBQU8sUUFBUSxNQUFmLEtBQUssRUFBVyxDQUFDLEVBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBQztHQUFBLENBQUMsQ0FBQTtFQUNoRTs7QUFFRCxPQUFNLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBOztBQUVyQixVQUFTLGtCQUFrQixDQUFDLElBQUksRUFBRTtBQUNqQyxNQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQ25DLE9BQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLO1dBQUksQUFBTyxRQUFRLE1BQWYsS0FBSyxFQUFXLENBQUMsRUFBRSxLQUFLLEVBQUUsV0FBVyxDQUFDO0lBQUEsQ0FBQyxDQUFBO0dBQ3RGO0FBQ0QsTUFBSSxXQUFXLEVBQUU7QUFDaEIsT0FBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFOzs7QUFDeEQsUUFBSSxDQUFDLE9BQU8sR0FBRyxZQUFBLElBQUksQ0FBQyxPQUFPLEVBQUUsUUFBUSxpQkFBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFBO0lBQzVEOzs7O0FBQUEsR0FJRDtFQUNEO0NBQ0Q7O0FBRUQsU0FBUyxNQUFNLENBQUMsU0FBUyxFQUFFO0FBQzFCLFFBQU8scUpBQXFKLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0NBQy9LOztBQUVELFNBQVMsSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUN4QixLQUFNLEtBQUssR0FBRyxrQkFBa0IsQ0FBQTtBQUNoQyxLQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDN0IsTUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssZUFBZSxFQUFFLE9BQU8sSUFBSSxDQUFBO0FBQzNFLE1BQUksU0FBUyxDQUFDLEtBQUssQ0FBQyxVQUFBLENBQUM7VUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDO0dBQUEsQ0FBQyxJQUM3RCxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxPQUFPLElBQUksQ0FBQTtFQUMvQyxNQUFNO0FBQ04sTUFBSSxPQUFPLFNBQVMsS0FBSyxRQUFRLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxPQUFPLElBQUksQ0FBQTtBQUN2RSxRQUFNLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0VBQzFCO0NBQ0Q7O0FBRUQsU0FBUyxhQUFhLENBQUMsUUFBUSxFQUFFO0FBQ2hDLFNBQVEsUUFBUTtBQUNmLE9BQUssVUFBVSxDQUFDO0FBQ2hCLE9BQUssVUFBVSxDQUFDO0FBQ2hCLE9BQUssU0FBUyxDQUFDO0FBQ2YsT0FBSyxTQUFTLENBQUM7QUFDZixPQUFLLGFBQWEsQ0FBQztBQUNuQixPQUFLLE9BQU87QUFDWCxVQUFPLElBQUksQ0FBQTtBQUFBLEFBQ1o7QUFDQyxVQUFPLEtBQUssQ0FBQTtBQUFBLEVBQ2I7Q0FDRDs7QUFHTSxTQUFTLFNBQVMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFOztBQUVwQyxLQUFNLElBQUksR0FBRyxFQUFFLENBQUE7O0FBRWYsS0FBSSxDQUFDLENBQUMsUUFBUSxFQUFFO01BcUJYLE1BQU07OztvQ0FuQm9CLENBQUMsQ0FBQyxRQUFROztPQUFqQyxRQUFRO09BQUUsSUFBSTtPQUFFLEdBQUc7O0FBQzFCLE9BQU0sU0FBUyxHQUFHLENBQUMsQ0FBQyxPQUFPLEtBQUssU0FBUyxHQUFHLGFBQWEsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFBO0FBQ3JFLE9BQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7QUFDYixPQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsZUFBZSxFQUN6QixRQUFRLEtBQUssR0FBRywwQkFDTyxNQUFNLDBCQUMzQixRQUFRLENBQ1YsQ0FBQyxDQUFBO0FBQ0YsT0FBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTs7QUFFYixPQUFNLEtBQUssR0FBRyxRQWpCUixZQUFZLEVBaUJTLFFBQVEsS0FBSyxHQUFHLEdBQUcsTUFBTSxHQUFHLFFBQVEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUMxRixRQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFXLENBQUE7O0FBRXRDLE9BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO09BQy9DLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTs7QUFFcEQsT0FBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUNwRCxVQUFDLElBQUksRUFBRSxDQUFDO1dBQUssQUFBQyxTQUFTLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDO0lBQUEsQ0FBQyxDQUFBOztBQUVwRSxTQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7O0FBQ3RELFlBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLFNBQVMsRUFBRSxDQUFDLEVBQ25DLE1BQU0sR0FBRyxHQUFHLEVBQ1osTUFBTSxHQUFHLGFBQWEsR0FBRyxTQUFTLEdBQUcsV0FBVyxHQUFHLElBQUksR0FBRyxXQUFXLEdBQUcsR0FBRyxFQUMzRSxNQUFNLENBQUMsQ0FBQTs7QUFFUixZQUFTLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQztXQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUFBLENBQUMsQ0FBQTs7RUFFdEMsTUFBTTtBQUNOLE1BQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7RUFDcEQ7QUFDRCxRQUFPLElBQUksQ0FBQTtDQUNYOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBIiwiZmlsZSI6InV0aWwyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtyZXNvbHZlIGFzIHJlc29sdmVQYXRofSBmcm9tICd1cmwnXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZShuYW1lLCByZWZlcnJlcikge1xuXHRyZXR1cm4gcmVzb2x2ZVBhdGgocmVmZXJyZXIsIG5hbWUpXG59XG5cbmV4cG9ydCBjb25zdCB0dXBsZTJyZWNvcmQgPSAodCkgPT4ge1xuXHRpZiAoc2tpcCh0KSkgcmV0dXJuIHtub2RlVHlwZTogJ3NraXAnLCBkYXRhOiB0fVxuXHRjb25zdCBbbm9kZVR5cGUsIHBvc2l0aW9uLCAuLi5kYXRhXSA9IHRcblx0aWYgKG5vZGVUeXBlID09PSAnZWxlbWVudCcpIHtcblx0XHRjb25zdCBbW3RhZ05hbWUsIGNsYXNzTGlzdCwgaWRdLCBiaW5kaW5nLCBjaGlsZE5vZGVzXSA9IGRhdGFcblx0XHRyZXR1cm4gKHtub2RlVHlwZSwgcG9zaXRpb24sIG5vZGVOYW1lOiB0YWdOYW1lLCB0YWdOYW1lLCBjbGFzc0xpc3QsIGlkLCBiaW5kaW5nLCBjaGlsZE5vZGVzfSlcblx0fVxuXHRpZiAoaGFzQ2hpbGROb2Rlcyhub2RlVHlwZSkpIHtcblx0XHRjb25zdCBbbm9kZU5hbWUsIG5vZGVWYWx1ZSwgY2hpbGROb2Rlc10gPSBkYXRhXG5cdFx0cmV0dXJuICh7bm9kZVR5cGUsIHBvc2l0aW9uLCBub2RlTmFtZSwgbm9kZVZhbHVlLCBjaGlsZE5vZGVzfSlcblx0fVxuXHRyZXR1cm4ge25vZGVUeXBlLCBwb3NpdGlvbiwgZGF0YX1cbn1cblxuZXhwb3J0IGNvbnN0IHJlY29yZDJ0dXBsZSA9ICh7bm9kZVR5cGUsIHBvc2l0aW9uLCAuLi5kYXRhfSkgPT4ge1xuXHRpZiAobm9kZVR5cGUgPT09ICdza2lwJykgcmV0dXJuIGRhdGEuZGF0YVxuXHRpZiAobm9kZVR5cGUgPT09ICdlbGVtZW50Jykge1xuXHRcdGNvbnN0IHt0YWdOYW1lLCBjbGFzc0xpc3QsIGlkLCBiaW5kaW5nLCBjaGlsZE5vZGVzfSA9IGRhdGFcblx0XHRyZXR1cm4gW25vZGVUeXBlLCBwb3NpdGlvbiwgW3RhZ05hbWUsIGNsYXNzTGlzdCwgaWRdLCBiaW5kaW5nLCBjaGlsZE5vZGVzXVxuXHR9XG5cdGlmIChoYXNDaGlsZE5vZGVzKG5vZGVUeXBlKSkge1xuXHRcdGNvbnN0IHtub2RlTmFtZSwgbm9kZVZhbHVlLCBjaGlsZE5vZGVzfSA9IGRhdGFcblx0XHRyZXR1cm4gW25vZGVUeXBlLCBwb3NpdGlvbiwgbm9kZU5hbWUsIG5vZGVWYWx1ZSwgY2hpbGROb2Rlc11cblx0fVxuXHRyZXR1cm4gKFtub2RlVHlwZSwgcG9zaXRpb24sIC4uLmRhdGEuZGF0YV0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBxdWVyeShmLCBvcmRlcikge1xuXHRsZXQgbWF0Y2gxXG5cdHRoaXM6OnRyYXZlcnNlKG5vZGUgPT4ge1xuXHRcdGlmIChtYXRjaDEpIHJldHVybiBmYWxzZVxuXHRcdGlmIChmKG5vZGUpKSB7XG5cdFx0XHRtYXRjaDEgPSBub2RlXG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHR9XG5cdH0sIG9yZGVyKVxuXHRyZXR1cm4gbWF0Y2gxID8gcmVjb3JkMnR1cGxlKG1hdGNoMSkgOiBtYXRjaDFcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHF1ZXJ5QWxsKGYsIG9yZGVyKSB7XG5cdGNvbnN0IG1hdGNoZXMgPSBbXVxuXHR0aGlzOjp0cmF2ZXJzZShub2RlID0+IHtcblx0XHRpZiAoZihub2RlKSkgbWF0Y2hlcy5wdXNoKG5vZGUpXG5cdH0sIG9yZGVyKVxuXHRyZXR1cm4gbWF0Y2hlc1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhdmVyc2UoZiwgb3JkZXIgPSAncHJlJywgdHJhdmVyc2VBbGwpIHtcblx0aWYgKHNraXAodGhpcykpIHJldHVybiB0aGlzXG5cblx0aWYgKGlzTm9kZSh0aGlzKSkge1xuXHRcdGNvbnN0IG5vZGUgPSB0dXBsZTJyZWNvcmQodGhpcylcblx0XHRpZiAob3JkZXIgPT09ICdwb3N0JykgdHJhdmVyc2VDaGlsZE5vZGVzKG5vZGUpXG5cdFx0Y29uc3QgcmVjdXJzaXZlID0gZihub2RlKVxuXHRcdGlmIChyZWN1cnNpdmUgfHwgcmVjdXJzaXZlID09PSB1bmRlZmluZWQgJiYgb3JkZXIgPT09ICdwcmUnKSB0cmF2ZXJzZUNoaWxkTm9kZXMobm9kZSlcblx0XHRyZXR1cm4gcmVjb3JkMnR1cGxlKG5vZGUpXG5cdH1cblxuXHRpZiAoQXJyYXkuaXNBcnJheSh0aGlzKSkge1xuXHRcdHJldHVybiB0aGlzLm1hcChjaGlsZCA9PiBjaGlsZDo6dHJhdmVyc2UoZiwgb3JkZXIsIHRyYXZlcnNlQWxsKSlcblx0fVxuXG5cdHRocm93IG5ldyBFcnJvcih0aGlzKVxuXG5cdGZ1bmN0aW9uIHRyYXZlcnNlQ2hpbGROb2Rlcyhub2RlKSB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkobm9kZS5jaGlsZE5vZGVzKSkge1xuXHRcdFx0bm9kZS5jaGlsZE5vZGVzID0gbm9kZS5jaGlsZE5vZGVzLm1hcChjaGlsZCA9PiBjaGlsZDo6dHJhdmVyc2UoZiwgb3JkZXIsIHRyYXZlcnNlQWxsKSlcblx0XHR9XG5cdFx0aWYgKHRyYXZlcnNlQWxsKSB7XG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheShub2RlLmJpbmRpbmcpICYmIGlzTm9kZShub2RlLmJpbmRpbmcpKSB7XG5cdFx0XHRcdG5vZGUuYmluZGluZyA9IG5vZGUuYmluZGluZzo6dHJhdmVyc2UoZiwgb3JkZXIsIHRyYXZlcnNlQWxsKVxuXHRcdFx0fVxuXHRcdFx0Ly8gaWYgKEFycmF5LmlzQXJyYXkobm9kZS5kYXRhKSAmJiBBcnJheS5pc0FycmF5KG5vZGUuZGF0YVtub2RlLmRhdGEubGVuZ3RoIC0gMV0pKSB7XG5cdFx0XHQvLyBcdG5vZGUuZGF0YVtub2RlLmRhdGEubGVuZ3RoIC0gMV0gPSBub2RlLmRhdGFbbm9kZS5kYXRhLmxlbmd0aCAtIDFdLm1hcChjaGlsZCA9PiBjaGlsZDo6dHJhdmVyc2UoZiwgb3JkZXIsIHRyYXZlcnNlQWxsKSlcblx0XHRcdC8vIH1cblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gaXNOb2RlKG5vZGVUdXBsZSkge1xuXHRyZXR1cm4gL14oPzpkb2N1bWVudHxlbGVtZW50fGF0dHJpYnV0ZXx0ZXh0fGNvbW1lbnR8c2NyaXB0c291cmNlfHN1cHByZXNzfGluamVjdHxiaW5kaW5nfGluc3RydWN0aW9ufG1hY3JvfGZyYWdtZW50fFNlY3Rpb258T2Zmc2lkZXxNaXhlZFdoaXRlc3BhY2V8RXJyb3IpJC8udGVzdChub2RlVHVwbGVbMF0pXG59XG5cbmZ1bmN0aW9uIHNraXAobm9kZVR1cGxlKSB7XG5cdGNvbnN0IHdoaXRlID0gL15cXHMqKD86XFwvXFwvLiopPyQvXG5cdGlmIChBcnJheS5pc0FycmF5KG5vZGVUdXBsZSkpIHtcblx0XHRpZiAobm9kZVR1cGxlLmxlbmd0aCA9PT0gMSAmJiBub2RlVHVwbGVbMF0gPT09ICdjbG9zZVN0YXJ0VGFnJykgcmV0dXJuIHRydWVcblx0XHRpZiAobm9kZVR1cGxlLmV2ZXJ5KHggPT4gdHlwZW9mIHggPT09ICdzdHJpbmcnICYmIHgubGVuZ3RoID09PSAxKVxuXHRcdFx0JiYgd2hpdGUudGVzdChub2RlVHVwbGUuam9pbignJykpKSByZXR1cm4gdHJ1ZVxuXHR9IGVsc2Uge1xuXHRcdGlmICh0eXBlb2Ygbm9kZVR1cGxlID09PSAnc3RyaW5nJyAmJiB3aGl0ZS50ZXN0KG5vZGVUdXBsZSkpIHJldHVybiB0cnVlXG5cdFx0dGhyb3cgbmV3IEVycm9yKG5vZGVUdXBsZSlcblx0fVxufVxuXG5mdW5jdGlvbiBoYXNDaGlsZE5vZGVzKG5vZGVUeXBlKSB7XG5cdHN3aXRjaCAobm9kZVR5cGUpIHtcblx0XHRjYXNlICdkb2N1bWVudCc6XG5cdFx0Y2FzZSAnZnJhZ21lbnQnOlxuXHRcdGNhc2UgJ2VsZW1lbnQnOlxuXHRcdGNhc2UgJ2JpbmRpbmcnOlxuXHRcdGNhc2UgJ2luc3RydWN0aW9uJzpcblx0XHRjYXNlICdtYWNybyc6XG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0fVxufVxuXG5pbXBvcnQge3JlYWRGaWxlU3luY30gZnJvbSAnZnMnXG5leHBvcnQgZnVuY3Rpb24gZXJyb3JJbmZvKGUsIHNvdXJjZSkge1xuXG5cdGNvbnN0IGluZm8gPSBbXVxuXG5cdGlmIChlLnBvc2l0aW9uKSB7XG5cblx0XHRjb25zdCBbZmlsZW5hbWUsIGxpbmUsIGNvbF0gPSBlLnBvc2l0aW9uXG5cdFx0Y29uc3QgZXJyb3JUeXBlID0gZS5tZXNzYWdlID09PSAnU2VjdGlvbicgPyAnU3ludGF4RXJyb3InIDogZS5tZXNzYWdlXG5cdFx0aW5mby5wdXNoKFtdKVxuXHRcdGluZm8ucHVzaChbJ1N5bnRheCBlcnJvcjonLFxuXHRcdFx0ZmlsZW5hbWUgPT09ICcqJ1xuXHRcdFx0PyBgSSBndWVzdCBpdCBtYXkgYmUgJHtzb3VyY2V9ICwgYnV0IG5vdCBzdXJlLi4uYFxuXHRcdFx0OiBmaWxlbmFtZVxuXHRcdF0pXG5cdFx0aW5mby5wdXNoKFtdKVxuXG5cdFx0Y29uc3QgbGluZXMgPSByZWFkRmlsZVN5bmMoZmlsZW5hbWUgPT09ICcqJyA/IHNvdXJjZSA6IGZpbGVuYW1lKS50b1N0cmluZygpLnNwbGl0KC9cXHI/XFxuLylcblx0XHRsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSArPSAnXFx1ezFGNTFBfSdcblxuXHRcdGNvbnN0IHN0YXJ0TGluZSA9IE1hdGgubWF4KGUucG9zaXRpb25bMV0gLSA4LCAwKSxcblx0XHRcdGVuZExpbmUgPSBNYXRoLm1pbihlLnBvc2l0aW9uWzFdICsgNywgbGluZXMubGVuZ3RoKVxuXG5cdFx0Y29uc3Qgc2hvd0xpbmVzID0gbGluZXMuc2xpY2Uoc3RhcnRMaW5lLCBlbmRMaW5lKS5tYXAoXG5cdFx0XHQobGluZSwgaSkgPT4gKHN0YXJ0TGluZSArIGkgKyAxKSArICcgfCAnICsgbGluZS5yZXBsYWNlKC9cXHQvZywgJyAgICAnKSlcblxuXHRcdHZhciBzcGFjZXMgPSAnICcucmVwZWF0KFN0cmluZyhsaW5lKS5sZW5ndGggKyAyICsgY29sKVxuXHRcdHNob3dMaW5lcy5zcGxpY2UobGluZSAtIHN0YXJ0TGluZSwgMCxcblx0XHRcdHNwYWNlcyArICdeJyxcblx0XHRcdHNwYWNlcyArICd8X18gT29vcHMsICcgKyBlcnJvclR5cGUgKyAnIGF0IGxpbmUgJyArIGxpbmUgKyAnLCBjb2x1bW4gJyArIGNvbCxcblx0XHRcdHNwYWNlcylcblxuXHRcdHNob3dMaW5lcy5mb3JFYWNoKGwgPT4gaW5mby5wdXNoKFtsXSkpXG5cblx0fSBlbHNlIHtcblx0XHRpbmZvLnB1c2goW1N0cmluZyhlcnIgPSBlLnN0YWNrIHx8IGUubWVzc2FnZSB8fCBlKV0pXG5cdH1cblx0cmV0dXJuIGluZm9cbn1cblxuLy8gZXhwb3J0IGZ1bmN0aW9uIG1hdGNoKHBhdHRlcm4pIHtcbi8vIFx0aWYgKHR5cGVvZiBwYXR0ZXJuID09PSAnZnVuY3Rpb24nICYmIHBhdHRlcm4ucHJvdG90eXBlKSByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIHBhdHRlcm5cbi8vIFx0aWYgKHBhdHRlcm4gJiYgdHlwZW9mIHBhdHRlcm4udGVzdCA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHBhdHRlcm4udGVzdCh0aGlzKVxuLy8gXHRzd2l0Y2ggKHR5cGVvZiB0aGlzKSB7XG4vLyBcdFx0Y2FzZSAndW5kZWZpbmVkJzpcbi8vIFx0XHRjYXNlICdib29sZWFuJzpcbi8vIFx0XHRjYXNlICdudW1iZXInOlxuLy8gXHRcdGNhc2UgJ3N0cmluZyc6XG4vLyBcdFx0Y2FzZSAnc3ltYm9sJzpcbi8vIFx0XHRcdHJldHVybiB0aGlzID09PSBwYXR0ZXJuXG4vLyBcdFx0Y2FzZSAnb2JqZWN0Jzpcbi8vIFx0XHRcdGlmICh0aGlzID09PSBudWxsKSByZXR1cm4gcGF0dGVybiA9PT0gbnVsbFxuLy8gXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkocGF0dGVybikpIHJldHVybiBwYXR0ZXJuLmV2ZXJ5KChwLCBpKSA9PiB0aGlzW2ldOjptYXRjaChwKSlcbi8vIFx0XHRcdGlmICh0eXBlb2YgcGF0dGVybiA9PT0gJ29iamVjdCcpIHJldHVybiBPYmplY3Qua2V5cyhwYXR0ZXJuKS5ldmVyeShrZXkgPT4gdGhpc1trZXldOjptYXRjaChwYXR0ZXJuW2tleV0pKVxuLy8gXHRcdFx0cmV0dXJuIGZhbHNlXG4vLyBcdFx0ZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKCdzaG91bGQgbm90IGJlIGZ1bmN0aW9uJylcbi8vIFx0fVxuLy8gfVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9