'use strict'

module.exports = (filename, opts) => {
  if (typeof filename === 'object') {
    opts = filename
    filename = undefined
  }
  return {
    name: 'quxie',
    body: 'bazzy bear',
    opts: opts,
    filename: filename
  }
}
