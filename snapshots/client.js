const scratchblocks = require("../browser")

window.render = function(source, lang, scale) {
  var doc = scratchblocks.parse(source, {
    languages: lang ? ["en", lang] : ["en"],
    dialect: "scratch3",
  })

  var view = scratchblocks.newView(doc)
  var svg = view.render()

  return new Promise(function(resolve) {
    view.toCanvas(function(canvas) {
      resolve(canvas.toDataURL("image/png"))
    }, scale)
  })
}
