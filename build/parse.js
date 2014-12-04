"use strict";
Object.defineProperties(exports, {
  parseBuffer: {get: function() {
      return parseBuffer;
    }},
  __esModule: {value: true}
});
var $__async__,
    $__esprima_45_fb__,
    $__escope__,
    $__estraverse__,
    $__resolve__;
var async = ($__async__ = require("async"), $__async__ && $__async__.__esModule && $__async__ || {default: $__async__}).default;
var esprima = ($__esprima_45_fb__ = require("esprima-fb"), $__esprima_45_fb__ && $__esprima_45_fb__.__esModule && $__esprima_45_fb__ || {default: $__esprima_45_fb__}).default;
var escope = ($__escope__ = require("escope"), $__escope__ && $__escope__.__esModule && $__escope__ || {default: $__escope__}).default;
var estraverse = ($__estraverse__ = require("estraverse"), $__estraverse__ && $__estraverse__.__esModule && $__estraverse__ || {default: $__estraverse__}).default;
var resolveModulePath = ($__resolve__ = require("./resolve"), $__resolve__ && $__resolve__.__esModule && $__resolve__ || {default: $__resolve__}).resolveModulePath;
function initialParse(buffer, path, callback) {
  var syntaxTree,
      scopes;
  try {
    syntaxTree = esprima.parse(buffer, {
      loc: true,
      tolerant: true
    });
    scopes = escope.analyze(syntaxTree, {ecmaVersion: 6}).scopes;
  } catch (error) {
    console.warn("Error parsing AST/scopes: " + error + " in " + path + "\nPossibly not an ES6 module.");
    return callback(error);
  }
  callback(null, {
    scopes: scopes,
    syntaxTree: syntaxTree
  });
}
function parseBuffer(buffer, path, callback) {
  initialParse(buffer, path, (function(error, parsedBuffer) {
    if (error)
      return callback(error);
    var $__13 = parsedBuffer,
        scopes = $__13.scopes,
        syntaxTree = $__13.syntaxTree;
    scopes.map((function(scope) {
      scope.path = path;
      scope.referencedSymbols = [];
      scope.importedSymbols = [];
      scope.exportedSymbols = [];
      scope.definedSymbols = [];
    }));
    scopes.map(decorateReferencedSymbols);
    scopes.map(decorateDefinedSymbols);
    decorateImportedSymbols(scopes[0], (function(error, _) {
      if (error)
        return callback(error);
      decorateExportedSymbols(scopes[0], (function(error, _) {
        if (error)
          return callback(error);
        scopes.map((function(scope) {
          scope.referencedSymbols = removeDuplicates(scope.referencedSymbols);
          scope.definedSymbols = removeDuplicates(scope.definedSymbols);
          scope.importedSymbols = removeDuplicates(scope.importedSymbols);
          scope.exportedSymbols = removeDuplicates(scope.exportedSymbols);
        }));
        return callback(null, scopes);
      }));
    }));
    function removeDuplicates(array) {
      return array.filter((function(value, ind) {
        return array.indexOf(value) == ind;
      }));
    }
  }));
}
function decorateExportedSymbols(scope, callback) {
  estraverse.traverse(scope.block, {enter: (function(node, parent) {
      if (node.type == "ExportDeclaration") {
        if (node.declaration) {
          parseExportDeclaration(node, scope, (function(error, parsedDecl) {
            if (error)
              callback(error);
            scope.exportedSymbols.push(parsedDecl);
          }));
        } else {
          for (var $__5 = node.specifiers[$traceurRuntime.toProperty(Symbol.iterator)](),
              $__6; !($__6 = $__5.next()).done; ) {
            var specifier = $__6.value;
            {
              parseExportSpecifier(specifier, node, scope, (function(error, parsedSpec) {
                if (error)
                  callback(error);
                scope.exportedSymbols.push(parsedSpec);
              }));
            }
          }
        }
      }
    })});
  return callback(null, null);
  function parseExportDeclaration(decl, scope, callback) {
    var result = {
      localName: null,
      exportName: null,
      importName: null,
      moduleRequest: "notFound",
      location: null,
      type: null
    };
    if (decl.declaration.type == "VariableDeclaration") {
      result.exportName = decl.declaration.declarations[0].id.name;
      result.location = decl.declaration.declarations[0].id.loc;
      result.localName = result.exportName;
      scope.referencedSymbols.push(decl.declaration.declarations[0].id);
    } else {
      if (decl.declaration.id) {
        result.exportName = decl.declaration.id.name;
        result.location = decl.declaration.id.loc;
        result.localName = result.exportName;
        scope.referencedSymbols.push(decl.declaration.id);
      } else {
        result.localName = "*default*";
        result.location = decl.declaration.loc;
      }
    }
    result.type = "exportDeclaration";
    if (decl.default)
      result.exportName = "default";
    return callback(null, result);
  }
  function parseExportSpecifier(spec, node, scope, callback) {
    var result = {
      importName: null,
      exportName: null,
      localName: null,
      importLocation: null,
      moduleRequest: "notFound",
      moduleLocation: null,
      type: "export"
    };
    switch (spec.type) {
      case "ExportSpecifier":
        result.importLocation = spec.id.loc;
        result.exportName = spec.name ? spec.name.name : spec.id.name;
        if (!result.moduleRequest)
          scope.referencedSymbols.push(spec.id);
        if (node.source) {
          result.importName = spec.id.name;
          result.moduleLocation = node.source.loc;
          resolveModulePath(scope.path, node.source.value, (function(error, moduleRequest) {
            if (!error) {
              result.moduleRequest = moduleRequest;
              return callback(null, result);
            }
          }));
        } else {
          result.localName = spec.id.name;
          scope.referencedSymbols.push(spec.id);
          return callback(null, result);
        }
        break;
      case "ExportBatchSpecifier":
        if (!node.source)
          return callback(new Error("Error: parsing export batch specifier without module source"));
        result.importName = "*";
        result.moduleLocation = node.source.loc;
        result.moduleRequest = resolveModulePath(scope.path, node.source.value, (function(error, moduleRequest) {
          if (!error) {
            result.moduleRequest = moduleRequest;
            return callback(null, result);
          }
        }));
        break;
      default:
        callback(new Error("Unknown export specifier type: " + spec.type));
    }
  }
}
function decorateDefinedSymbols(scope) {
  for (var $__7 = scope.variables[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__8; !($__8 = $__7.next()).done; ) {
    var variable = $__8.value;
    {
      for (var $__5 = variable.defs[$traceurRuntime.toProperty(Symbol.iterator)](),
          $__6; !($__6 = $__5.next()).done; ) {
        var definition = $__6.value;
        {
          if (!definition.name)
            continue;
          scope.definedSymbols.push({
            localName: definition.name.name,
            location: definition.name.loc,
            type: "defined"
          });
        }
      }
    }
  }
}
function decorateImportedSymbols(scope, callback) {
  estraverse.traverse(scope.block, {enter: (function(node, parent) {
      if (node.type == "ImportDeclaration") {
        if (node.specifiers.length === 0) {
          var parsedSpec = {
            importName: "*emptyImport*",
            localName: "*emptyImport*",
            location: null,
            moduleLocation: null,
            moduleRequest: "notFound",
            importLocation: node.loc,
            type: "import"
          };
          if (node.source) {
            parsedSpec.moduleLocation = node.source.loc;
            resolveModulePath(scope.path, node.source.value, (function(error, moduleRequest) {
              if (!error) {
                parsedSpec.moduleRequest = moduleRequest;
                return scope.importedSymbols.push(parsedSpec);
              }
            }));
          }
          return scope.importedSymbols.push(parsedSpec);
        }
        async.map(node.specifiers, (function(specifier, mapcb) {
          parseImportSpecifier(specifier, scope, (function(error, parsedSpec) {
            if (error)
              return console.warn(error);
            parsedSpec.importLocation = node.loc;
            parsedSpec.moduleLocation = node.source.loc;
            resolveModulePath(scope.path, node.source.value, (function(error, moduleRequest) {
              if (error)
                return console.warn(error);
              parsedSpec.moduleRequest = moduleRequest;
              scope.importedSymbols.push(parsedSpec);
              return mapcb(null, null);
            }));
          }));
        }), (function() {}));
      }
    })});
  return callback(null, null);
  function parseImportSpecifier(spec, scope, callback) {
    var parsedSpec = {
      importName: null,
      localName: null,
      location: null,
      moduleRequest: "unresolved",
      type: "import"
    };
    switch (spec.type) {
      case "ImportDefaultSpecifier":
        parsedSpec.importName = "default";
        parsedSpec.localName = spec.id.name;
        scope.referencedSymbols.push(spec.id);
        break;
      case "ImportSpecifier":
        parsedSpec.importName = spec.id.name;
        parsedSpec.localName = spec.name ? spec.name.name : spec.id.name;
        scope.referencedSymbols.push(spec.name ? spec.name : spec.id);
        break;
      case "ImportNamespaceSpecifier":
        parsedSpec.importName = "*";
        parsedSpec.localName = spec.id.name;
        scope.referencedSymbols.push(spec.id);
        break;
      default:
        console.warn("Unknown import specifier type: " + spec.type);
    }
    if (parsedSpec.importName && parsedSpec.localName) {
      parsedSpec.location = spec.name ? spec.name.loc : spec.id.loc;
      return callback(null, parsedSpec);
    }
  }
}
function decorateReferencedSymbols(scope) {
  for (var $__5 = scope.through[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__6; !($__6 = $__5.next()).done; ) {
    var reference = $__6.value;
    scope.referencedSymbols.push(reference.identifier);
  }
  for (var $__11 = scope.variables[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__12; !($__12 = $__11.next()).done; ) {
    var variable = $__12.value;
    {
      for (var $__7 = variable.references[$traceurRuntime.toProperty(Symbol.iterator)](),
          $__8; !($__8 = $__7.next()).done; ) {
        var reference$__14 = $__8.value;
        scope.referencedSymbols.push(reference$__14.identifier);
      }
      for (var $__9 = variable.identifiers[$traceurRuntime.toProperty(Symbol.iterator)](),
          $__10; !($__10 = $__9.next()).done; ) {
        var identifier = $__10.value;
        scope.referencedSymbols.push(identifier);
      }
    }
  }
  estraverse.traverse(scope.block, {enter: (function(node, parent) {
      if (node.type == 'MemberExpression') {
        var identifier = Object.create(node.property);
        identifier.property = getMemberExpressionString(node.property);
        identifier.object = getMemberExpressionString(node.object);
        identifier.name = identifier.object + "." + identifier.property;
        scope.referencedSymbols.push(identifier);
      }
    })});
}
function getMemberExpressionString(node) {
  if (node.type === "Identifier")
    return node.name;
  if (node.type === "MemberExpression") {
    var left = getMemberExpressionString(node.object);
    var right = getMemberExpressionString(node.property);
    return left + "." + right;
  }
  return null;
}
