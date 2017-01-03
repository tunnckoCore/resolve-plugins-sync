'use strict'

module.exports = (filename, opts) => {
  if (typeof filename === 'object') {
    opts = filename
    filename = undefined
  }
  return {
    name: 'two',
    body: 'foo bar',
    opts: opts,
    filename: filename
  }
}
