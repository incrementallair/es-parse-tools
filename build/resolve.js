"use strict";
Object.defineProperties(exports, {
  resolveModulePath: {get: function() {
      return resolveModulePath;
    }},
  __esModule: {value: true}
});
var $__fs__,
    $__path__;
var fs = ($__fs__ = require("fs"), $__fs__ && $__fs__.__esModule && $__fs__ || {default: $__fs__}).default;
var path = ($__path__ = require("path"), $__path__ && $__path__.__esModule && $__path__ || {default: $__path__}).default;
function resolveModulePath(basePath, moduleString, callback) {
  var failsafeMax = 10;
  var basedir = path.dirname(basePath);
  var baseext = path.extname(basePath);
  var _moduleString = moduleString;
  if (path.extname(moduleString) != baseext)
    _moduleString += baseext;
  var basemod,
      remmod;
  var splitModule = _moduleString.split(path.sep);
  if (splitModule.length == 1 || splitModule[0] == '.') {
    if (splitModule[0] == '.')
      failsafeMax = 1;
    basemod = _moduleString;
    remmod = "";
  } else {
    basemod = splitModule[0];
    remmod = splitModule.splice(1).join(path.sep);
  }
  var failsafe = 0;
  while (basedir != path.sep && failsafe++ <= failsafeMax) {
    var libs = [""];
    var packagePath = path.join(basedir, basemod, "package.json");
    var packageJson = readFileIfExists(packagePath);
    if (packageJson && packageJson.directories) {
      if (packageJson.directories.dist)
        libs.push(packageJson.directories.dist);
      if (packageJson.directories.lib)
        libs.push(packageJson.directories.lib);
    }
    for (var $__2 = libs[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__3; !($__3 = $__2.next()).done; ) {
      var lib = $__3.value;
      {
        var attempt = path.join(basedir, basemod, lib, remmod);
        if (fs.existsSync(attempt))
          return callback(null, attempt);
      }
    }
    basedir = path.join(basedir, "..");
  }
  return callback(null, "notFound");
}
function readFileIfExists(path) {
  try {
    if (fs.existsSync(path))
      return fs.readFileSync(path);
    return null;
  } catch (e) {
    console.warn(e.stack);
    return null;
  }
}
