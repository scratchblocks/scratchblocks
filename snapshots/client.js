const scratchblocks = require("../browser")

window.render = function(source, options, scale) {
  var doc = scratchblocks.parse(source, {
    languages: options.lang ? ["en", options.lang] : ["en"],
    dialect: options.style === "scratch3" ? "scratch3" : "classic",
  })

  var view = scratchblocks.newView(doc, {
    style: options.style,
  })
  var svg = view.render()

  return new Promise(function(resolve) {
    view.toCanvas(function(canvas) {
      resolve(canvas.toDataURL("image/png"))
    }, scale)
  })
}
