import fs from 'fs';
import path from 'path';

//Resolve given module string from base path.
//We do this as follows:
//If a relative path resolve, just check it straight.
//Otherwise we backtrack looking for a package.json to get extra context.
//Sometimes things break because a main file was not automatically detected.
//See  ember, for instance.
//We try a variety of common paths along the way - /lib /src /build etc

//Node-style callback is resolved with module name on success, else error.
export function resolveModulePath(basePath, moduleString, callback) {
  var failsafeMax = 10; //backtrack limit
  var basedir = path.dirname(basePath);
  var baseext = path.extname(basePath);

  var _moduleString = moduleString;
  if (path.extname(moduleString) != baseext)
    _moduleString += baseext;

  var basemod, remmod; //base dir and remainder of given module string.
  var splitModule = _moduleString.split(path.sep);

  if (splitModule.length == 1 || splitModule[0] == '.') {
    if (splitModule[0] == '.')
      failsafeMax = 1; //don't backtrack for relative paths
    basemod = _moduleString;
    remmod = "";
  } else {
    basemod = splitModule[0];
    remmod = splitModule.splice(1).join(path.sep);
  }

  //Keep backtracking until we can't any more
  var failsafe = 0;
  while (basedir != path.sep && failsafe++ <= failsafeMax) {
    //Check for a package.json in the possible base module dir.
    //This might specify a directory.lib object which can tell us where the lib is.
    let libs = [""];
    let packagePath = path.join(basedir, basemod, "package.json");
    let packageJson = readFileIfExists(packagePath);
    if (packageJson && packageJson.directories) {
      if (packageJson.directories.dist)
        libs.push(packageJson.directories.dist);
        if (packageJson.directories.lib)
          libs.push(packageJson.directories.lib);
    }

    //See if we can find the file in this thing.
    for (let lib of libs) {
      let attempt = path.join(basedir, basemod, lib, remmod);
      if (fs.existsSync(attempt))
        return callback(null, attempt);
    }

    //backtrack
    basedir = path.join(basedir, "..");
  }

  return callback(null, "notFound");
}

function readFileIfExists(path) {
  try {
    if (fs.existsSync(path))
      return fs.readFileSync(path);
    return null;
  } catch(e) {
    console.warn(e.stack);
    return null;
  }
}
