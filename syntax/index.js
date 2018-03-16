const { parse } = require("./syntax")

const {
  Label,
  Icon,
  Input,
  Block,
  Comment,
  Script,
  Document,
} = require("./model.js")

module.exports = {
  parse,
  fromJSON: Document.fromJSON,

  Label,
  Icon,
  Input,
  Block,
  Comment,
  Script,
  Document,
}
