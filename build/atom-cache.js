"use strict";
Object.defineProperties(exports, {
  clearCache: {get: function() {
      return clearCache;
    }},
  parseURI: {get: function() {
      return parseURI;
    }},
  __esModule: {value: true}
});
var $__parse__,
    $__ys_45_hash__,
    $__fs__;
var parseBuffer = ($__parse__ = require("./parse"), $__parse__ && $__parse__.__esModule && $__parse__ || {default: $__parse__}).parseBuffer;
var yshash = ($__ys_45_hash__ = require("ys-hash"), $__ys_45_hash__ && $__ys_45_hash__.__esModule && $__ys_45_hash__ || {default: $__ys_45_hash__}).default;
var fs = ($__fs__ = require("fs"), $__fs__ && $__fs__.__esModule && $__fs__ || {default: $__fs__}).default;
var cache = new Map();
function CachedObject(parsedURI, hash) {
  this.parsedURI = parsedURI;
  this.hash = hash;
}
function clearCache() {
  cache.clear();
}
function parseURI(uri, callback) {
  var tab = getAtomTab(uri);
  if (tab) {
    return getFromCache(uri, tab.getText(), callback);
  } else {
    fs.readFile(uri, (function(error, buffer) {
      if (error)
        return callback(error);
      else
        return getFromCache(uri, buffer, callback);
    }));
  }
  function getFromCache(uri, buffer) {
    var hash = yshash.hash(buffer);
    if (cache.get(uri) && cache.get(uri).hash == hash)
      return callback(null, cache.get(uri).parsedURI);
    return parseAndCache(uri, buffer, hash, callback);
  }
  function parseAndCache(uri, buffer, hash, callback) {
    parseBuffer(buffer, uri, (function(error, parsedURI) {
      if (error)
        return callback(error);
      var toCache = new CachedObject(parsedURI, hash);
      cache.set(uri, toCache);
      return callback(null, parsedURI);
    }));
  }
  function getAtomTab(uri) {
    var pane = atom.workspace.paneForUri(uri);
    return pane ? pane.itemForUri(uri) : undefined;
  }
}
