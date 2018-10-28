const scratchblocks = require("../browser")

window.render = function(script, lang, scale) {
  var doc = scratchblocks.parse(script, {
    languages: lang ? ["en", lang] : ["en"],
    dialect: "scratch3",
  })

  return new Promise(function(resolve) {
    doc.render(function(svg) {
      doc.toCanvas(function(canvas) {
        resolve(canvas.toDataURL("image/png"))
      }, scale)
    })
  })
}
