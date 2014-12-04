"use strict";
var $__traceur_64_0_46_0_46_74_47_bin_47_traceur_45_runtime__,
    $__resolve__,
    $__parse__,
    $__fs__;
($__traceur_64_0_46_0_46_74_47_bin_47_traceur_45_runtime__ = require("traceur/bin/traceur-runtime"), $__traceur_64_0_46_0_46_74_47_bin_47_traceur_45_runtime__ && $__traceur_64_0_46_0_46_74_47_bin_47_traceur_45_runtime__.__esModule && $__traceur_64_0_46_0_46_74_47_bin_47_traceur_45_runtime__ || {default: $__traceur_64_0_46_0_46_74_47_bin_47_traceur_45_runtime__});
var resolveModulePath = ($__resolve__ = require("./resolve"), $__resolve__ && $__resolve__.__esModule && $__resolve__ || {default: $__resolve__}).resolveModulePath;
var parseBuffer = ($__parse__ = require("./parse"), $__parse__ && $__parse__.__esModule && $__parse__ || {default: $__parse__}).parseBuffer;
var fs = ($__fs__ = require("fs"), $__fs__ && $__fs__.__esModule && $__fs__ || {default: $__fs__}).default;
var buf = fs.readFileSync('../lib/parse.js');
parseBuffer(buf, '../lib/parse.js', (function(error, res) {
  console.log("asd");
}));
module.exports = {
  parseBuffer: parseBuffer,
  resolveModulePath: resolveModulePath
};
