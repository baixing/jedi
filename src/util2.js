'use strict';

var _toArray = require('babel-runtime/helpers/to-array')['default'];

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _objectWithoutProperties = require('babel-runtime/helpers/object-without-properties')['default'];

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.resolve = resolve;
exports.match = match;
exports.query = query;
exports.queryAll = queryAll;
exports.traverse = traverse;

var _url = require('url');

var _fs = require('fs');

function resolve(name, referrer) {
	var path = (0, _url.resolve)(referrer, name);
	if (!(0, _fs.existsSync)(path + '.jedi')) return path + '.jedi';
	return path;
}

function match(pattern) {
	var _this = this;

	if (typeof pattern === 'function' && pattern.prototype) return this instanceof pattern;
	if (pattern && typeof pattern.test === 'function') return pattern.test(this);
	switch (typeof this) {
		case 'undefined':
		case 'boolean':
		case 'number':
		case 'string':
		case 'symbol':
			return this === pattern;
		case 'object':
			if (this === null) return pattern === null;
			if (Array.isArray(pattern)) return pattern.every(function (p, i) {
				var _context;

				return (_context = _this[i], match).call(_context, p);
			});
			if (typeof pattern === 'object') return _Object$keys(pattern).every(function (key) {
				var _context2;

				return (_context2 = _this[key], match).call(_context2, pattern[key]);
			});
			return false;
		default:
			throw new Error('should not be function');
	}
}

function query(f, order) {
	var match = undefined;
	traverse.call(this, function (node) {
		if (match) return false;
		if (f(node)) {
			match = node;
			return false;
		}
	}, order);
	return record2tuple(match);
}

function queryAll(f, order) {
	var matches = [];
	traverse.call(this, function (node) {
		if (f(node)) matches.push(node);
	}, order);
	return matches;
}

function traverse(f, order, traverseAll) {
	var _this2 = this;

	if (order === undefined) order = 'pre';

	if (skip(this)) return this;

	if (isNode(this)) {
		var _ret = (function () {
			var traverseChildNodes = function traverseChildNodes() {
				if (Array.isArray(node.childNodes)) {
					node.childNodes = node.childNodes.map(function (child) {
						return traverse.call(child, f, order, traverseAll);
					});
				}
				if (traverseAll) {
					if (Array.isArray(node.binding) && isNode(node.binding)) {
						var _context3;

						node.binding = (_context3 = node.binding, traverse).call(_context3, f, order, traverseAll);
					}
					// if (Array.isArray(node.data) && Array.isArray(node.data[node.data.length - 1])) {
					// 	node.data[node.data.length - 1] = node.data[node.data.length - 1].map(child => child::traverse(f, order, traverseAll))
					// }
				}
			};

			var node = tuple2record(_this2);
			if (order === 'post') traverseChildNodes();
			var recursive = f(node);
			if (recursive || recursive === undefined && order === 'pre') traverseChildNodes();
			return {
				v: record2tuple(node)
			};
		})();

		if (typeof _ret === 'object') return _ret.v;
	}

	if (Array.isArray(this)) {
		return this.map(function (child) {
			return traverse.call(child, f, order, traverseAll);
		});
	}

	throw new Error(this);
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
function isNode(nodeTuple) {
	return /^(?:document|element|attribute|text|comment|scriptsource|suppress|inject|binding|instruction|macro|fragment|Section|Offside|MixedWhitespace|Error)$/.test(nodeTuple[0]);
}

function skip(nodeTuple) {
	var white = /^\s*$/;
	if (typeof nodeTuple === 'string') return white.test(nodeTuple);
	if (typeof nodeTuple === 'undefined') return true;
	//if (!Array.isArray(nodeTuple)) throw new Error(nodeTuple)
	return white.test(nodeTuple[0]) || nodeTuple[0] === 'closeStartTag';
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