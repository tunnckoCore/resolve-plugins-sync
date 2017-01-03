/*!
 * resolve-plugins-sync <https://github.com/tunnckoCore/resolve-plugins-sync>
 *
 * Copyright (c) Charlike Mike Reagent <@tunnckoCore> (http://i.am.charlike.online)
 * Released under the MIT license.
 */

'use strict'

const extend = require('extend-shallow')

const arrayify = (val) => {
  if (!val) return []
  if (Array.isArray(val)) return val
  return [val]
}

const resolvePluginsSync = (plugins, opts) => {
  plugins = arrayify(plugins).filter(Boolean)

  if (!plugins.length) {
    return []
  }

  opts = extend({ prefix: '' }, opts)

  return arrayify(plugins).map((plugin) => {
    // allows `plugins: ['foo', 'bar', 'baz']`
    if (typeof plugin === 'string') {
      let id = `${opts.prefix}${plugin}`
      let func = require(id)
      let argz = opts.args ? opts.args : [opts.first]
      return func.apply(opts.context, argz)
    }

    // allows nesting and passing options to each plugin
    // e.g. `plugins: [ fn, ['foo', {opts: 'here'}], 'bar', quix() ]
    if (Array.isArray(plugin)) {
      plugin = plugin.filter(Boolean)
      let second = opts.first ? plugin[1] : undefined
      let first = opts.first ? opts.first : plugin[1]
      let args = opts.args ? opts.args : [first, second]

      if (typeof plugin[0] === 'string') {
        let id = `${opts.prefix}${plugin[0]}`
        return require(id).apply(opts.context, args)
      }
      if (typeof plugin[0] === 'function') {
        let fn = plugin[0]
        return fn.apply(opts.context, args)
      }
      if (typeof plugin[0] === 'object') {
        return plugin[0]
      }

      let msg = 'First item of array should be function, string or object'
      throw new TypeError(msg)
    }

    // allows `plugins: [fn1, fn2]`
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

module.exports = resolvePluginsSync
