#!/usr/bin/env node

var colors = require('colors/safe');
var async = require('async');
var npm = require('npm');
var fs = require('fs');
var argv = require('yargs').argv;
var Table = require('cli-table');
var exec = require('sync-exec')

function start(err, npm) {
  try {
    var json = getPackageJson();
  } catch (e) {
    console.error(colors.red('Could not find package.json!'));
    process.exit(1);
  }
  var deps = Object.keys(json.dependencies || {});
  getRegistryData(deps, function(err, data) {
    if(err) {
     console.error(colors.red('Error fetching data from npm registry!'));
      process.exit(1);
    } else {
      renderTable(data);
    }
  });
}

function renderTable(data) {
  var table = new Table({
    head: ['name', 'description'], 
    colWidths: [20, 80]
  });
  data.forEach(function(a) {
    var module = a[Object.keys(a)];
    table.push([module.name, module.description]);
  });
  table.sort(sortByNameAscending);
  console.log(table.toString());
}

function getRegistryData(arr, cb) {
  npm.load(function(err) {
    if(err) {
      return cb(err);
    }
    async.map(arr, function(moduleName, done) {
      npm.commands.view([moduleName, 'name', 'description'], true, done);
    }, cb);
  });
}

function getPackageJson() {
  var root = exec('npm root').stdout;
  var bits = root.split('/');
  bits[bits.length - 1] = 'package.json'
  var packageJsonPath = bits.join('/');
  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
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

start();
