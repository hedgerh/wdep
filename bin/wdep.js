#!/usr/bin/env node

var npm = require('npm');
var path = require('path');
var fs = require('fs');
var argv = require('yargs').argv;
var Table = require('cli-table');
 
var table = new Table({
    head: ['name', 'description'], 
    colWidths: [20, 100]
});

npm.load(function(err, npm) {
  start(npm);
});

function start(npm) {
  // resolve filename
  var filename = (argv._.length) ? argv._[0] : 'package.json';
  var file = path.join(process.cwd(), filename);

  // attempt to read the file
  fs.readFile(file, 'utf8', function (err, pkgFile) {
    if (err) return process.stderr.write(err + '\n');
    pkgFile = JSON.parse(pkgFile);

    var modules = getModules(pkgFile.dependencies);

    // if dev flag is set, get devDependencies
    if (argv.dev) {
      modules = modules.concat(getModules(pkgFile.devDependencies));
    }

    var count = modules.length;
    modules.forEach(function (module) {
      // query npm for each module
      npm.commands.view([module, 'name', 'description'], true, function(err, data) {
        for (var key in data) {
          table.push([data[key].name, data[key].description]);
          count--;

          if (count === 0) {
            // sort alphabetically
            table.sort(function(a, b) {
              if (a[0] > b[0]) {
                return 1;
              } else if (a[0] < b[0]) {
                return -1;
              }

              return 0;
            });
            
            displayTable();
          }
        }
      });
    });
  });
}

function getModules(mods) {
  return Object.keys(mods).map(function(name) {
    return name;
  });
}

function displayTable() {
  console.log(table.toString());
}