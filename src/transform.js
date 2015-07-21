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

			if (position.length === 2) position.unshift(path);
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
//# sourceMappingURL=data:application/json;base64,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QUMsQ0FBQyxBQUFDLE1BQUs7QUFBQSxBQUN4QyxTQUFLLE9BQU87QUFBRSxXQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEFBQUMsTUFBSztBQUFBLEFBQ3RDO0FBQVMsV0FBTSxDQUFDLE9BQU8sR0FBRyxJQUFJO0FBQUEsTUFBQSxDQUM5QjtHQUNEO0FBQ0QsU0FBTyxNQUFNLENBQUE7RUFDYixDQUFBO0NBQ0QiLCJmaWxlIjoidHJhbnNmb3JtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERlYnVnIGZyb20gJ2RlYnVnJ1xuY29uc3QgZGVidWcgPSBEZWJ1ZygndHJhbnNmb3JtJylcblxuaW1wb3J0IHt0dXBsZTJyZWNvcmQsIHJlY29yZDJ0dXBsZSwgdHJhdmVyc2UsIHJlc29sdmUsIHF1ZXJ5fSBmcm9tICcuL3V0aWwyJ1xuZnVuY3Rpb24gdHJhbnNmb3JtSW1wb3J0KGRvY3VtZW50KSB7XG5cdHJldHVybiBkb2N1bWVudDo6dHJhdmVyc2Uobm9kZSA9PiB7XG5cdFx0Y29uc3Qge25vZGVUeXBlLCBwb3NpdGlvbjogW3BhdGhdfSA9IG5vZGVcblx0XHRpZiAobm9kZVR5cGUgIT09ICdkb2N1bWVudCcpIHRocm93IG5ldyBFcnJvcigpXG5cdFx0bm9kZS5jaGlsZE5vZGVzID0gbm9kZS5jaGlsZE5vZGVzOjp0cmF2ZXJzZSgoe3Bvc2l0aW9ufSkgPT4ge1xuXHRcdFx0aWYgKHBvc2l0aW9uLmxlbmd0aCA9PT0gMikgcG9zaXRpb24udW5zaGlmdChwYXRoKVxuXHRcdH0sIHVuZGVmaW5lZCwgdHJ1ZSlcblx0XHRyZXR1cm4gZmFsc2Vcblx0fSk6OnRyYXZlcnNlKG5vZGUgPT4ge1xuXHRcdGNvbnN0IHtub2RlVHlwZSwgcG9zaXRpb246IFtwYXRoXSwgbm9kZU5hbWUsIG5vZGVWYWx1ZSwgY2hpbGROb2Rlc30gPSBub2RlXG5cdFx0aWYgKG5vZGVUeXBlID09PSAnaW5zdHJ1Y3Rpb24nICYmIG5vZGVOYW1lID09PSAnaW1wb3J0Jykge1xuXHRcdFx0bGV0IHRyZWUgPSBsb2FkVHJlZShyZXNvbHZlKG5vZGVWYWx1ZSwgcGF0aCkpXG5cdFx0XHR0cmVlID0gb3ZlcnJpZGUodHJlZSwgY2hpbGROb2Rlcylcblx0XHRcdE9iamVjdC5hc3NpZ24obm9kZSwgdHJlZSlcblx0XHR9XG5cdH0sICdwb3N0Jylcbn1cblxuaW1wb3J0IHtleGlzdHNTeW5jfSBmcm9tICdmcydcbmltcG9ydCB7cGFyc2VGaWxlfSBmcm9tICcuJ1xuZnVuY3Rpb24gbG9hZFRyZWUobmFtZSkge1xuXHRsZXQgcGF0aCwgZnJhZ1xuXHRjb25zdCBpID0gbmFtZS5sYXN0SW5kZXhPZignIycpXG5cdGlmIChpID49IDApIHtcblx0XHRwYXRoID0gbmFtZS5zbGljZSgwLCBpKVxuXHRcdGZyYWcgPSBuYW1lLnNsaWNlKGkgKyAxKVxuXHR9IGVsc2UgcGF0aCA9IG5hbWVcblxuXHRpZiAoZXhpc3RzU3luYyhwYXRoICsgJy5qZWRpJykpIHBhdGggKz0gJy5qZWRpJ1xuXHRsZXQgdHJlZSA9IHBhcnNlRmlsZShwYXRoKVxuXHR0cmVlID0gdHJhbnNmb3JtSW1wb3J0KHRyZWUpXG5cdGlmICghZnJhZykgcmV0dXJuIHRyZWVcblx0dHJlZSA9IHRyZWU6OnF1ZXJ5KCh7bm9kZVR5cGUsIG5vZGVOYW1lLCBub2RlVmFsdWUsIGlkfSkgPT5cblx0XHRub2RlVHlwZSA9PT0gJ2ZyYWdtZW50JyAmJiBub2RlTmFtZSA9PT0gZnJhZyAmJiBub2RlVmFsdWUgPT09IHVuZGVmaW5lZFxuXHRcdHx8IG5vZGVUeXBlID09PSAnZWxlbWVudCcgJiYgaWQgPT09IGZyYWcpXG5cdGlmICghdHJlZSkgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gbG9hZCAnICsgbmFtZSlcblx0cmV0dXJuIHRyZWVcbn1cblxuaW1wb3J0IHtkaXJ9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB0cmFuc2Zvcm1lciBmcm9tICcuL3RyYW5zZm9ybWVyJ1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdHJhbnNmb3JtKHRyZWUsIHNob3cgPSBbXSkge1xuXHRpZiAoc2hvd1swXSkgZGlyKHRyZWUpXG5cblx0Y29uc29sZS50aW1lKCd0cmFuc2Zvcm0gMScpXG5cdHRyZWUgPSB0cmFuc2Zvcm1JbXBvcnQodHJlZSlcblx0Y29uc29sZS50aW1lRW5kKCd0cmFuc2Zvcm0gMScpXG5cdGlmIChzaG93WzFdKSBkaXIodHJlZSlcblxuXHRjb25zb2xlLnRpbWUoJ3RyYW5zZm9ybSAyJylcblx0dHJlZSA9IHRyYW5zZm9ybWVyLkRvY3VtZW50U3RyaXBwZXIubWF0Y2godHJlZSwgJ2RvY3VtZW50Jylcblx0Ly90cmVlID0gdHJhbnNmb3JtZXIuVGVtcGxhdGVNYXRjaGVyLm1hdGNoKHRyZWUsICdkb2N1bWVudCcpXG5cdHRyZWUgPSB0cmFuc2Zvcm1lci5TY3JpcHRJSUZFV3JhcHBlci5tYXRjaCh0cmVlLCAnZG9jdW1lbnQnKVxuXHRjb25zb2xlLnRpbWVFbmQoJ3RyYW5zZm9ybSAyJylcblx0aWYgKHNob3dbMl0pIGRpcih0cmVlKVxuXG5cdGNvbnNvbGUudGltZSgndHJhbnNmb3JtIDMnKVxuXHR0cmVlID0gdHJhbnNmb3JtZXIuU29ydGVyLm1hdGNoKHRyZWUsICdkb2N1bWVudCcpXG5cdGNvbnNvbGUudGltZUVuZCgndHJhbnNmb3JtIDMnKVxuXHRpZiAoc2hvd1szXSkgZGlyKHRyZWUpXG5cblx0cmV0dXJuIHRyZWVcbn1cblxuZnVuY3Rpb24gb3ZlcnJpZGUodGVtcGxhdGUsIGJsb2Nrcykge1xuXG5cdGJsb2NrcyA9IGJsb2Nrcy5tYXAodHVwbGUycmVjb3JkKVxuXHRsZXQgY29udGVudEZyYWdtZW50XG5cblx0Y29uc3QgdHBsID0gdHVwbGUycmVjb3JkKHRlbXBsYXRlKVxuXHR0cGwuY2hpbGROb2Rlczo6dHJhdmVyc2Uobm9kZSA9PiB7XG5cblx0XHRsZXQgZnJhZ1xuXHRcdGlmIChub2RlLm5vZGVUeXBlID09PSAnZnJhZ21lbnQnICYmIG5vZGUubm9kZVZhbHVlID09PSB1bmRlZmluZWQpIHtcblx0XHRcdGZyYWcgPSBub2RlLm5vZGVOYW1lXG5cdFx0fSBlbHNlIGlmIChub2RlLm5vZGVUeXBlID09PSAnZWxlbWVudCcgJiYgbm9kZS5pZCkge1xuXHRcdFx0ZnJhZyA9IG5vZGUuaWRcblx0XHR9IGVsc2UgaWYgKG5vZGUubm9kZVR5cGUgPT09ICdtYWNybycpIHtcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdH1cblx0XHRpZiAoZnJhZykge1xuXHRcdFx0bGV0IGZyYWdzID0ge3JlcGxhY2U6IHVuZGVmaW5lZCwgYmVmb3JlczogW10sIGFmdGVyczogW10sIHJlc3Q6IFtdfVxuXHRcdFx0ZnJhZ3MgPSBibG9ja3MucmVkdWNlKG1hdGNoZXNGcmFnbWVudChmcmFnKSwgZnJhZ3MpXG5cdFx0XHRibG9ja3MgPSBmcmFncy5yZXN0XG5cdFx0XHRpZiAoZnJhZ3MucmVwbGFjZSkge1xuXHRcdFx0XHRub2RlLmNoaWxkTm9kZXMuc3BsaWNlKDAsIEluZmluaXR5LCAuLi5mcmFncy5yZXBsYWNlLmNoaWxkTm9kZXMpXG5cdFx0XHR9IGVsc2UgaWYgKGZyYWcgPT09ICdjb250ZW50Jykge1xuXHRcdFx0XHRjb250ZW50RnJhZ21lbnQgPSBub2RlXG5cdFx0XHR9XG5cdFx0XHRpZiAoZnJhZ3MuYmVmb3Jlcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGNvbnN0IGkgPSBub2RlLmNoaWxkTm9kZXMuZmluZEluZGV4KGNoaWxkID0+IHtcblx0XHRcdFx0XHRjb25zdCB7bm9kZVR5cGUsIG5vZGVOYW1lLCBub2RlVmFsdWV9ID0gdHVwbGUycmVjb3JkKGNoaWxkKVxuXHRcdFx0XHRcdHJldHVybiBub2RlVHlwZSAhPT0gJ2ZyYWdtZW50JyB8fCBub2RlTmFtZSAhPT0gZnJhZyB8fCBub2RlVmFsdWUgIT09ICdiZWZvcmUnXG5cdFx0XHRcdH0pXG5cdFx0XHRcdG5vZGUuY2hpbGROb2Rlcy5zcGxpY2UoMCwgaSwgLi4uZnJhZ3MuYmVmb3Jlcy5tYXAocmVjb3JkMnR1cGxlKSlcblx0XHRcdH1cblx0XHRcdGlmIChmcmFncy5hZnRlcnMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRsZXQgbGFzdFxuXHRcdFx0XHR3aGlsZSAodHJ1ZSkge1xuXHRcdFx0XHRcdGxhc3QgPSBub2RlLmNoaWxkTm9kZXMucG9wKClcblx0XHRcdFx0XHRjb25zdCB7bm9kZVR5cGUsIG5vZGVOYW1lLCBub2RlVmFsdWV9ID0gdHVwbGUycmVjb3JkKGxhc3QpXG5cdFx0XHRcdFx0aWYgKCEobm9kZVR5cGUgPT09ICdmcmFnbWVudCcgJiYgbm9kZU5hbWUgPT09IGZyYWcgJiYgbm9kZVZhbHVlID09PSAnYWZ0ZXInKSkgYnJlYWtcblx0XHRcdFx0fVxuXHRcdFx0XHRub2RlLmNoaWxkTm9kZXMucHVzaChsYXN0LCAuLi5mcmFncy5hZnRlcnMubWFwKHJlY29yZDJ0dXBsZSkpXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHR9XG5cblx0fSlcblx0aWYgKGNvbnRlbnRGcmFnbWVudCkge1xuXHRcdGNvbnRlbnRGcmFnbWVudC5jaGlsZE5vZGVzLnNwbGljZSgwLCBJbmZpbml0eSwgLi4uYmxvY2tzLm1hcChyZWNvcmQydHVwbGUpKVxuXHRcdGRlYnVnKCdyZXBsYWNlIGRlZmF1bHQgY29udGVudCB0bycsXG5cdFx0XHRibG9ja3MsXG5cdFx0XHRjb250ZW50RnJhZ21lbnQuY2hpbGROb2Rlcylcblx0fVxuXG5cdHJldHVybiB0cGxcbn1cblxuZnVuY3Rpb24gbWF0Y2hlc0ZyYWdtZW50KGZyYWdOYW1lKSB7XG5cdHJldHVybiAocmVzdWx0LCBub2RlKSA9PiB7XG5cdFx0Y29uc3Qge2JlZm9yZXMsIGFmdGVycywgcmVzdH0gPSByZXN1bHRcblx0XHRpZiAobm9kZS5ub2RlVHlwZSAhPT0gJ2ZyYWdtZW50JyB8fCBub2RlLm5vZGVOYW1lICE9PSBmcmFnTmFtZSkgcmVzdC5wdXNoKG5vZGUpXG5cdFx0ZWxzZSB7XG5cdFx0XHRzd2l0Y2ggKG5vZGUubm9kZVZhbHVlKSB7XG5cdFx0XHRcdGNhc2UgJ2JlZm9yZSc6IGJlZm9yZXMucHVzaChub2RlKTsgYnJlYWtcblx0XHRcdFx0Y2FzZSAnYWZ0ZXInOiBhZnRlcnMucHVzaChub2RlKTsgYnJlYWtcblx0XHRcdFx0ZGVmYXVsdDogcmVzdWx0LnJlcGxhY2UgPSBub2RlIC8vVE9ETzogdGhyb3cgZXJyb3IgaWYgbXVsdGlwbGUgcmVwbGFjZW1lbnRcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdFxuXHR9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=