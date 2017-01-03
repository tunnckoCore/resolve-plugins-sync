'use strict'

module.exports = (filename, opts) => {
  if (typeof filename === 'object') {
    opts = filename
    filename = undefined
  }
  return {
    name: 'one',
    body: 'abc',
    opts: opts,
    filename: filename
  }
}
