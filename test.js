/*!
 * resolve-plugins-sync <https://github.com/tunnckoCore/resolve-plugins-sync>
 *
 * Copyright (c) Charlike Mike Reagent <@tunnckoCore> (http://i.am.charlike.online)
 * Released under the MIT license.
 */

/* jshint asi:true */

'use strict'

const test = require('mukla')
const resolve = require('./index')
const towie = require('./fixtures/foo-plugin-two')
const quxie = require('./fixtures/foo-plugin-quxie')

test('return empty array if falsey values or no `plugins` given', (done) => {
  test.strictEqual(resolve().length, 0)
  test.strictEqual(resolve('').length, 0)
  test.strictEqual(resolve(false).length, 0)
  test.strictEqual(resolve([null, false]).length, 0)
  done()
})

test('resolve single argument string as `plugins`', function (done) {
  const result = resolve('foo-plugin-one', { prefix: './fixtures/' })
  test.strictEqual(result.length, 1)
  test.strictEqual(result[0].name, 'one')
  done()
})

test('resolve if each item in `plugins` is string (+ opts.prefix)', function (done) {
  const res = resolve(['foo-plugin-one', 'foo-plugin-two'], {
    prefix: './fixtures/'
  })
  test.strictEqual(res.length, 2)

  const plugin1 = res[0]
  const plugin2 = res[1]

  test.strictEqual(plugin1.name, 'one')
  test.strictEqual(plugin1.body, 'abc')
  test.strictEqual(plugin2.name, 'two')
  test.strictEqual(plugin2.body, 'foo bar')
  done()
})

test('resolve if item in `plugins` is array', function (done) {
  const res = resolve([
    ['one', { a: 'b' }],
    [quxie, { xx: 'yy' }],
    ['two', { hoo: 'raay' }],
    ['quxie'],
    [towie],
    [{ name: 'barry' }]
  ], {
    prefix: './fixtures/foo-plugin-'
  })

  test.strictEqual(res.length, 6)

  test.strictEqual(res[0].name, 'one')
  test.strictEqual(res[0].opts.a, 'b')

  test.strictEqual(res[1].name, 'quxie')
  test.strictEqual(res[1].opts.xx, 'yy')

  test.strictEqual(res[2].name, 'two')
  test.strictEqual(res[2].opts.hoo, 'raay')

  test.strictEqual(res[3].name, 'quxie')
  test.strictEqual(res[3].opts, undefined)

  test.strictEqual(res[4].name, 'two')
  test.strictEqual(res[4].opts, undefined)

  test.strictEqual(res[5].name, 'barry')
  done()
})

test('resolve if item in `plugins` is string, function or object', function (done) {
  const plugins = resolve([
    './fixtures/foo-plugin-one',
    towie,
    { name: 'bar' }
  ])

  test.strictEqual(plugins.length, 3)
  test.strictEqual(plugins[0].name, 'one')
  test.strictEqual(plugins[1].name, 'two')
  test.strictEqual(plugins[2].name, 'bar')
  done()
})

test('throw err if item is array and 1st arg is not string, object or fn', function (done) {
  function fixture () {
    resolve([
      [123, { a: 'b' }]
    ])
  }

  test.throws(fixture, TypeError)
  test.throws(fixture, /First item of array should/)
  test.throws(fixture, /be function, string or object/)
  done()
})

test('throw err if item is not array, string, function or object', function (done) {
  function fixture () {
    resolve([
      123
    ])
  }

  test.throws(fixture, TypeError)
  test.throws(fixture, /Plugin item should be/)
  test.throws(fixture, /function, string, object or array/)
  done()
})
