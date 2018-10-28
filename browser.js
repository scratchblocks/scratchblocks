var scratchblocks = (window.scratchblocks = module.exports = require("./scratch2")(
  window
))

// add our CSS to the page
var style = scratchblocks.makeStyle()
document.head.appendChild(style)
