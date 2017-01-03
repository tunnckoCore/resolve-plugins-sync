'use strict'

module.exports = (name, body) => (filename, opts) => {
  if (typeof filename === 'object') {
    opts = filename
    filename = undefined
  }
  return {
    name: name,
    body: body,
    opts: opts,
    filename: filename
  }
}
