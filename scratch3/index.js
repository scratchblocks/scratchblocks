var SVG = require("./draw")
var blocks = require("./blocks")
var style = require("./style")

function init(window) {
  SVG.init(window)

  blocks.LabelView.measuring = (function() {
    var canvas = SVG.makeCanvas()
    return canvas.getContext("2d")
  })()
}

module.exports = {
  init: init,
  newView: blocks.newView,
  makeStyle: style.makeStyle,
}
