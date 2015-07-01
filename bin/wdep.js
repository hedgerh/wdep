#!/usr/bin/env node

var colors = require('colors/safe');
var async = require('async');
var npm = require('npm');
var fs = require('fs');
var argv = require('yargs').argv;
var Table = require('cli-table');
var exec = require('sync-exec');

if(module.parent) {
  module.exports = start;
} else {
  start(argv);
}

function start(err, npm) {
  try {
    var json = getPackageJson();
  } catch (e) {
    error('Could not find package.json!');
  }
  var deps = Object.keys(json.dependencies || {});
  getRegistryData(deps, function(err, data) {
    if(err) {
      error('Error fetching data from npm registry!');
    } else {
      renderTable(data);
    }
  });
}

function error(str) {
  console.error(colors.red('[ERROR] ') + colors.yellow(str));
  process.exit(1);
}

function renderTable(data) {
  var table = new Table({
    head: ['name', 'description'], 
    colWidths: [20, 80]
  });
  data.forEach(function(moduleVersions) {
    var latestModuleVersion = Object.keys(moduleVersions).pop();
    var moduleData = moduleVersions[latestModuleVersion];
    table.push([moduleData.name, moduleData.description]);
  });
  table.sort(sortAlphabetic);
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

function sortAlphabetic(elemA, elemB) {
  if (elemA[0] > elemB[0]) {
    return 1;
  } 
  if (elemA[0] < elemB[0]) {
    return -1;
  }
  return 0;
}
