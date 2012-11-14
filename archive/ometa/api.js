var ometajs = require('ometajs'),
    //uglify = require('uglify-js'),
    utils = ometajs.utils,
    vm = require('vm'),
    //Module = require('module'),
    fail = ometajs.globals.fail;
    objectThatDelegatesTo = ometajs.globals.objectThatDelegatesTo;

function compilationError(m, i) {
  throw objectThatDelegatesTo(fail, {errorPos: i});
};

function translationError(m, i) {
  throw fail;
};

function wrapModule(code, options) {
  var buf = [
    'var ometajs_ = require(\'',
    options.root || ometajs.root || 'ometajs',
    '\').globals;'
  ];

  Object.keys(ometajs.globals).forEach(function(key) {
    buf.push('var ', key, ' = ometajs_.', key, ';\n');
  });
  buf.push(code);

  return buf.join('');
};

function translateCode(code, options) {
  options || (options = {});
  var tree = ometajs.BSOMetaJSParser.matchAll(code, "topLevel", undefined,
                                              compilationError);

  code = ometajs.BSOMetaJSTranslator.match(tree, "trans", undefined,
                                           translationError);

  //code = uglify.uglify.gen_code(uglify.parser.parse(code), { beautify: true });

  if (options.noContext) return code;

  return wrapModule(code, options);
};
exports.translateCode = translateCode;

function evalCode(code, filename, options) {
  options || (options = {});
  options.noContext = true;

  code = translateCode(code, options);
  return vm.runInNewContext('var exports = {};' + code + '\n;exports',
                            utils.clone(ometajs.globals),
                            filename || 'ometa');
};
exports.evalCode = evalCode;

require.extensions['.ometajs'] = function(module, filename) {
  var code = translateCode(require('fs').readFileSync(filename).toString());

  module._compile(code, filename);
};