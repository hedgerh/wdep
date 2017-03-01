var test = require('tape')
var exec = require('child_process').exec

test('npm package does not exist', function (t) {
  t.plan(1)

  exec('node ./bin/wdep.js kdgsjagjd', function (error, stdout, stderror) {
    if (error) {
      console.error('execution error')
      t.end(error)
    }

    t.equal(stdout, 'Error: npm package does not exist!\n')
  })
})

test('local package exists', function (t) {
  t.plan(1)

  exec('node ./bin/wdep.js', function (error, stdout, stderror) {
    if (error) {
      console.error('execution error')
      t.end(error)
    }

    t.notEqual(stdout.indexOf('DEPENDENCIES'), -1)
  })
})


test('no package in relative directory', function (t) {
  t.plan(1)

  exec('node ./bin/wdep.js --f ./test/dummy', function (error, stdout, stderror) {
    if (error) {
      console.log(stderror)
      console.error('execution error')
      t.end(error)
    }

    t.equal(stdout, 'Could not find package.json!\n')
  })
})