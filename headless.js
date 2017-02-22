
var xmldom = require('xmldom');
var Canvas = require('canvas');

var window = {
  document: new xmldom.DOMImplementation().createDocument(),
  XMLSerializer: xmldom.XMLSerializer,
  DOMParser: xmldom.DOMParser,
};

function makeCanvas() {
  return new Canvas();
}

module.exports = require('./src/scratchblocks.js')(window, makeCanvas);

