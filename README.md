# wdep
Renders a table with the names and descriptions of an npm package's dependencies.

![example table of dependencies from wdep](https://github.com/hedgerh/wdep/blob/master/doc/img/example.png)
-------
## Installation:
```
npm install -g wdep
```

## Usage:
Run anywhere within a project's folder tree, and wdep will find the package.json.
```
// specify a package
wdep [package] [options]

// current project
wdep [options]

Options:
  -d, --dev      Get only dev dependencies
  -p, --prod     Get only regular dependencies
  -h, --help     Show help                                             [boolean]
  -v, --version  Display version information                           [boolean]
```
