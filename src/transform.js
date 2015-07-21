'use strict';

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports['default'] = transform;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _util2 = require('./util2');

var _fs = require('fs');

var _ = require('.');

var _util = require('./util');

var _transformer = require('./transformer');

var _transformer2 = _interopRequireDefault(_transformer);

var debug = (0, _debug2['default'])('transform');

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
	if (!tree) throw new Error('Failed to load ' + name);
	return tree;
}

function transform(tree) {
	var show = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

	if (show[0]) (0, _util.dir)(tree);

	console.time('transform 1');
	tree = transformImport(tree);
	console.timeEnd('transform 1');
	if (show[1]) (0, _util.dir)(tree);

	console.time('transform 2');
	tree = _transformer2['default'].DocumentStripper.match(tree, 'document');
	//tree = transformer.TemplateMatcher.match(tree, 'document')
	tree = _transformer2['default'].ScriptIIFEWrapper.match(tree, 'document');
	console.timeEnd('transform 2');
	if (show[2]) (0, _util.dir)(tree);

	console.time('transform 3');
	tree = _transformer2['default'].Sorter.match(tree, 'document');
	console.timeEnd('transform 3');
	if (show[3]) (0, _util.dir)(tree);

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
		debug('replace default content to', blocks, contentFragment.childNodes);
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
//# sourceMappingURL=data:application/json;base64,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QUFPO0FBQUUsV0FBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxBQUFDLE1BQUs7QUFBQSxBQUN0QztBQUFTLFdBQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSTtBQUFBLE1BQUEsQ0FDOUI7R0FDRDtBQUNELFNBQU8sTUFBTSxDQUFBO0VBQ2IsQ0FBQTtDQUNEIiwiZmlsZSI6InRyYW5zZm9ybS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBEZWJ1ZyBmcm9tICdkZWJ1ZydcbmNvbnN0IGRlYnVnID0gRGVidWcoJ3RyYW5zZm9ybScpXG5cbmltcG9ydCB7dHVwbGUycmVjb3JkLCByZWNvcmQydHVwbGUsIHRyYXZlcnNlLCByZXNvbHZlLCBxdWVyeX0gZnJvbSAnLi91dGlsMidcbmZ1bmN0aW9uIHRyYW5zZm9ybUltcG9ydChkb2N1bWVudCkge1xuXHRyZXR1cm4gZG9jdW1lbnQ6OnRyYXZlcnNlKG5vZGUgPT4ge1xuXHRcdGNvbnN0IHtub2RlVHlwZSwgcG9zaXRpb246IFtwYXRoXX0gPSBub2RlXG5cdFx0aWYgKG5vZGVUeXBlICE9PSAnZG9jdW1lbnQnKSB0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdG5vZGUuY2hpbGROb2RlcyA9IG5vZGUuY2hpbGROb2Rlczo6dHJhdmVyc2UoKHtwb3NpdGlvbn0pID0+IHtcblx0XHRcdHBvc2l0aW9uLnVuc2hpZnQocGF0aClcblx0XHR9LCB1bmRlZmluZWQsIHRydWUpXG5cdFx0cmV0dXJuIGZhbHNlXG5cdH0pOjp0cmF2ZXJzZShub2RlID0+IHtcblx0XHRjb25zdCB7bm9kZVR5cGUsIHBvc2l0aW9uOiBbcGF0aF0sIG5vZGVOYW1lLCBub2RlVmFsdWUsIGNoaWxkTm9kZXN9ID0gbm9kZVxuXHRcdGlmIChub2RlVHlwZSA9PT0gJ2luc3RydWN0aW9uJyAmJiBub2RlTmFtZSA9PT0gJ2ltcG9ydCcpIHtcblx0XHRcdGxldCB0cmVlID0gbG9hZFRyZWUocmVzb2x2ZShub2RlVmFsdWUsIHBhdGgpKVxuXHRcdFx0dHJlZSA9IG92ZXJyaWRlKHRyZWUsIGNoaWxkTm9kZXMpXG5cdFx0XHRPYmplY3QuYXNzaWduKG5vZGUsIHRyZWUpXG5cdFx0fVxuXHR9LCAncG9zdCcpXG59XG5cbmltcG9ydCB7ZXhpc3RzU3luY30gZnJvbSAnZnMnXG5pbXBvcnQge3BhcnNlRmlsZX0gZnJvbSAnLidcbmZ1bmN0aW9uIGxvYWRUcmVlKG5hbWUpIHtcblx0bGV0IHBhdGgsIGZyYWdcblx0Y29uc3QgaSA9IG5hbWUubGFzdEluZGV4T2YoJyMnKVxuXHRpZiAoaSA+PSAwKSB7XG5cdFx0cGF0aCA9IG5hbWUuc2xpY2UoMCwgaSlcblx0XHRmcmFnID0gbmFtZS5zbGljZShpICsgMSlcblx0fSBlbHNlIHBhdGggPSBuYW1lXG5cblx0aWYgKGV4aXN0c1N5bmMocGF0aCArICcuamVkaScpKSBwYXRoICs9ICcuamVkaSdcblx0bGV0IHRyZWUgPSBwYXJzZUZpbGUocGF0aClcblx0dHJlZSA9IHRyYW5zZm9ybUltcG9ydCh0cmVlKVxuXHRpZiAoIWZyYWcpIHJldHVybiB0cmVlXG5cdHRyZWUgPSB0cmVlOjpxdWVyeSgoe25vZGVUeXBlLCBub2RlTmFtZSwgbm9kZVZhbHVlLCBpZH0pID0+XG5cdFx0bm9kZVR5cGUgPT09ICdmcmFnbWVudCcgJiYgbm9kZU5hbWUgPT09IGZyYWcgJiYgbm9kZVZhbHVlID09PSB1bmRlZmluZWRcblx0XHR8fCBub2RlVHlwZSA9PT0gJ2VsZW1lbnQnICYmIGlkID09PSBmcmFnKVxuXHRpZiAoIXRyZWUpIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGxvYWQgJyArIG5hbWUpXG5cdHJldHVybiB0cmVlXG59XG5cbmltcG9ydCB7ZGlyfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgdHJhbnNmb3JtZXIgZnJvbSAnLi90cmFuc2Zvcm1lcidcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRyYW5zZm9ybSh0cmVlLCBzaG93ID0gW10pIHtcblx0aWYgKHNob3dbMF0pIGRpcih0cmVlKVxuXG5cdGNvbnNvbGUudGltZSgndHJhbnNmb3JtIDEnKVxuXHR0cmVlID0gdHJhbnNmb3JtSW1wb3J0KHRyZWUpXG5cdGNvbnNvbGUudGltZUVuZCgndHJhbnNmb3JtIDEnKVxuXHRpZiAoc2hvd1sxXSkgZGlyKHRyZWUpXG5cblx0Y29uc29sZS50aW1lKCd0cmFuc2Zvcm0gMicpXG5cdHRyZWUgPSB0cmFuc2Zvcm1lci5Eb2N1bWVudFN0cmlwcGVyLm1hdGNoKHRyZWUsICdkb2N1bWVudCcpXG5cdC8vdHJlZSA9IHRyYW5zZm9ybWVyLlRlbXBsYXRlTWF0Y2hlci5tYXRjaCh0cmVlLCAnZG9jdW1lbnQnKVxuXHR0cmVlID0gdHJhbnNmb3JtZXIuU2NyaXB0SUlGRVdyYXBwZXIubWF0Y2godHJlZSwgJ2RvY3VtZW50Jylcblx0Y29uc29sZS50aW1lRW5kKCd0cmFuc2Zvcm0gMicpXG5cdGlmIChzaG93WzJdKSBkaXIodHJlZSlcblxuXHRjb25zb2xlLnRpbWUoJ3RyYW5zZm9ybSAzJylcblx0dHJlZSA9IHRyYW5zZm9ybWVyLlNvcnRlci5tYXRjaCh0cmVlLCAnZG9jdW1lbnQnKVxuXHRjb25zb2xlLnRpbWVFbmQoJ3RyYW5zZm9ybSAzJylcblx0aWYgKHNob3dbM10pIGRpcih0cmVlKVxuXG5cdHJldHVybiB0cmVlXG59XG5cbmZ1bmN0aW9uIG92ZXJyaWRlKHRlbXBsYXRlLCBibG9ja3MpIHtcblxuXHRibG9ja3MgPSBibG9ja3MubWFwKHR1cGxlMnJlY29yZClcblx0bGV0IGNvbnRlbnRGcmFnbWVudFxuXG5cdGNvbnN0IHRwbCA9IHR1cGxlMnJlY29yZCh0ZW1wbGF0ZSlcblx0dHBsLmNoaWxkTm9kZXM6OnRyYXZlcnNlKG5vZGUgPT4ge1xuXG5cdFx0bGV0IGZyYWdcblx0XHRpZiAobm9kZS5ub2RlVHlwZSA9PT0gJ2ZyYWdtZW50JyAmJiBub2RlLm5vZGVWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRmcmFnID0gbm9kZS5ub2RlTmFtZVxuXHRcdH0gZWxzZSBpZiAobm9kZS5ub2RlVHlwZSA9PT0gJ2VsZW1lbnQnICYmIG5vZGUuaWQpIHtcblx0XHRcdGZyYWcgPSBub2RlLmlkXG5cdFx0fSBlbHNlIGlmIChub2RlLm5vZGVUeXBlID09PSAnbWFjcm8nKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHR9XG5cdFx0aWYgKGZyYWcpIHtcblx0XHRcdGxldCBmcmFncyA9IHtyZXBsYWNlOiB1bmRlZmluZWQsIGJlZm9yZXM6IFtdLCBhZnRlcnM6IFtdLCByZXN0OiBbXX1cblx0XHRcdGZyYWdzID0gYmxvY2tzLnJlZHVjZShtYXRjaGVzRnJhZ21lbnQoZnJhZyksIGZyYWdzKVxuXHRcdFx0YmxvY2tzID0gZnJhZ3MucmVzdFxuXHRcdFx0aWYgKGZyYWdzLnJlcGxhY2UpIHtcblx0XHRcdFx0bm9kZS5jaGlsZE5vZGVzLnNwbGljZSgwLCBJbmZpbml0eSwgLi4uZnJhZ3MucmVwbGFjZS5jaGlsZE5vZGVzKVxuXHRcdFx0fSBlbHNlIGlmIChmcmFnID09PSAnY29udGVudCcpIHtcblx0XHRcdFx0Y29udGVudEZyYWdtZW50ID0gbm9kZVxuXHRcdFx0fVxuXHRcdFx0aWYgKGZyYWdzLmJlZm9yZXMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRjb25zdCBpID0gbm9kZS5jaGlsZE5vZGVzLmZpbmRJbmRleChjaGlsZCA9PiB7XG5cdFx0XHRcdFx0Y29uc3Qge25vZGVUeXBlLCBub2RlTmFtZSwgbm9kZVZhbHVlfSA9IHR1cGxlMnJlY29yZChjaGlsZClcblx0XHRcdFx0XHRyZXR1cm4gbm9kZVR5cGUgIT09ICdmcmFnbWVudCcgfHwgbm9kZU5hbWUgIT09IGZyYWcgfHwgbm9kZVZhbHVlICE9PSAnYmVmb3JlJ1xuXHRcdFx0XHR9KVxuXHRcdFx0XHRub2RlLmNoaWxkTm9kZXMuc3BsaWNlKDAsIGksIC4uLmZyYWdzLmJlZm9yZXMubWFwKHJlY29yZDJ0dXBsZSkpXG5cdFx0XHR9XG5cdFx0XHRpZiAoZnJhZ3MuYWZ0ZXJzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0bGV0IGxhc3Rcblx0XHRcdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdFx0XHRsYXN0ID0gbm9kZS5jaGlsZE5vZGVzLnBvcCgpXG5cdFx0XHRcdFx0Y29uc3Qge25vZGVUeXBlLCBub2RlTmFtZSwgbm9kZVZhbHVlfSA9IHR1cGxlMnJlY29yZChsYXN0KVxuXHRcdFx0XHRcdGlmICghKG5vZGVUeXBlID09PSAnZnJhZ21lbnQnICYmIG5vZGVOYW1lID09PSBmcmFnICYmIG5vZGVWYWx1ZSA9PT0gJ2FmdGVyJykpIGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdFx0bm9kZS5jaGlsZE5vZGVzLnB1c2gobGFzdCwgLi4uZnJhZ3MuYWZ0ZXJzLm1hcChyZWNvcmQydHVwbGUpKVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0fVxuXG5cdH0pXG5cdGlmIChjb250ZW50RnJhZ21lbnQpIHtcblx0XHRjb250ZW50RnJhZ21lbnQuY2hpbGROb2Rlcy5zcGxpY2UoMCwgSW5maW5pdHksIC4uLmJsb2Nrcy5tYXAocmVjb3JkMnR1cGxlKSlcblx0XHRkZWJ1ZygncmVwbGFjZSBkZWZhdWx0IGNvbnRlbnQgdG8nLFxuXHRcdFx0YmxvY2tzLFxuXHRcdFx0Y29udGVudEZyYWdtZW50LmNoaWxkTm9kZXMpXG5cdH1cblxuXHRyZXR1cm4gdHBsXG59XG5cbmZ1bmN0aW9uIG1hdGNoZXNGcmFnbWVudChmcmFnTmFtZSkge1xuXHRyZXR1cm4gKHJlc3VsdCwgbm9kZSkgPT4ge1xuXHRcdGNvbnN0IHtiZWZvcmVzLCBhZnRlcnMsIHJlc3R9ID0gcmVzdWx0XG5cdFx0aWYgKG5vZGUubm9kZVR5cGUgIT09ICdmcmFnbWVudCcgfHwgbm9kZS5ub2RlTmFtZSAhPT0gZnJhZ05hbWUpIHJlc3QucHVzaChub2RlKVxuXHRcdGVsc2Uge1xuXHRcdFx0c3dpdGNoIChub2RlLm5vZGVWYWx1ZSkge1xuXHRcdFx0XHRjYXNlICdiZWZvcmUnOiBiZWZvcmVzLnB1c2gobm9kZSk7IGJyZWFrXG5cdFx0XHRcdGNhc2UgJ2FmdGVyJzogYWZ0ZXJzLnB1c2gobm9kZSk7IGJyZWFrXG5cdFx0XHRcdGRlZmF1bHQ6IHJlc3VsdC5yZXBsYWNlID0gbm9kZSAvL1RPRE86IHRocm93IGVycm9yIGlmIG11bHRpcGxlIHJlcGxhY2VtZW50XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHRcblx0fVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9