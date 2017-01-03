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
      return require(id)()
    }

    // allows nesting and passing options to each plugin
    // e.g. `plugins: [ fn, ['foo', {opts: 'here'}], 'bar', quix() ]
    if (Array.isArray(plugin)) {
      plugin = plugin.filter(Boolean)
      if (typeof plugin[0] === 'string') {
        let id = `${opts.prefix}${plugin[0]}`
        return require(id)(plugin[1])
      }
      if (typeof plugin[0] === 'function') {
        let fn = plugin[0]
        return fn(plugin[1])
      }
      if (typeof plugin[0] === 'object') {
        return plugin[0]
      }

      let msg = 'First item of array should be function, string or object'
      throw new TypeError(msg)
    }

    // allows `plugins: [fn1, fn2]`
    if (typeof plugin === 'function') {
      return plugin()
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
