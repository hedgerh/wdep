#!/usr/bin/env node

var npm = require('npm');
var path = require('path');
var fs = require('fs');
var argv = require('yargs').argv;
var Table = require('cli-table');
 
var table = new Table({
    head: ['name', 'description'], 
    colWidths: [20, 80]
});

npm.load(start);

function start(err, npm) {
  // resolve filenames
  var filename = (argv._.length) ? argv._[0] : 'package.json';
  var file = path.join(process.cwd(), filename);

  // attempt to read the file
  fs.readFile(file, 'utf8', function(err, packageFile) {
    if (err) {
      return console.error(err + '\n');
    }

    var pkg = JSON.parse(packageFile);

    var modules = Object.keys(pkg.dependencies);
    var devDependencies = Object.keys(pkg.devDependencies) || [];

    // if dev flag is set, include devDependencies
    if (argv.dev) {
      modules = dependencies.concat(devDependencies);
    }

    buildTable(modules);
  });
}

function buildTable(modules) {
  var count = modules.length;

  function queryNpm(module) {
    // query npm for module
    npm.commands.view([module, 'name', 'description'], true, _handleModule);
  }

  function _handleModule(err, module) {
    Object.keys(module).forEach(function(index) { 
      table.push([module[index].name, module[index].description]);
    });

    count--;

    // once all modules are retrie
    if (count === 0) {
      table.sort(sortByNameAscending);
      displayTable();
    }
  }

  modules.forEach(queryNpm);
}

function sortByNameAscending(elemA, elemB) {
  if (elemA[0] > elemB[0]) {
    return 1;
  } 

  if (elemA[0] < elemB[0]) {
    return -1;
  }

  return 0;
}

function displayTable() {
  console.log(table.toString());
}
