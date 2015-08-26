// must load coffee-script before source-map-support due to
// https://github.com/evanw/node-source-map-support/issues/34
require('coffee-script/register')
require('source-map-support').install()
require('babel/register')
require('../lib/ometa-js')
require('./suites')
