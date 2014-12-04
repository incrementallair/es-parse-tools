//Bootstrap ES6 support.
require('traceur/bin/traceur-runtime');
import {resolveModulePath} from './resolve';
import {parseBuffer} from './parse';

module.exports = {
  parseBuffer,
  resolveModulePath
};
  
