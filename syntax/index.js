const { parse } = require('./syntax');

const { Label, Icon, Input, Block, Comment, Glow, Script, Document } = require('./model.js');

const { allLanguages, loadLanguages } = require('./blocks.js');

module.exports = {
  allLanguages,
  loadLanguages,

  parse,

  Label,
  Icon,
  Input,
  Block,
  Comment,
  Glow,
  Script,
  Document,
};
