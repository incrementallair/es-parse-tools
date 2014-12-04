//Bootstrap ES6 support.
import 'traceur/bin/traceur-runtime';
import {resolveModulePath} from './resolve';
import {parseURI} from './atom-cache';

module.exports = {
  parseURI,
  resolveModulePath
};
