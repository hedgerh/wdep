#!/usr/bin/env node

var colors = require('colors/safe');
var async = require('async');
var npm = require('npm');
var fs = require('fs');
var Table = require('cli-table');
var exec = require('sync-exec');
var yargs = require('yargs');

// Command Line Interface
var argv = yargs.usage('Usage: $0 [options]', {
  'd': {
    description: 'Get only dev dependencies',
    requiresArg: false,
    short: 'd',
    alias: 'dev'
  },
  'p': {
    description: 'Get only regular dependencies',
    requiresArg: false,
    short: 'p',
    alias: 'prod'
  }
  })
  .alias('h', 'help')
  .alias('v', 'version')
  .help('help')
  .version('1.0.1', 'version', 'Display version information')
  .argv;

if (module.parent) {
  module.exports = start;
} else {
  if (argv._.length) {
    npm.load(function(err) {
      if(err) {
        return cb(err);
      }

      npm.commands.view([argv._[0], 'dependencies'], true, function(err, res) {
        start(argv, res);
      });
    });
  } else {
    start(argv);
  }
}

function start(opts, data) {
  var json = {};

  if (data) {
    var latestModuleVersion = Object.keys(data).pop();
    json = data[latestModuleVersion];
  } else {
    try {
      json = getPackageJson();
    } catch (e) {
      error('Could not find package.json!');
    }
  }

  var deps = [];

  if (!opts.dev) {
    deps.push({title: 'Dependencies', list: Object.keys(json.dependencies || {})});
  }
  if (!opts.prod) {
    deps.push({title: 'Dev Dependencies', list: Object.keys(json.devDependencies || {})});
  }

  deps.forEach(getRegistryData);
}

function getRegistryData(modules) {
  if (!modules.list.length) {
    return;
  }
  fetchRegistryData(modules.list, function(err, data) {
    if (err) {
      error('Error fetching data from npm registry!');
    } else {
      renderTable(modules.title, data);
    }
  });
}

function fetchRegistryData(arr, cb) {
  npm.load(function(err) {
    if(err) {
      return cb(err);
    }
    async.map(arr, function(moduleName, done) {
      npm.commands.view([moduleName, 'name', 'description'], true, done);
    }, cb);
  });
}

function renderTable(title, data) {
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
  console.log('\n' + colors.bold(title.toUpperCase()));
  console.log(table.toString());
}

function getPackageJson() {
  var root = exec('npm root').stdout;
  var bits = root.split('/');
  bits[bits.length - 1] = 'package.json'
  var packageJsonPath = bits.join('/');
  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
}

function sortAlphabetic(a, b) {
  if (a[0] > b[0]) {
    return 1;
  } 
  if (a[0] < b[0]) {
    return -1;
  }
  return 0;
}

function error(str) {
  console.error(colors.red('[ERROR] ' + str));
  process.exit(1);
}
