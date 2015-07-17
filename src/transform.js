'use strict';

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports['default'] = transform;

var _util = require('./util');

var _util2 = require('./util2');

var _fs = require('fs');

var _ = require('.');

var _transformer = require('./transformer');

var _transformer2 = _interopRequireDefault(_transformer);

function transformImport(document) {
	var _context;

	return (_context = _util2.traverse.call(document, function (node) {
		var _context2;

		var nodeType = node.nodeType;

		var _node$position = _slicedToArray(node.position, 1);

		var path = _node$position[0];

		if (nodeType !== 'document') throw new Error();
		node.childNodes = (_context2 = node.childNodes, _util2.traverse).call(_context2, function (_ref) {
			var position = _ref.position;

			position.unshift(path);
		}, undefined, true);
		return false;
	}), _util2.traverse).call(_context, function (node) {
		var nodeType = node.nodeType;

		var _node$position2 = _slicedToArray(node.position, 1);

		var path = _node$position2[0];
		var nodeName = node.nodeName;
		var nodeValue = node.nodeValue;
		var childNodes = node.childNodes;

		if (nodeType === 'instruction' && nodeName === 'import') {
			var tree = loadTree((0, _util2.resolve)(nodeValue, path));
			tree = override(tree, childNodes);
			_Object$assign(node, tree);
		}
	}, 'post');
}

function loadTree(name) {
	var path = undefined,
	    frag = undefined;
	var i = name.lastIndexOf('#');
	if (i >= 0) {
		path = name.slice(0, i);
		frag = name.slice(i + 1);
	} else path = name;

	if ((0, _fs.existsSync)(path + '.jedi')) path += '.jedi';
	var tree = (0, _.parseFile)(path);
	tree = transformImport(tree);
	if (!frag) return tree;
	tree = _util2.query.call(tree, function (_ref2) {
		var nodeType = _ref2.nodeType;
		var nodeName = _ref2.nodeName;
		var nodeValue = _ref2.nodeValue;
		var id = _ref2.id;
		return nodeType === 'fragment' && nodeName === frag && nodeValue === undefined || nodeType === 'element' && id === frag;
	});
	return tree;
}

function transform(tree) {
	var debug = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

	if (debug[0]) (0, _util.dir)(tree);

	console.time('tr1');
	tree = transformImport(tree);
	console.timeEnd('tr1');
	if (debug[1]) (0, _util.dir)(tree);

	console.time('tr2');
	tree = _transformer2['default'].DocumentStripper.match(tree, 'document');
	//tree = transformer.TemplateMatcher.match(tree, 'document')
	//tree = transformer.ScriptIIFEWrapper.match(tree, 'document')
	console.timeEnd('tr2');
	if (debug[2]) (0, _util.dir)(tree);

	console.time('tr3');
	tree = _transformer2['default'].Sorter.match(tree, 'document');
	console.timeEnd('tr3');
	if (debug[3]) (0, _util.dir)(tree);

	return tree;
}

function override(template, blocks) {
	var _context3;

	blocks = blocks.map(_util2.tuple2record);
	var contentFragment = undefined;

	var tpl = (0, _util2.tuple2record)(template);
	(_context3 = tpl.childNodes, _util2.traverse).call(_context3, function (node) {

		var frag = undefined;
		if (node.nodeType === 'fragment' && node.nodeValue === undefined) {
			frag = node.nodeName;
		} else if (node.nodeType === 'element' && node.id) {
			frag = node.id;
		} else if (node.nodeType === 'macro') {
			return false;
		}
		if (frag) {
			var frags = { replace: undefined, befores: [], afters: [], rest: [] };
			frags = blocks.reduce(matchesFragment(frag), frags);
			blocks = frags.rest;
			if (frags.replace) {
				var _node$childNodes;

				(_node$childNodes = node.childNodes).splice.apply(_node$childNodes, [0, Infinity].concat(_toConsumableArray(frags.replace.childNodes)));
			} else if (frag === 'content') {
				contentFragment = node;
			}
			if (frags.befores.length > 0) {
				var _node$childNodes2;

				var i = node.childNodes.findIndex(function (child) {
					var _tuple2record = (0, _util2.tuple2record)(child);

					var nodeType = _tuple2record.nodeType;
					var nodeName = _tuple2record.nodeName;
					var nodeValue = _tuple2record.nodeValue;

					return nodeType !== 'fragment' || nodeName !== frag || nodeValue !== 'before';
				});
				(_node$childNodes2 = node.childNodes).splice.apply(_node$childNodes2, [0, i].concat(_toConsumableArray(frags.befores.map(_util2.record2tuple))));
			}
			if (frags.afters.length > 0) {
				var _node$childNodes3;

				var last = undefined;
				while (true) {
					last = node.childNodes.pop();

					var _tuple2record2 = (0, _util2.tuple2record)(last);

					var nodeType = _tuple2record2.nodeType;
					var nodeName = _tuple2record2.nodeName;
					var nodeValue = _tuple2record2.nodeValue;

					if (!(nodeType === 'fragment' && nodeName === frag && nodeValue === 'after')) break;
				}
				(_node$childNodes3 = node.childNodes).push.apply(_node$childNodes3, [last].concat(_toConsumableArray(frags.afters.map(_util2.record2tuple))));
			}
			return false;
		}
	});
	if (contentFragment) {
		var _contentFragment$childNodes;

		(_contentFragment$childNodes = contentFragment.childNodes).splice.apply(_contentFragment$childNodes, [0, Infinity].concat(_toConsumableArray(blocks.map(_util2.record2tuple))));
		console.log('replace default content to', blocks, contentFragment.childNodes);
	}

	return tpl;
}

function matchesFragment(fragName) {
	return function (result, node) {
		var befores = result.befores;
		var afters = result.afters;
		var rest = result.rest;

		if (node.nodeType !== 'fragment' || node.nodeName !== fragName) rest.push(node);else {
			switch (node.nodeValue) {
				case 'before':
					befores.push(node);break;
				case 'after':
					afters.push(node);break;
				default:
					result.replace = node //TODO: throw error if multiple replacement
					;}
		}
		return result;
	};
}
module.exports = exports['default'];