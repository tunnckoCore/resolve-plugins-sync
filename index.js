/*!
 * resolve-plugins-sync <https://github.com/tunnckoCore/resolve-plugins-sync>
 *
 * Copyright (c) Charlike Mike Reagent <@tunnckoCore> (https://i.am.charlike.online)
 * Released under the MIT license.
 */

'use strict'

const path = require('path')
const { getInstalledPathSync } = require('get-installed-path')

/**
 * > Babel/Browserify-style resolve of a `plugins` array
 * and optional `opts` options object, where
 * each "plugin" (item in the array) can be
 * 1) string, 2) function, 3) object or 4) array.
 * Useful for loading complex and meaningful configs like
 * exactly all of them - Babel, ESLint, Browserify. It would
 * be great if they use that package one day :)
 * The [rolldown][] bundler already using it as default
 * resolution for resolving [rollup][] plugins. :)
 *
 * **Example**
 *
 * ```js
 * const resolve = require('resolve-plugins-sync')
 *
 * // fake
 * const baz = require('tool-plugin-baz')
 * const qux = require('tool-plugin-qux')
 *
 * resolve([
 *   'foo',
 *   ['bar', { some: 'options here' }],
 *   [baz, { a: 'b' }],
 *   qux
 * ], {
 *   prefix: 'tool-plugin-'
 * })
 * ```
 *
 * @name   resolvePluginsSync
 * @param  {Array|String} [plugins] array of "plugins/transforms/presets" or single string,
 *                                  which is arrayified so returned `result`
 *                                  is always an array
 * @param  {Object} opts optional custom configuration
 * @param  {String} `opts.prefix` useful like `babel-plugin-` or `rollup-plugin-`
 * @param  {Any} `opts.context` custom context to be passed to plugin function,
 *                              using the `.apply` method
 * @param  {Any} `opts.first` pass first argument for plugin function, if it is
 *                            given, then it will pass plugin options as 2nd argument,
 *                            that's useful for browserify-like transforms where
 *                            first argument is `filename`, second is transform `options`
 * @param  {Array} `opts.args` pass custom arguments to the resolved plugin function,
 *                             if given - respected more than `opts.first`
 * @return {Array} `result` resolved plugins, always an array
 * @api public
 */

const resolvePluginsSync = (plugins, opts) => {
  plugins = arrayify(plugins).filter(Boolean)

  if (!plugins.length) {
    return []
  }

  opts = Object.assign({ prefix: '', cwd: process.cwd() }, opts)

  return arrayify(plugins).map((plugin) => {
    // e.g. `plugins: ['foo', 'bar', 'baz']`
    if (typeof plugin === 'string') {
      return resolveFromString(opts, plugin)
    }

    // allows nesting and passing options to each plugin
    // e.g. `plugins: [ fn, ['foo', {opts: 'here'}], 'bar', quix() ]
    if (Array.isArray(plugin)) {
      return resolveFromArray(opts, plugin)
    }

    // e.g. `plugins: [fn1, fn2]`
    if (typeof plugin === 'function') {
      return plugin.apply(opts.context, opts.args)
    }

    // just pass to the tool, like Rollup expect each plugin
    // to return an object, so you can directly pass objects
    // e.g. `plugins: [{name: 'rollup-plugin-foo', transform: fn}]`
    if (typeof plugin === 'object') {
      return plugin
    }

    let message = 'Plugin item should be function, string, object or array'
    throw new TypeError(message)
  })
}

/**
 * > Make an array from any value.
 *
 * @param  {Any} `val` some long description
 * @return {Array}
 * @api private
 */

let arrayify = (val) => {
  if (!val) return []
  if (Array.isArray(val)) return val
  return [val]
}

/**
 * > Resolve a plugin from string. Below
 * example uses `rollup` plugins. Will find the
 * plugin if installed, require it and call it
 * without options been passed.
 *
 * **Example**
 *
 * ```js
 * const resolve = require('resolve-plugins-sync')
 * const plugins = [
 *   'commonjs',
 *   'node-resolve',
 *   'buble'
 * ]
 *
 * const result = resolve(plugins, {
 *   prefix: 'rollup-plugin-'
 * })
 * console.log(result) // => Array of objects
 * ```
 *
 * @param  {Object} `opts`
 * @return {String} `plugin`
 * @api private
 */

const resolveFromString = (opts, plugin) => {
  const func = resolver(opts, plugin)
  let argz = opts.args ? opts.args : [opts.first]

  return typeof func === 'function' ? func.apply(opts.context, argz) : func
}

/**
 * > Resolve a plugin from array. Below
 * example uses `rollup` plugins. Will find the
 * plugin if installed, require it and call it
 * with given options.
 *
 * First argument of the array
 * can be string (name of the plugin without the prefix)
 * or directly the plugin function.
 *
 * Second argument is optional, but can be `options`
 * object which will be passed to the resolved plugin.
 *
 * Very much how Babel and Browserify resolves their
 * transforms, presets and plugins.
 *
 * **Example**
 *
 * ```js
 * const resolve = require('resolve-plugins-sync')
 * const plugins = [
 *   'commonjs',
 *   ['node-resolve', { jsnext: true }],
 *   [buble, { target: { node: '4' } }]
 * ]
 *
 * const result = resolve(plugins, {
 *   prefix: 'rollup-plugin-'
 * })
 * console.log(result) // => Array of objects
 * ```
 *
 * @param  {Object} `opts`
 * @return {String} `plugin`
 * @api private
 */

const resolveFromArray = (opts, plugin) => {
  plugin = plugin.filter(Boolean)
  let second = opts.first ? plugin[1] : undefined
  let first = opts.first ? opts.first : plugin[1]
  let args = opts.args ? opts.args : [first, second]

  // e.g. `plugins: [ ['foo'], ['bar', opts] ]`
  if (typeof plugin[0] === 'string') {
    const res = resolver(opts, plugin[0])

    return typeof res === 'function' ? res.apply(opts.context, args) : res
  }
  // e.g. `plugins: [ [fn], [fn, opts] ]`
  if (typeof plugin[0] === 'function') {
    let fn = plugin[0]
    return fn.apply(opts.context, args)
  }
  // e.g. `plugins: [{ name: 'plugin-name', transform: fn }, { name: 'foo' }]`
  if (typeof plugin[0] === 'object') {
    return plugin[0]
  }

  let msg = 'First item of array should be function, string or object'
  throw new TypeError(msg)
}

function resolver (opts, item) {
  if (item.charAt(0) === '.') {
    return require(path.join(opts.cwd, item))
  }
  if (!item.startsWith(opts.prefix)) {
    item = opts.prefix + item
  }

  let filepath = null
  console.log(process.mainModule.paths)
  try {
    filepath = getInstalledPathSync(item, { local: true })
  } catch (e) {
    try {
      filepath = getInstalledPathSync(item)
    } catch (e) {
      console.log('x')
      return require(item)
    }
  }

  return require(filepath)
}

module.exports = resolvePluginsSync
