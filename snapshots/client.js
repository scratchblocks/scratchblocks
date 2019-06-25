const scratchblocks = require("../browser")

scratchblocks.loadLanguages({
  de: require("../locales/de.json"),
})

window.render = function(source, options, scale) {
  var doc = scratchblocks.parse(source, {
    languages: options.lang ? ["en", options.lang] : ["en"],
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
