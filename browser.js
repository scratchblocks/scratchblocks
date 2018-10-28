var scratchblocks = (window.scratchblocks = module.exports = require("./index")(
  window
))

// add our CSS to the page
var style = scratchblocks.makeStyle()
document.head.appendChild(style)
