//For use in ATOM packages only.
//A simple cache wrapper around the parse.js functionality.
//We load the file, either from a tab if it exists or from file.
//We then hash the buffer and check against cache.

import {parseBuffer} from './parse';
import yshash from 'ys-hash';
import fs from 'fs';

var cache = new Map();

//Cache object type.
function CachedObject(parsedURI, hash) {
  this.parsedURI = parsedURI;
  this.hash = hash;
}

//Clear the cache.
export function clearCache() {
  cache.clear();
}

//We hash the buffer and check against cache.
//If the hashes are the same, we can return cached object.
export function parseURI(uri, callback) {
  var tab = getAtomTab(uri);

  if (tab) {
    return getFromCache(uri, tab.getText(), callback);
  } else {
    fs.readFile(uri, (error, buffer) => {
      if (error) return callback(error);
      else return getFromCache(uri, buffer, callback);
    });
  }

  //INTERNAL checkcache
  //Returns and possibly sets cached object.
  function getFromCache(uri, buffer) {
    let hash = yshash.hash(buffer);

    if (cache.get(uri) && cache.get(uri).hash == hash)
      return callback(null, cache.get(uri).parsedURI);

    return parseAndCache(uri, buffer, hash, callback);
  }

  //INTERNAL parseURI
  function parseAndCache(uri, buffer, hash, callback) {
    parseBuffer(buffer, uri, (error, parsedURI) => {
      if (error) return callback(error);

      let toCache = new CachedObject(parsedURI, hash);
      cache.set(uri, toCache);
      return callback(null, parsedURI);
    });
  }

  //INTERNAL parseURI
  function getAtomTab(uri) {
    let pane = atom.workspace.paneForUri(uri);
    return pane ? pane.itemForUri(uri) : undefined;
  }
}
