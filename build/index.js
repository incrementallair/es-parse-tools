"use strict";
var $__resolve__,
    $__parse__;
require('traceur/bin/traceur-runtime');
var resolveModulePath = ($__resolve__ = require("./resolve"), $__resolve__ && $__resolve__.__esModule && $__resolve__ || {default: $__resolve__}).resolveModulePath;
var parseBuffer = ($__parse__ = require("./parse"), $__parse__ && $__parse__.__esModule && $__parse__ || {default: $__parse__}).parseBuffer;
module.exports = {
  parseBuffer: parseBuffer,
  resolveModulePath: resolveModulePath
};
